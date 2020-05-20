const User = require("../models/userModel");
const Group = require("../models/groupModel");
const Course = require("../models/courseModel");
const Assignment = require("../models/assignmentModel");
const AssignmentFile = require("../models/assignmentFiles");
const Submission = require("../models/submissionModel");
const SubmissionFile = require("../models/submissionFiles");
const Feedback = require("../models/feedbackModel");

const sanitizeHtml = require("sanitize-html");

exports.createAssignment = async (req, res, next) => {
  res.render("createAssignment", {
    layout: "default",
    template: "home-template",
    title: "Create Assignment",
    user: res.locals.loggedInUser.toJSON(),
  });
};

exports.postAssignment = async (req, res, next) => {
  const { title, deadline, course, groups, description } = req.body;
  const file = req.file;
  var newFile;
  if (file) {
    newFile = await AssignmentFile.create({
      name: file.filename,
      originalName: file.originalname,
    });
  }
  //sanitize description html
  var descriptionClean = sanitizeHtml(description);
  if (Array.isArray(groups)) {
    var newAssignments = [];
    for (var i = 0; i < groups.length; i++) {
      newAssignments.push(
        await Assignment.create({
          title,
          deadline,
          description: descriptionClean,
        })
      );
      await newAssignments[i].setCourse(course);
      await newAssignments[i].setGroup(groups[i]);
      await newAssignments[i].setFile(newFile);
    }
    res.render("createAssignment", {
      layout: "default",
      template: "home-template",
      title: "Assignment Created",
      user: res.locals.loggedInUser.toJSON(),
      confirmation: true,
    });
  } else {
    var newAssignment;
    newAssignment = await Assignment.create(
      {
        title,
        deadline,
        description: descriptionClean,
      },
      { include: [Group, Course] }
    );
    await newAssignment.setCourse(course);
    await newAssignment.setGroup(groups);
    await newAssignment.setFile(newFile);

    res.render("createAssignment", {
      layout: "default",
      template: "home-template",
      title: "Assignment Created",
      user: res.locals.loggedInUser.toJSON(),
      confirmation: true,
    });
  }
};

exports.editAssignment = async (req, res, next) => {
  const { assignmentId } = req.params;
  try {
    const assignment = await Assignment.findByPk(assignmentId, {
      include: [{ model: AssignmentFile, as: "file" }],
    });
    res.render("editAssignment", {
      layout: "default",
      template: "home-template",
      title: "Edit Assignment",
      assignment: assignment.toJSON(),
      user: res.locals.loggedInUser.toJSON(),
    });
  } catch (error) {
    res.render("viewAssignment", {
      layout: "default",
      template: "home-template",
      title: "Assignment",
      user: res.locals.loggedInUser.toJSON(),
    });
  }
};

exports.saveEdits = async (req, res, next) => {
  const { id, title, deadline, description } = req.body;
  const file = req.file;
  var newFile;
  console.log({ id, title, deadline, description });

  //sanitize description html
  var descriptionClean = sanitizeHtml(description);
  if (file) {
    newFile = await AssignmentFile.create({
      name: file.filename,
      originalName: file.originalname,
    });
    await Assignment.update(
      {
        title: title,
        deadline: deadline,
        description: descriptionClean,
        fileId: newFile.id,
      },
      { where: { id: id } }
    );
  } else {
    await Assignment.update(
      {
        title: title,
        deadline: deadline,
        description: descriptionClean,
      },
      { where: { id: id } }
    );
  }

  res.redirect(`../${id}`);
};

exports.deleteAssignment = async (req, res, next) => {
  const { assignmentId } = req.params;

  Assignment.destroy({ where: { id: assignmentId } }).then(res.status(200));
};
exports.showAssignments = async (req, res, next) => {
  const { courseId, groupId } = req.params;
  console.log({ courseId, groupId });
  const course = await Course.findByPk(courseId, { attributes: ["name"] });
  const group = await Group.findByPk(groupId, { attributes: ["name"] });

  const assignments = await Assignment.findAll({
    where: { courseId, groupId },
    order: [["deadline", "ASC"]],
  });
  const activeAssignments = assignments.filter(
    (assignments) => assignments.active
  );
  const inactiveAssignments = assignments.filter(
    (assignments) => !assignments.active
  );
  res.render("viewAssignments", {
    layout: "default",
    template: "home-template",
    title: "View assignments",
    user: res.locals.loggedInUser.toJSON(),
    course: course.toJSON(),
    group: group.toJSON(),
    activeAssignments: activeAssignments.map((assignment) =>
      assignment.toJSON()
    ),
    inactiveAssignments: inactiveAssignments.map((assignment) =>
      assignment.toJSON()
    ),
  });
};

