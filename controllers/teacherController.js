const User = require("../models/userModel");
const Group = require("../models/groupModel");
const Course = require("../models/courseModel");
const Assignment = require("../models/assignmentModel");
const AssignmentFile = require("../models/assignmentFiles");

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
        description,
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
    assignment.description.replace("&", "&amp;");
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

exports.getFile = async (req, res, next) => {
  const file = `${__basedir}/uploads/8ff438f26aaf5560eb21664502b16c3575fc.zip`;
  res.download(file); // Set disposition and send it.
};
