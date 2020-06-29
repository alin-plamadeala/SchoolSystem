const Announcement = require("../models/announcementModel");
const Assignment = require("../models/assignmentModel");
const Submission = require("../models/submissionModel");
const Feedback = require("../models/feedbackModel");
const Group = require("../models/groupModel");
const Course = require("../models/courseModel");
const User = require("../models/userModel");

exports.index = async (req, res, next) => {
  const user = res.locals.loggedInUser;
  if (user.role === "student") {
    const announcements = await Announcement.findAll({
      include: [
        { model: Group, where: { id: user.group.id } },
        { model: User, as: "author" },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });
    var assignments = await Assignment.findAll({
      where: { groupId: user.group.id },
      order: [["deadline", "ASC"]],
      limit: 5,
      include: [
        {
          model: Submission,
          as: "submissions",
          where: { userId: user.id },
          required: false,
          include: [{ model: Feedback }],
        },
        { model: Course, include: [{ model: User, as: "teacher" }] },
      ],
    });
    assignments = assignments.map((assignment) => {
      assignment = assignment.toJSON();
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

    res.render("indexStudent", {
      layout: "default",
      template: "home-template",
      user: res.locals.loggedInUser.toJSON(),
      title: "School System",
      announcements: announcements.map((announcement) => announcement.toJSON()),
      assignments: assignments,
    });
  } else if (user.role === "teacher") {
    const announcements = await Announcement.findAll({
      include: [
        { model: Group, where: { id: user.group.id } },
        { model: User, as: "author" },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });
    res.render("indexTeacher", {
      layout: "default",
      template: "home-template",
      user: res.locals.loggedInUser.toJSON(),
      title: "School System",
      announcements: announcements.map((announcement) => announcement.toJSON()),
      assignments: assignments,
    });
  } else if (user.role === "admin") {
    res.redirect("/users/students");
  }
};
