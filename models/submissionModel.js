const { Sequelize } = require("sequelize");
const db = require("../config/database");
const Assignment = require("../models/assignmentModel");
const User = require("../models/userModel");

const Submission = db.define("submission", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
  },
  submitDate: {
    type: Sequelize.DATE,
  },
  submissionText: {
    type: Sequelize.TEXT,
  },
  files: {
    type: Sequelize.STRING,
  },
});

Assignment.hasMany(Submission, {
  as: "submissions",
  foreignKey: "assignmentId",
});
Submission.belongsTo(User, { through: "studentId" });

module.exports = Submission;
