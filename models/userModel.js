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
  fullName: {
    type: Sequelize.VIRTUAL,
    get() {
      return `${this.firstName} ${this.lastName}`;
    },
    set(value) {
      throw new Error("Do not try to set the `fullName` value!");
    },
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
