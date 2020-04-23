var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
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

module.exports = router;
