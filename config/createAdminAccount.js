const Group = require("../models/groupModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

//create admin group

//create admin account
exports.adminAccount = async () => {
  await Group.findOrCreate({
    where: {
      id: 99999,
    },
    defaults: {
      name: "admin",
      role: "admin",
    },
  });
  await User.findOrCreate({
    where: {
      email: "admin@admin.com",
    },
    defaults: {
      firstName: "Admin",
      lastName: "Admin",
      email: "admin@admin.com",
      role: "admin",
      groupId: 99999,
      password: await bcrypt.hash("administrator", 10),
    },
  });
};
