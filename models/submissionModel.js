const { Sequelize } = require("sequelize");
const db = require("../config/database");
const Assignment = require("../models/assignmentModel");
const User = require("../models/userModel");

const Submission = db.define("submission", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  submissionText: {
    type: Sequelize.TEXT,
  },
  late: {
    type: Sequelize.BOOLEAN,
  },
});

Assignment.hasMany(Submission, {
  as: "submissions",
  foreignKey: "assignmentId",
});
Submission.belongsTo(User, { through: "studentId" });

module.exports = Submission;
