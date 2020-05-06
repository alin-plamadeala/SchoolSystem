const { Sequelize } = require("sequelize");
require("dotenv").config();

module.exports = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: "localhost",
    dialect: "postgres",
    logging: false,
  }
);
