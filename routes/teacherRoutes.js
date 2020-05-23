var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");
const dashboardController = require("../controllers/dashboardController");
const indexController = require("../controllers/indexController");
const confirmationController = require("../controllers/confirmationController");
const teacherController = require("../controllers/teacherController");
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
  "/createAssignment",
  userController.allowIfLoggedin,
  teacherController.createAssignment
);
router.post(
  "/createAssignment",
  upload.single("file"),
  userController.allowIfLoggedin,
  teacherController.postAssignment
);

router.get(
  "/course/:courseId/group/:groupId",
  userController.allowIfLoggedin,
  teacherController.showAssignments
);
router.get(
  "/assignment/:assignmentId",
  userController.allowIfLoggedin,
  teacherController.showAssignment
);
router.get(
  "/assignment/:assignmentId/edit",
  userController.allowIfLoggedin,
  teacherController.editAssignment
);
router.post(
  "/assignment/:assignmentId/edit",
  upload.single("file"),
  userController.allowIfLoggedin,
  teacherController.saveEdits
);
router.delete(
  "/assignment/:assignmentId/delete",
  userController.allowIfLoggedin,
  teacherController.deleteAssignment
);
router.get(
  "/assignment/:assignmentId/submissions",
  userController.allowIfLoggedin,
  teacherController.showSubmissions
);

router.get(
  "/assignment/:assignmentId/submission/:submissionId",
  userController.allowIfLoggedin,
  teacherController.showSubmission
);
router.post(
  "/assignment/:assignmentId/submission/:submissionId",
  userController.allowIfLoggedin,
  teacherController.submitFeedback
);

router.get(
  "/assignment/:assignmentId/download",
  userController.allowIfLoggedin,
  teacherController.getFile
);
router.get(
  "/assignment/:assignmentId/submission/:submissionId/download",
  userController.allowIfLoggedin,
  teacherController.getSubmissionFile
);

module.exports = router;
