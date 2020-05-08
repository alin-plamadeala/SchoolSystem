const { Sequelize } = require("sequelize");
const db = require("../config/database");
const Course = require("../models/courseModel");

const Group = db.define("group", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  role: {
    type: Sequelize.ENUM,
    values: ["student", "teacher", "admin"],
  },
});

Course.belongsToMany(Group, { through: "group_course" });
Group.belongsToMany(Course, { through: "group_course" });

module.exports = Group;
