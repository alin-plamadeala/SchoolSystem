var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");
const indexController = require("../controllers/indexController");
const confirmationController = require("../controllers/confirmationController");

router.get("/", userController.allowIfLoggedin, indexController.index);

router.get("/login", userController.loginPage);
router.post("/login", userController.login);
router.get("/logout", userController.logout);

router.get("/forgotPassword", userController.forgotPassword);
router.post("/forgotPassword", userController.resetPassword);

router.get(
  "/confirmResetPassword",
  confirmationController.getConfirmPasswordReset
);

router.post(
  "/confirmResetPassword",
  confirmationController.postConfirmPasswordReset
);

router.post("/signup", userController.signup);

router.get(
  "/myprofile",
  userController.allowIfLoggedin,
  userController.getEditProfile
);
router.post(
  "/myprofile",
  userController.allowIfLoggedin,
  userController.postEditProfile
);

router.get("/confirmEmail", confirmationController.getConfirmEmail);
router.post("/confirmEmail", confirmationController.postConfirmEmail);

router.get(
  "/user/:userId",
  userController.allowIfLoggedin,
  userController.getUser
);

router.get(
  "/users",
  userController.allowIfLoggedin,
  userController.grantAccess("readAny", "profile"),
  userController.getUsers
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
