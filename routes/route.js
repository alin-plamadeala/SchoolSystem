var express = require("express");
var router = express.Router();

let user = { name: "John Doe" };
let notifications = [
  {
    type: "bullhorn",
    text: "A new announcement was posted on Economics.",
    target: "/notif1",
  },
  {
    type: "comment",
    text: "You received feedback on Assignment ABC.",
    target: "/notif2",
  },
  {
    type: "tasks",
    text: "A new assignment has been posted in Accounting.",
    target: "/notif3",
  },
];

///////////////////////////////////////////////////////////////////
const userController = require("../controllers/userController");

router.get("/", userController.allowIfLoggedin, function (req, res, next) {
  res.render("index", {
    layout: "default",
    template: "home-template",
    user: user,
    notifications: notifications,
  });
});

router.get("/login", function (req, res, next) {
  res.render("login", {
    layout: "loginLayout",
  });
});

router.post("/signup", userController.signup);

router.post("/login", userController.login);

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
