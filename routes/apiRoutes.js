var express = require("express");
var router = express.Router();

const apiController = require("../controllers/apiController");
const userController = require("../controllers/userController");

//get current user
router.get(
  "/current-user",
  userController.allowIfLoggedin,
  userController.currentUser
);

//get all students
router.get(
  "/students",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "profile"),
  apiController.getStudents
);

//get all teachers
router.get(
  "/teachers",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "profile"),
  apiController.getTeachers
);

//get all administrators
router.get(
  "/administrators",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "profile"),
  apiController.getAdmins
);

//Get User
router.get(
  "/user/:userId",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "profile"),
  apiController.getUser
);

//Add or update user
router.post(
  "/user",
  userController.allowIfLoggedin,
  userController.grantAccess("createAny", "profile"),
  apiController.addUser
);

//Add user list
router.post(
  "/user/submitList",
  userController.allowIfLoggedin,
  userController.grantAccess("createAny", "profile"),
  apiController.addUserList
);

//Remove User
router.delete(
  "/user/:userId",
  userController.allowIfLoggedin,
  userController.grantAccess("deleteAny", "profile"),
  apiController.removeUser
);

//get all courses
router.get(
  "/courses",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "course"),
  apiController.getCourses
);

//get a course
router.get(
  "/courses/:courseId",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "course"),
  apiController.getCourse
);

// add or update course
router.post(
  "/courses",
  userController.allowIfLoggedin,
  userController.grantAccess("createAny", "course"),
  apiController.addUpdateCourse
);

//remove course
router.delete(
  "/courses/:courseId",
  userController.allowIfLoggedin,
  userController.grantAccess("deleteAny", "course"),
  apiController.removeCourse
);

// get all admin groups
router.get(
  "/admingroups",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "group"),
  apiController.getAdminGroups
);

//get all groups
router.get(
  "/groups",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "group"),
  apiController.getGroups
);

//add or update a group
router.post(
  "/groups",
  userController.allowIfLoggedin,
  userController.grantAccess("createAny", "group"),
  apiController.addUpdateGroup
);

//Get a group
router.get(
  "/groups/:groupId",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "group"),
  apiController.getGroup
);
//Remove group
router.delete(
  "/groups/:groupId",
  userController.allowIfLoggedin,
  userController.grantAccess("deleteAny", "group"),
  apiController.removeGroup
);

//get all departments
router.get(
  "/departments",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "group"),
  apiController.getTeacherDepartments
);

//get a department
router.get(
  "/departments/:departmentId",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "group"),
  apiController.getTeacherDepartment
);

//add or update teacher department
router.post(
  "/departments",
  userController.allowIfLoggedin,
  userController.grantAccess("createAny", "group"),
  apiController.addUpdateDepartment
);

//remove department
router.delete(
  "/departments/:departmentId",
  userController.allowIfLoggedin,
  userController.grantAccess("deleteAny", "group"),
  apiController.removeDepartment
);

module.exports = router;
