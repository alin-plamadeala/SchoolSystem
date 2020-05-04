var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");
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
  userController.getStudents
);

//List of Teachers
router.get(
  "/users/teachers",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "profile"),
  userController.getTeachers
);

//List of Admins
router.get(
  "/users/admins",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "profile"),
  userController.getAdmins
);

//List of teachers
router.get(
  "/users/teachers",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "profile"),
  userController.getTeachers
);

//List of admins
router.get(
  "/users/admins",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "profile"),
  userController.getAdmins
);

//Add user
router.post(
  "/users/submit",
  userController.allowIfLoggedin,
  userController.grantAccess("createAny", "profile"),
  userController.addUser
);

//Add user list
router.post(
  "/users/submitList",
  userController.allowIfLoggedin,
  userController.grantAccess("createAny", "profile"),
  userController.addUserList
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
