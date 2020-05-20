const User = require("../models/userModel");
const Group = require("../models/groupModel");
const Course = require("../models/courseModel");
const Assignment = require("../models/assignmentModel");
const AssignmentFile = require("../models/assignmentFiles");
const Submission = require("../models/submissionModel");
const SubmissionFile = require("../models/submissionFiles");
const Feedback = require("../models/feedbackModel");
const sanitizeHtml = require("sanitize-html");
const moment = require("moment");

exports.showAssignments = async (req, res, next) => {
  const { courseId } = req.params;
  const user = res.locals.loggedInUser;
  const course = await Course.findByPk(courseId, { attributes: ["name"] });
  const groupId = user.group.id;
  const assignments = await Assignment.findAll({
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
  //TODO sort assignments ///include: [{ model: Feedback }]
  //---------------------------
  //   var overdueAssignments;
  //   var activeAssignments;
  //   var awaitingFeedbackAssignments;
  //   var finishedAssignments;
  //   assignments.forEach((assignment)=>{
  //       if
  //   })
  //    assignments.filter((assignment) =>
  //     moment(assignment.deadline).isBefore(moment())
  //   );
  //   const inactiveAssignments = assignments.filter(
  //     (assignments) => !assignments.active
  //   );
  //   res.json(assignments);
  res.render("viewAssignmentsStudent", {
    layout: "default",
    template: "home-template",
    title: "View assignments",
    user: res.locals.loggedInUser.toJSON(),
    course: course.toJSON(),
    assignments: assignments.map((assignment) => assignment.toJSON()),
  });
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
    res.render("viewAssignmentStudent", {
      layout: "default",
      template: "home-template",
      title: "Assignment " + assignment.title,
      user: res.locals.loggedInUser.toJSON(),
      assignment: assignment.toJSON(),
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
  res.download(returnedFile, file.originalName); // Set disposition and send it.
};
