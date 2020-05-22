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

module.exports = router;
