const { Sequelize } = require("sequelize");
const db = require("../config/database");
const Group = require("../models/groupModel");
const Course = require("../models/courseModel");

const Assignment = db.define("assignment", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
  },
  deadline: {
    type: Sequelize.DATE,
    allowNull: false,
  },
});

Group.hasMany(Assignment, { as: "groupAssignments", foreignKey: "groupId" });
Course.hasMany(Assignment, { as: "courseAssignments", foreignKey: "courseId" });
Assignment.belongsTo(Group);
Assignment.belongsTo(Course);

module.exports = Assignment;
