const { Sequelize } = require("sequelize");
const db = require("../config/database");
const Submission = require("../models/submissionModel");

const Feedback = db.define("feedback", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
  },
  feedbackText: {
    type: Sequelize.TEXT,
  },
  status: { type: Sequelize.STRING },
  feedbackDate: {
    type: Sequelize.DATE,
  },
});

Feedback.belongsTo(Submission);

module.exports = Feedback;
