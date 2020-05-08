var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");
const dashboardController = require("../controllers/dashboardController");
const indexController = require("../controllers/indexController");
const confirmationController = require("../controllers/confirmationController");

//authentication page
router
  .get("/login", userController.loginPage)
  .post("/login", userController.login);

//logout endpoint
router.get("/logout", userController.logout);

//forgot password page
router
  .get("/forgotPassword", userController.forgotPassword)
  .post("/forgotPassword", userController.resetPassword);

//Confirm new password page
router
  .get("/confirmResetPassword", confirmationController.getConfirmPasswordReset)
  .post(
    "/confirmResetPassword",
    confirmationController.postConfirmPasswordReset
  );

//frontpage
router.get("/", userController.allowIfLoggedin, indexController.index);

//Edit profile page
router
  .get(
    "/myprofile",
    userController.allowIfLoggedin,
    userController.grantAccess("readOwn", "profile"),
    userController.getEditProfile
  )
  .post(
    "/myprofile",
    userController.allowIfLoggedin,
    userController.grantAccess("updateOwn", "profile"),
    userController.postEditProfile
  );

//Confirm change of email
router
  .get("/confirmEmail", confirmationController.getConfirmEmail)
  .post("/confirmEmail", confirmationController.postConfirmEmail);

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
  "/groups/students",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "group"),
  dashboardController.getStudentGroups
);
//Add group
//List student groups
router.post(
  "/groups/submit",
  userController.allowIfLoggedin,
  userController.grantAccess("createAny", "group"),
  dashboardController.addGroup
);

router.get(
  "/user/:userId",
  userController.allowIfLoggedin,
  userController.getUser
);

router.put(
  "/user/:userId",
  userController.allowIfLoggedin,
  userController.grantAccess("updateAny", "profile"),
  userController.updateUser
);

router.delete(
  "/user/:userId",
  userController.allowIfLoggedin,
  userController.grantAccess("deleteAny", "profile"),
  userController.deleteUser
);

module.exports = router;