exports.showAssignment = async (req, res, next) => {
  const { assignmentId } = req.params;

  try {
    const assignment = await Assignment.findByPk(assignmentId, {
      include: [
        { model: Group },
        { model: Course },
        { model: AssignmentFile, as: "file" },
      ],
    });
    // assignment.description.replace("&", "&amp;");
    res.render("viewAssignment", {
      layout: "default",
      template: "home-template",
      title: "Assignment " + assignment.title,
      user: res.locals.loggedInUser.toJSON(),
      assignment: assignment.toJSON(),
    });
  } catch (error) {
    res.render("viewAssignment", {
      layout: "default",
      template: "home-template",
      title: "Assignment",
      user: res.locals.loggedInUser.toJSON(),
    });
  }
};

exports.showSubmissions = async (req, res, next) => {
  const { assignmentId } = req.params;
  const assignment = await Assignment.findByPk(assignmentId, {
    attributes: ["title", "groupId"],
  });
  const students = await User.findAll({
    where: { groupId: assignment.groupId },
    attributes: ["id", "firstName", "lastName", "groupId"],
    order: [
      ["lastName", "ASC"],
      ["firstName", "ASC"],
    ],
  });
  const submissions = await Submission.findAll({
    where: { assignmentId },
    include: [{ model: Feedback }],
  });

  var students_submissions = students.map((student) => {
    student = student.toJSON();
    student.submission = submissions.filter(
      (submission) => submission.userId == student.id
    );
    if (student.submission.length > 0) {
      student.submission = student.submission[0].toJSON();
    }

    return student;
  });

  res.render("viewSubmissions", {
    layout: "default",
    user: res.locals.loggedInUser.toJSON(),
    students_submissions,
  });
};

exports.showSubmission = async (req, res, next) => {
  const { assignmentId, submissionId } = req.params;

  const assignment = await Assignment.findByPk(assignmentId, {
    include: [{ model: Course, attributes: ["name"] }],
  });
  const submission = await Submission.findByPk(submissionId, {
    include: [
      { model: Feedback },
      { model: SubmissionFile, as: "file" },
      {
        model: User,
        attributes: ["firstName", "lastName"],
        include: [{ model: Group, attributes: ["name"] }],
      },
    ],
  });

  res.render("viewSubmission", {
    layout: "default",
    user: res.locals.loggedInUser.toJSON(),
    assignment: assignment.toJSON(),
    submission: submission.toJSON(),
  });
};

exports.submitFeedback = async (req, res, next) => {
  const { submissionId } = req.params;
  const { grade, feedbackText } = req.body;

  var feedbackTextClean = sanitizeHtml(feedbackText);

  const newFeedback = await Feedback.create({
    feedbackText: feedbackTextClean,
    grade,
    submissionId,
  });

  res.redirect("back");
};

exports.getFile = async (req, res, next) => {
  const { assignmentId } = req.params;
  const assignment = await Assignment.findByPk(assignmentId, {
    include: [{ model: AssignmentFile, as: "file" }],
  });
  const file = assignment.file;
  const returnedFile = `${__basedir}/uploads/${file.name}`;
  res.download(returnedFile, file.originalName); // Set disposition and send it.
};

exports.getSubmissionFile = async (req, res, next) => {
  const { assignmentId, submissionId } = req.params;

  const submission = await Submission.findByPk(submissionId, {
    include: [{ model: SubmissionFile, as: "file" }],
  });
  const file = submission.file;
  const returnedFile = `${__basedir}/uploads/${file.name}`;
  res.download(returnedFile, file.originalName);
};
