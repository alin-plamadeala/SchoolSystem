const User = require("../models/userModel");
const Group = require("../models/groupModel");
const Course = require("../models/courseModel");

//page to display all student users
exports.getStudents = async (req, res, next) => {
  return res.render("listUsers", {
    layout: "default",
    title: "Students",
    template: "students",
    user: res.locals.loggedInUser.toJSON(),
  });
};
//page to display all teacher users
exports.getTeachers = async (req, res, next) => {
  return res.render("listUsers", {
    layout: "default",
    title: "Teachers",
    template: "teachers",
    user: res.locals.loggedInUser.toJSON(),
  });
};
//page to display all admin users
exports.getAdmins = async (req, res, next) => {
  return res.render("listUsers", {
    layout: "default",
    title: "Administrators",
    template: "administrators",
    user: res.locals.loggedInUser.toJSON(),
  });
};

//page to display all courses
exports.showCourses = async (req, res, next) => {
  res.render("listCourses", {
    layout: "default",
    title: "Courses",
    user: res.locals.loggedInUser.toJSON(),
  });
};

//page to display all student groups
exports.getStudentGroups = async (req, res, next) => {
  return res.render("listGroups", {
    layout: "default",
    title: "Groups",
    user: res.locals.loggedInUser.toJSON(),
  });
};

//page to display all teacher departments
exports.showTeacherDepartments = async (req, res, next) => {
  return res.render("listDepartments", {
    layout: "default",
    title: "Departments",
    user: res.locals.loggedInUser.toJSON(),
  });
};
