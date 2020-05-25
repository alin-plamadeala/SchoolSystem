const User = require("../models/userModel");
const Group = require("../models/groupModel");
const Course = require("../models/courseModel");
const Assignment = require("../models/assignmentModel");
const AssignmentFile = require("../models/assignmentFiles");
const Submission = require("../models/submissionModel");
const SubmissionFile = require("../models/submissionFiles");
const Feedback = require("../models/feedbackModel");
const Announcement = require("../models/announcementModel");
const moment = require("moment");

const sanitizeHtml = require("sanitize-html");

const { roles } = require("../roles");

exports.createAssignment = async (req, res, next) => {
  res.render("createAssignment", {
    layout: "default",
    template: "home-template",
    title: "Create Assignment",
    user: res.locals.loggedInUser.toJSON(),
  });
};

exports.postAssignment = async (req, res, next) => {
  const { title, date, time, course, groups, description } = req.body;
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
  const deadline = moment(date + " " + time);
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
    var assignment = await Assignment.findByPk(assignmentId, {
      include: [{ model: AssignmentFile, as: "file" }],
    });
    assignment = assignment.toJSON();
    assignment.date = moment(assignment.deadline).format("YYYY-MM-DD");
    assignment.time = moment(assignment.deadline).format("HH:mm");
    res.render("editAssignment", {
      layout: "default",
      template: "home-template",
      title: "Edit Assignment",
      assignment: assignment,
      user: res.locals.loggedInUser.toJSON(),
    });
  } catch (error) {
    console.log(error);
    res.render("viewAssignment", {
      layout: "default",
      template: "home-template",
      title: "Assignment",
      user: res.locals.loggedInUser.toJSON(),
    });
  }
};

exports.saveEdits = async (req, res, next) => {
  const { id, title, date, time, description } = req.body;
  const file = req.file;
  var newFile;

  const deadline = moment(date + " " + time);

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

exports.createAnnouncement = async (req, res, next) => {
  const user = res.locals.loggedInUser;
  const departments = await Group.findAll({ where: { role: "teacher" } });
  var permission = roles.can(user.role).createAny("announcement");
  if (permission.granted) {
    return res.render("createAnnouncement", {
      layout: "default",
      title: "Create Announcement",
      user: res.locals.loggedInUser.toJSON(),
      departments: departments.map((department) => department.toJSON()),
    });
  } else {
    return res.status(401).render("error", {
      layout: false,
      title: "Error",
      message: "You don't have enough permission to perform this action",
    });
  }
};

exports.editAnnouncement = async (req, res, next) => {
  const { announcementId } = req.params;
  const user = res.locals.loggedInUser;
  const departments = await Group.findAll({ where: { role: "teacher" } });
  const announcement = await Announcement.findByPk(announcementId, {
    include: [{ model: User, as: "author" }, { model: Group }],
  });
  var permission = roles.can(user.role).updateAny("announcement");
  if (permission.granted === false) {
    if (announcement.authorId == user.id) {
      permission = roles.can(user.role).updateOwn("announcement");
    }
  }
  if (permission.granted) {
    return res.render("createAnnouncement", {
      layout: "default",
      title: "Edit Announcement",
      announcement: announcement.toJSON(),
      user: res.locals.loggedInUser.toJSON(),
      departments: departments.map((department) => department.toJSON()),
    });
  } else {
    return res.status(401).render("error", {
      layout: false,
      title: "Error",
      message: "You don't have enough permission to perform this action",
    });
  }
};

exports.saveAnnouncement = async (req, res, next) => {
  const user = res.locals.loggedInUser;
  var { announcementId, title, description, groups } = req.body;
  var descriptionClean = sanitizeHtml(description);
  if (!Array.isArray(groups)) {
    groups = [groups];
  }
  var groupsList = groups.filter(
    (value, index, self) => self.indexOf(value) === index
  );
  try {
    if (announcementId) {
      var announcement = await Announcement.update(
        {
          title,
          description: descriptionClean,
        },
        { where: { id: announcementId }, returning: true }
      );
      await announcement[1][0].setGroups(null);
      await announcement[1][0].setGroups(groupsList);
    } else {
      var announcement = await Announcement.create({
        title,
        description: descriptionClean,
        authorId: user.id,
      });
      await announcement.setGroups(groupsList);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }

  return res.redirect("/teacher/announcements");
};

exports.removeAnnouncement = async (req, res, next) => {
  const { announcementId } = req.params;
  const user = res.locals.loggedInUser;
  const announcement = await Announcement.findByPk(announcementId);
  var permission = roles.can(user.role).deleteAny("announcement");
  if (permission.granted === false) {
    if (announcement.authorId == user.id) {
      permission = roles.can(user.role).deleteOwn("announcement");
    }
  }
  if (permission.granted) {
    try {
      await announcement.destroy();
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
};

exports.viewAnnouncements = async (req, res, next) => {
  const user = res.locals.loggedInUser;
  const announcements = await Announcement.findAll({
    where: { authorId: user.id },
    include: [{ model: User, as: "author" }, { model: Group }],
    order: [["updatedAt", "DESC"]],
  });

  return res.render("viewAnnouncements", {
    layout: "default",
    user: res.locals.loggedInUser.toJSON(),
    title: "Announcements",
    announcements: announcements.map((announcement) => announcement.toJSON()),
  });
};
