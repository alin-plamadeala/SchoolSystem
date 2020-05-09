const User = require("../models/userModel");
const Group = require("../models/groupModel");
const Course = require("../models/courseModel");
const Assignment = require("../models/assignmentModel");
const bcrypt = require("bcrypt");
const transporter = require("../transporter/transporter");

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

  if (Array.isArray(groups)) {
    var newAssignments = [];
    for (var i = 0; i < groups.length; i++) {
      newAssignments.push(
        await Assignment.create({
          title,
          deadline,
          description,
        })
      );
      await newAssignments[i].setCourse(course);
      await newAssignments[i].setGroup(groups[i]);
    }
    res.json({ message: newAssignments });
  } else {
    var newAssignment;
    newAssignment = await Assignment.create({
      title,
      deadline,
      description,
    });
    await newAssignment.setCourse(course);
    await newAssignment.setGroup(groups);
    res.json({ message: newAssignment });
  }
};
