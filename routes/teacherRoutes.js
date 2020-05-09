var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");
const dashboardController = require("../controllers/dashboardController");
const indexController = require("../controllers/indexController");
const confirmationController = require("../controllers/confirmationController");
const teacherController = require("../controllers/teacherController");

router.get("/createAssignment", teacherController.createAssignment);
router.post("/createAssignment", teacherController.postAssignment);

module.exports = router;
