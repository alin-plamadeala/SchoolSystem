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

router.get("/createAssignment", teacherController.createAssignment);
router.post(
  "/createAssignment",
  upload.single("file"),
  teacherController.postAssignment
);

router.get(
  "/course/:courseId/group/:groupId",
  teacherController.showAssignments
);
router.get("/assignment/:assignmentId", teacherController.showAssignment);
router.get("/assignment/:assignmentId/edit", teacherController.editAssignment);
router.post(
  "/assignment/:assignmentId/edit",
  upload.single("file"),
  teacherController.saveEdits
);
router.delete(
  "/assignment/:assignmentId/delete",
  teacherController.deleteAssignment
);
router.get(
  "/assignment/:assignmentId/submissions",
  teacherController.showSubmissions
);

router.get(
  "/assignment/:assignmentId/submission/:submissionId",
  teacherController.showSubmission
);
router.post(
  "/assignment/:assignmentId/submission/:submissionId",
  teacherController.submitFeedback
);

router.get("/assignment/:assignmentId/download", teacherController.getFile);
router.get(
  "/assignment/:assignmentId/submission/:submissionId/download",
  teacherController.getSubmissionFile
);

module.exports = router;
