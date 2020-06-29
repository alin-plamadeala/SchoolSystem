const User = require("../models/userModel");
const Group = require("../models/groupModel");
const Course = require("../models/courseModel");
const bcrypt = require("bcrypt");
const transporter = require("../transporter/transporter");

//encrypt the password
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

//return all student users
exports.getStudents = async (req, res, next) => {
  const students = await User.findAll({
    where: { role: "student" },
    attributes: ["id", "firstName", "lastName", "email"],
    order: [
      ["lastName", "ASC"],
      ["firstName", "ASC"],
    ],
    include: { model: Group, attributes: ["id", "name"] },
  });
  const groups = await Group.findAll({
    where: { role: "student" },
    attributes: ["id", "name"],
  });
  res.render("listUsers", {
    layout: "default",
    user: res.locals.loggedInUser.toJSON(),
    userList: students.map((student) => student.toJSON()),
    groupsList: groups.map((group) => group.toJSON()),
    role: "student",
  });
};
//return all teacher users
exports.getTeachers = async (req, res, next) => {
  const teachers = await User.findAll({
    where: { role: "teacher" },
    attributes: ["id", "firstName", "lastName", "email"],
    order: [
      ["lastName", "ASC"],
      ["firstName", "ASC"],
    ],
    include: { model: Group, attributes: ["id", "name"] },
  });
  const groups = await Group.findAll({
    where: { role: "teacher" },
    attributes: ["id", "name"],
  });
  res.render("listUsers", {
    layout: "default",
    user: res.locals.loggedInUser.toJSON(),
    userList: teachers.map((teacher) => teacher.toJSON()),
    groupsList: groups.map((group) => group.toJSON()),
    role: "teacher",
  });
};
//return all admin users
exports.getAdmins = async (req, res, next) => {
  const admins = await User.findAll({
    where: { role: "admin" },
    attributes: ["id", "firstName", "lastName", "email"],
    order: [
      ["lastName", "ASC"],
      ["firstName", "ASC"],
    ],
    include: { model: Group, attributes: ["id", "name"] },
  });
  const groups = await Group.findAll({
    where: { role: "admin" },
    attributes: ["id", "name"],
  });
  res.render("listUsers", {
    layout: "default",
    user: res.locals.loggedInUser.toJSON(),
    userList: admins.map((admin) => admin.toJSON()),
    groupsList: groups.map((group) => group.toJSON()),
    role: "admin",
  });
};

//add a user
exports.addUser = async (req, res, next) => {
  try {
    const { id, fullName, email, role, group } = req.body;
    const name = fullName.split(" ");
    const firstName = name[0];
    const lastName = fullName.substring(name[0].length).trim();
    var editedUser = { email: "undefined" };
    if (id) {
      editedUser = await User.findByPk(id);
    }

    if (!firstName || !lastName || !email) {
      res.status(400).json({
        title: "Error",
        message: "Please provide valid name and email",
      });
    } else if (!group) {
      res.status(400).json({
        title: "Error",
        message: "Please select a group",
      });
    } else if (
      (await User.count({ where: { email: email } }).then((count) => {
        if (count > 0) {
          return true;
        } else {
          return false;
        }
      })) &&
      email != editedUser.email
    ) {
      res.status(400).json({
        title: "Error",
        message: "Email already in use",
      });
    } else {
      if (id) {
        const updatedUser = await User.update(
          { firstName, lastName, email, groupId: group },
          { where: { id } }
        );
        res.json({
          data: updatedUser,
        });
      } else {
        const password = Math.random().toString(36).slice(-8);
        const hashedPassword = await hashPassword(password);
        const newUser = await User.create({
          firstName,
          lastName,
          email,
          role,
          groupId: group,
          password: hashedPassword,
        });
        transporter.createAccount(newUser, password);
        res.json({
          data: newUser,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

//import multiple users
exports.addUserList = async (req, res, next) => {
  try {
    const { csvResult, role, group } = req.body;
    console.log(group);
    let newUserList = [];
    let errors = [];
    for (var i = 0, len = csvResult.length; i < len; i++) {
      const name = csvResult[i][0].split(" ");
      const firstName = name[0];
      const lastName = csvResult[i][0].substring(name[0].length).trim();
      const email = csvResult[i][1];
      if (!firstName || !lastName) {
        errors.push({ error: "Invalid name", index: i });
      } else if (isNaN(group)) {
        errors.push({ error: "Select group", index: i });
      } else if (!email) {
        errors.push({ error: "Invalid email", index: i });
      } else if (
        await User.count({ where: { email: email } }).then((count) => {
          if (count > 0) {
            return true;
          } else {
            return false;
          }
        })
      ) {
        errors.push({ error: "Email already in use", index: i });
      }
      newUserList.push({ firstName, lastName, email, role, group });
    }
    if (errors.length === 0) {
      for (var i = 0, len = newUserList.length; i < len; i++) {
        user = newUserList[i];
        const password = Math.random().toString(36).slice(-8);
        const hashedPassword = await hashPassword(password);
        user.password = hashedPassword;
        newUser = await User.create({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password,
          role: user.role,
          groupId: user.group,
        });
        transporter.createAccount(newUser, password);
      }
      res.status(200).json({ message: "Accounts created" });
    } else {
      res.status(400).json({ errors });
    }
  } catch (error) {
    next(error);
  }
};

//remove user
exports.removeUser = async (req, res, next) => {
  const { userId } = req.params;

  try {
    await User.destroy({ where: { id: userId } });
  } catch (error) {
    next(error);
  }
};

//get user
exports.getUser = async (req, res, next) => {
  const { userId } = req.params;

  try {
    user = await User.findByPk(userId, {
      attributes: ["id", "firstName", "lastName", "email", "groupId"],
      include: { model: Group, attributes: ["id", "name"] },
    });
    if (user) {
      res.json(user.toJSON());
    } else {
      res.json({ message: "not found" });
    }
  } catch (error) {
    next(error);
  }
};

//page to display all courses
exports.showCourses = async (req, res, next) => {
  res.render("listCourses", {
    layout: "default",
    user: res.locals.loggedInUser.toJSON(),
  });
};

//page to display all student groups
exports.getStudentGroups = async (req, res, next) => {
  res.render("listGroups", {
    layout: "default",
    user: res.locals.loggedInUser.toJSON(),
  });
};

//page to display all teacher departments
exports.showTeacherDepartments = async (req, res, next) => {
  res.render("listDepartments", {
    layout: "default",
    user: res.locals.loggedInUser.toJSON(),
  });
};
