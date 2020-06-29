const Group = require("../models/groupModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

exports.adminAccount = async () => {
  //create admin group
  await Group.findOrCreate({
    where: {
      id: 99999,
    },
    defaults: {
      name: "admin",
      role: "admin",
    },
  });

  //create admin account
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
