const { Sequelize } = require("sequelize");
const db = require("../config/database");
const Submission = require("../models/submissionModel");

const Feedback = db.define("feedback", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  feedbackText: {
    type: Sequelize.TEXT,
  },
  grade: {
    type: Sequelize.ENUM,
    values: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    allowNull: false,
  },
});

Submission.hasOne(Feedback);
Feedback.belongsTo(Submission);

module.exports = Feedback;
