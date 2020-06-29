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

//get all courses
router.get(
  "/api/courses",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "course"),
  apiController.getCourses
);

//get a course
router.get(
  "/api/courses/:courseId",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "course"),
  apiController.getCourse
);

// add or update course
router.post(
  "/api/courses",
  userController.allowIfLoggedin,
  userController.grantAccess("createAny", "course"),
  apiController.addUpdateCourse
);

//remove course
router.delete(
  "/api/courses/:courseId",
  userController.allowIfLoggedin,
  userController.grantAccess("deleteAny", "course"),
  apiController.removeCourse
);
//get all teachers
router.get(
  "/api/teachers",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "profile"),
  apiController.getTeachers
);

//get all groups
router.get(
  "/api/groups",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "group"),
  apiController.getGroups
);

//add or update a group
router.post(
  "/api/groups",
  userController.allowIfLoggedin,
  userController.grantAccess("createAny", "group"),
  apiController.addUpdateGroup
);

//Get a group
router.get(
  "/api/groups/:groupId",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "group"),
  apiController.getGroup
);
//Remove group
router.delete(
  "/api/groups/:groupId",
  userController.allowIfLoggedin,
  userController.grantAccess("deleteAny", "group"),
  apiController.removeGroup
);

//get all departments
router.get(
  "/api/departments",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "group"),
  apiController.getTeacherDepartments
);

//get a department
router.get(
  "/api/departments/:departmentId",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "group"),
  apiController.getTeacherDepartment
);

//add or update teacher department
router.post(
  "/api/departments",
  userController.allowIfLoggedin,
  userController.grantAccess("createAny", "group"),
  apiController.addUpdateDepartment
);

//remove department
router.delete(
  "/api/departments/:departmentId",
  userController.allowIfLoggedin,
  userController.grantAccess("deleteAny", "group"),
  apiController.removeDepartment
);

module.exports = router;
