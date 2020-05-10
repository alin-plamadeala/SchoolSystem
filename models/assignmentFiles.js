const { Sequelize } = require("sequelize");
const db = require("../config/database");
const Assignment = require("../models/assignmentModel");

const AssignmentFile = db.define("assignment_files", {
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

Assignment.belongsTo(AssignmentFile, { as: "file" });

module.exports = AssignmentFile;
