const { Sequelize } = require("sequelize");
const db = require("../config/database");
const Hash = db.define("hash", {
  hash: {
    type: Sequelize.STRING,
  },
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: "users", // name of Target model
      key: "id", // key in Target model that we're referencing
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  },
});

module.exports = Hash;
