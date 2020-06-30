var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");
const dashboardController = require("../controllers/dashboardController");
const indexController = require("../controllers/indexController");
const confirmationController = require("../controllers/confirmationController");
const studentController = require("../controllers/studentController");
const crypto = require("crypto");
const path = require("path");
const multer = require("multer");
const allowedFileTypes = [
  "msword", //.doc
  "vnd.openxmlformats-officedocument.wordprocessingml.document", //.docx
  "csv", // .csv
  "jpeg", // .jpg .jpeg
  "png", // .png
  "pdf", // .pdf
  "vnd.ms-powerpoint", // .ppt
  "vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "vnd.rar", // .rar
  "rtf", // .rtf
  "plain", // .txt
  "vnd.ms-excel", // . xls
  "vnd.openxmlformats-officedocument.spreadsheetml.sheet", // . xlsx
  "zip", // .zip
  "x-zip-compressed", //zip
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const mimetypeArray = file.mimetype.split("/");
    console.log(mimetypeArray);
    if (allowedFileTypes.includes(mimetypeArray[mimetypeArray.length - 1])) {
      const fileName = crypto.randomBytes(18).toString("hex");

      cb(null, fileName + path.extname(file.originalname));
    } else {
      cb("Error: The file type is not allowed");
    }
  },
});
const upload = multer({ storage: storage });

router.get(
  "/course/:courseId",
  userController.allowIfLoggedin,
  studentController.showAssignments
);

router.get(
  "/assignment/:assignmentId",
  userController.allowIfLoggedin,
  studentController.showAssignment
);

router.post(
  "/assignment/:assignmentId",
  upload.single("file"),
  userController.allowIfLoggedin,
  studentController.submitAssignment
);

//get assignment file
router.get(
  "/assignment/:assignmentId/download",
  userController.allowIfLoggedin,
  studentController.getAssignmentFile
);

//get submission file
router.get(
  "/submission/:submissionId",
  userController.allowIfLoggedin,
  studentController.getSubmissionFile
);

//view announcements
router.get(
  "/announcements",
  userController.allowIfLoggedin,
  studentController.viewAnnouncements
);

router.get("/chat", userController.allowIfLoggedin, studentController.chat);

module.exports = router;
