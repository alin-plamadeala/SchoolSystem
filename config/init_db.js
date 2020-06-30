const User = require("../models/userModel");
const Course = require("../models/courseModel");
const Group = require("../models/groupModel");
const Hash = require("../models/hashModel");
const AssignmentFile = require("../models/assignmentFiles");
const Assignment = require("../models/assignmentModel");
const Submission = require("../models/submissionModel");
const SubmissionFile = require("../models/submissionFiles");
const Feedback = require("../models/feedbackModel");
const Announcement = require("../models/announcementModel");

const bcrypt = require("bcrypt");

exports.init = async () => {
  await Group.sync();
  await User.sync();
  await Hash.sync();
  await Course.sync();
  await AssignmentFile.sync();
  await Assignment.sync();
  await SubmissionFile.sync();
  await Submission.sync();
  await Feedback.sync();
  await Announcement.sync();

  await adminAccount();
};

adminAccount = async () => {
  //create admin group
  await Group.findOrCreate({
    where: {
      id: 99999,
    },
    defaults: {
      name: "admin",
      role: "admin",
    },
  });

  //create admin account
  await User.findOrCreate({
    where: {
      email: "admin@admin.com",
    },
    defaults: {
      firstName: "Admin",
      lastName: "Admin",
      email: "admin@admin.com",
      role: "admin",
      groupId: 99999,
      password: await bcrypt.hash("administrator", 10),
    },
  });
};
