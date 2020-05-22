const { Sequelize } = require("sequelize");
const db = require("../config/database");

const User = db.define("user", {
  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  newEmail: {
    type: Sequelize.STRING,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  role: {
    type: Sequelize.ENUM,
    values: ["student", "teacher", "admin"],
    allowNull: false,
  },
});

module.exports = User;
