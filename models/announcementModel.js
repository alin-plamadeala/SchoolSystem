const { Sequelize } = require("sequelize");
const db = require("../config/database");
const Group = require("../models/groupModel");
const User = require("../models/userModel");

const Announcement = db.define("announcement", {
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
    allowNull: false,
  },
});

Announcement.belongsToMany(Group, { through: "group_announcement" });
Group.belongsToMany(Announcement, { through: "group_announcement" });

Announcement.belongsTo(User, { as: "author", onDelete: "CASCADE" });
User.hasMany(Announcement, {
  foreignKey: { name: "authorId", allowNull: false },
  onDelete: "CASCADE",
});

module.exports = Announcement;
