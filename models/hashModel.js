// const { Sequelize } = require("sequelize");
// const db = require("../config/database");
// const User = require("../models/userModel");

// const Hash = db.define("hash", {
//   hash: {
//     type: Sequelize.STRING,
//   },
//   userId: {
//     type: Sequelize.INTEGER,
//     references: {
//       model: "user", // name of Target model
//       key: "id", // key in Target model that we're referencing
//     },
//     onUpdate: "CASCADE",
//     onDelete: "SET NULL",
//   },
// });

// Hash.hasOne(User, {
//   foreignKey: { name: "userId", allowNull: false },
// });
// User.belongsTo(Hash);

// module.exports = Hash;
