const { Sequelize } = require("sequelize");
const db = require("../config/database");
const Course = require("../models/courseModel");
const User = require("../models/userModel");

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
Group.hasMany(User, { as: "members", foreignKey: "groupId" });
User.belongsTo(Group);

module.exports = Group;
