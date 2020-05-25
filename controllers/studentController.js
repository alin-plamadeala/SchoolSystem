const User = require("../models/userModel");
const Group = require("../models/groupModel");
const Course = require("../models/courseModel");
const Assignment = require("../models/assignmentModel");
const AssignmentFile = require("../models/assignmentFiles");
const Submission = require("../models/submissionModel");
const SubmissionFile = require("../models/submissionFiles");
const Feedback = require("../models/feedbackModel");
const Announcement = require("../models/announcementModel");
const sanitizeHtml = require("sanitize-html");
const moment = require("moment");

const { roles } = require("../roles");

exports.showAssignments = async (req, res, next) => {
  const { courseId } = req.params;
  const user = res.locals.loggedInUser;
  const course = await Course.findByPk(courseId, {
    attributes: ["name"],
    include: [{ model: Group }],
  });
  const groupId = user.group.id;
  var assignments = await Assignment.findAll({
    where: { courseId, groupId },
    order: [["deadline", "ASC"]],
    include: [
      {
        model: Submission,
        as: "submissions",
        where: { userId: user.id },
        required: false,
        include: [{ model: Feedback }],
      },
    ],
  });
  assignments = assignments.map((assignment) => {
    assignment = assignment.toJSON();
    console.log(assignment);
    if (assignment.submissions.length) {
      if (assignment.submissions[0].feedback) {
        assignment.status = "Feedback Available";
      } else {
        assignment.status = "Submitted";
      }
    } else {
      if (assignment.deadline < Date.now()) {
        assignment.status = "Overdue";
      } else {
        assignment.status = "Not submitted";
      }
    }
    return assignment;
  });
  try {
    var permission = roles.can(user.role).readAny("course");
    if (permission.granted === false) {
      if (course.groups.map((group) => group.id).includes(user.groupId)) {
        permission = roles.can(user.role).readOwn("course");
      }
    }
    if (permission.granted) {
      res.render("viewAssignmentsStudent", {
        layout: "default",
        template: "home-template",
        title: "View assignments",
        user: res.locals.loggedInUser.toJSON(),
        course: course.toJSON(),
        assignments: assignments,
      });
    } else {
      return res.status(401).render("error", {
        layout: false,
        title: "Error",
        message: "You don't have enough permission to perform this action",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "error" });
    console.log(error);
  }
};

exports.showAssignment = async (req, res, next) => {
  const { assignmentId } = req.params;
  const user = res.locals.loggedInUser;
  try {
    const assignment = await Assignment.findByPk(assignmentId, {
      include: [
        { model: AssignmentFile, as: "file" },
        {
          model: Submission,
          as: "submissions",
          where: { userId: user.id },
          required: false,
          include: [{ model: Feedback }, { model: SubmissionFile, as: "file" }],
        },
      ],
    });

    var permission = roles.can(user.role).readAny("assignment");
    if (permission.granted === false) {
      if (assignment.groupId == user.groupId) {
        permission = roles.can(user.role).readOwn("assignment");
      }
    }
    if (permission.granted) {
      res.render("viewAssignmentStudent", {
        layout: "default",
        template: "home-template",
        title: "Assignment " + assignment.title,
        user: res.locals.loggedInUser.toJSON(),
        assignment: assignment.toJSON(),
      });
    } else {
      res.render("error", {
        layout: false,
        template: "home-template",
        title: "Error",
        message: "Access Denied",
      });
    }
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

exports.submitAssignment = async (req, res, next) => {
  const { submissionId, submissionText, fileId, updateFile } = req.body;
  const file = req.file;
  const user = res.locals.loggedInUser;
  const assignmentId = req.params.assignmentId;

  const assignmentDeadline = await Assignment.findByPk(assignmentId, {
    attributes: ["deadline"],
  }).get("deadline");

  var late = false;
  if (Date.now() > assignmentDeadline) {
    late = true;
  }

  var submission;
  if (submissionId) {
    //Returns array with the instance and boolean true if row created
    submission = await Submission.upsert(
      { id: submissionId, submissionText, late },
      { returning: true }
    );
    //get the instance from array
    submission = submission[0];
  } else {
    submission = await Submission.create({
      assignmentId,
      submissionText,
      userId: user.id,
      late,
    });
  }

  var newFile;
  if (updateFile) {
    if (file) {
      if (fileId) {
        //Returns array with the instance and boolean true if row created
        newFile = await SubmissionFile.upsert(
          {
            id: fileId,
            name: file.filename,
            originalName: file.originalname,
          },
          { returning: true }
        );
        //get the instance from array
        newFile = newFile[0];
      } else {
        newFile = await SubmissionFile.create({
          name: file.filename,
          originalName: file.originalname,
        });
      }

      await submission.setFile(newFile);
    } else {
      await submission.setFile(null);
    }
  }

  res.redirect(`./${assignmentId}`);
};

exports.getAssignmentFile = async (req, res, next) => {
  const { assignmentId } = req.params;
  const assignment = await Assignment.findByPk(assignmentId, {
    include: [{ model: AssignmentFile, as: "file" }],
  });
  const file = assignment.file;
  const returnedFile = `${__basedir}/uploads/${file.name}`;
  res.download(returnedFile, file.originalName); // Set disposition and send it.
};
exports.getSubmissionFile = async (req, res, next) => {
  const { submissionId } = req.params;
  const submission = await Submission.findByPk(submissionId, {
    include: [{ model: SubmissionFile, as: "file" }],
  });
  const file = submission.file;
  const returnedFile = `${__basedir}/uploads/${file.name}`;

  var permission = roles
    .can(res.locals.loggedInUser.role)
    .readAny("submission");
  if (permission.granted === false) {
    if (submission.userId == res.locals.loggedInUser.id) {
      permission = roles
        .can(res.locals.loggedInUser.role)
        .readOwn("submission");
    }
  }
  if (permission.granted) {
    try {
      res.download(returnedFile, file.originalName); // Set disposition and send it.
    } catch (error) {
      console.log(error);
    }
  } else {
    res.render("error", {
      layout: false,
      template: "home-template",
      title: "Error",
      message: "Access Denied",
    });
  }
};

exports.viewAnnouncements = async (req, res, next) => {
  const user = res.locals.loggedInUser;

  const announcements = await Announcement.findAll({
    include: [
      { model: Group, where: { id: user.group.id } },
      { model: User, as: "author" },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.render("viewAnnouncementsStudent", {
    layout: "default",
    template: "home-template",
    user: res.locals.loggedInUser.toJSON(),
    title: "Announcements",
    announcements: announcements.map((announcement) => announcement.toJSON()),
  });
};
