var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");
const dashboardController = require("../controllers/dashboardController");

//List of Students
router.get(
  "/users/students",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "profile"),
  dashboardController.getStudents
);

//List of Teachers
router.get(
  "/users/teachers",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "profile"),
  dashboardController.getTeachers
);

//List of Admins
router.get(
  "/users/admins",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "profile"),
  dashboardController.getAdmins
);
//Add user
router.post(
  "/users/submit",
  userController.allowIfLoggedin,
  userController.grantAccess("createAny", "profile"),
  dashboardController.addUser
);

//Get User
router.get(
  "/users/get/:userId",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "profile"),
  dashboardController.getUser
);

//Remove User
router.delete(
  "/users/remove/:userId",
  userController.allowIfLoggedin,
  userController.grantAccess("deleteAny", "profile"),
  dashboardController.removeUser
);
//Add user list
router.post(
  "/users/submitList",
  userController.allowIfLoggedin,
  userController.grantAccess("createAny", "profile"),
  dashboardController.addUserList
);
//List all courses
router.get(
  "/courses",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "course"),
  dashboardController.getCourses
);
//Add course
router.post(
  "/courses/submit",
  userController.allowIfLoggedin,
  userController.grantAccess("createAny", "course"),
  dashboardController.addCourse
);

//List student groups
router.get(
  "/groups",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "group"),
  dashboardController.getStudentGroups
);
//Add group
router.post(
  "/groups/submit",
  userController.allowIfLoggedin,
  userController.grantAccess("createAny", "group"),
  dashboardController.addGroup
);

//List teacher departments
router.get(
  "/departments",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "group"),
  dashboardController.getTeacherDepartments
);

//Add teacher department
router.post(
  "/departments/submit",
  userController.allowIfLoggedin,
  userController.grantAccess("createAny", "group"),
  dashboardController.addDepartment
);

module.exports = router;
