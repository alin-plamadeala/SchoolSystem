const { Sequelize } = require("sequelize");
const db = require("../config/database");
const User = require("../models/userModel");

const Course = db.define("course", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

Course.belongsTo(User, { as: "teacher" });

module.exports = Course;
