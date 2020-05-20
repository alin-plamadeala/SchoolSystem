const { Sequelize } = require("sequelize");
const db = require("../config/database");
const Submission = require("./submissionModel");

const SubmissionFiles = db.define("submission_files", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  originalName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

Submission.belongsTo(SubmissionFiles, { as: "file" });
module.exports = SubmissionFiles;
