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
    attributes: ["firstName", "lastName", "email"],
  });
  res.render("listUsers", {
    layout: "default",
    user: res.locals.loggedInUser.toJSON(),
    userList: students.map((student) => student.toJSON()),
    role: "student",
  });
};
//return all teacher users
exports.getTeachers = async (req, res, next) => {
  const students = await User.findAll({
    where: { role: "teacher" },
    attributes: ["firstName", "lastName", "email"],
  });
  res.render("listUsers", {
    layout: "default",
    user: res.locals.loggedInUser.toJSON(),
    userList: students.map((student) => student.toJSON()),
    role: "teacher",
  });
};
//return all admin users
exports.getAdmins = async (req, res, next) => {
  const students = await User.findAll({
    where: { role: "admin" },
    attributes: ["firstName", "lastName", "email"],
  });
  res.render("listUsers", {
    layout: "default",
    user: res.locals.loggedInUser.toJSON(),
    userList: students.map((student) => student.toJSON()),
    role: "admin",
  });
};

//add a user
exports.addUser = async (req, res, next) => {
  try {
    const { fullName, email, role } = req.body;
    const name = fullName.split(" ");
    const firstName = name[0];
    const lastName = fullName.substring(name[0].length).trim();

    if (!firstName || !lastName || !email) {
      res.status(400).json({
        title: "Error",
        message: "Please provide valid name and email",
      });
    } else if (
      await User.count({ where: { email: email } }).then((count) => {
        if (count > 0) {
          return true;
        } else {
          return false;
        }
      })
    ) {
      res.status(400).json({
        title: "Error",
        message: "Email already in use",
      });
    } else {
      const password = Math.random().toString(36).slice(-8);
      const hashedPassword = await hashPassword(password);
      const newUser = await User.create({
        firstName,
        lastName,
        email,
        role,
        password: hashedPassword,
      });
      transporter.createAccount(newUser, password);
      res.json({
        data: newUser,
      });
    }
  } catch (error) {
    next(error);
  }
};

//import multiple users
exports.addUserList = async (req, res, next) => {
  try {
    const { csvResult, role } = req.body;
    let newUserList = [];
    let errors = [];
    for (var i = 0, len = csvResult.length; i < len; i++) {
      const name = csvResult[i][0].split(" ");
      const firstName = name[0];
      const lastName = csvResult[i][0].substring(name[0].length).trim();
      const email = csvResult[i][1];
      if (!firstName || !lastName) {
        errors.push({ error: "Invalid name", index: i });
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
      newUserList.push({ firstName, lastName, email, role });
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
//return all courses
exports.getCourses = async (req, res, next) => {
  const courses = await Course.findAll({
    attributes: ["id", "name"],
    include: [
      {
        model: User,
        as: "teacher",
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: Group,
        attributes: ["id"],
      },
    ],
  });
  const teachers = await User.findAll({
    where: { role: "teacher" },
    attributes: ["id", "firstName", "lastName"],
  });
  const groups = await Group.findAll({
    where: { role: "student" },
    attributes: ["id", "name"],
  });
  res.render("listCourses", {
    layout: "default",
    user: res.locals.loggedInUser.toJSON(),
    courseList: courses.map((course) => course.toJSON()),
    teachersList: teachers.map((teacher) => teacher.toJSON()),
    groupsList: groups.map((group) => group.toJSON()),
  });
};
//add a course
exports.addCourse = async (req, res, next) => {
  try {
    const { name, teacherId } = req.body;

    if (!name || !teacherId) {
      res.status(400).json({
        title: "Error",
        message: "Please provide valid name and teacher",
      });
    } else {
      const newCourse = await Course.create({
        name,
        teacherId,
      });
      res.json({
        data: newCourse,
      });
    }
  } catch (error) {
    next(error);
  }
};
//return all student groups
exports.getStudentGroups = async (req, res, next) => {
  const groups = await Group.findAll({
    where: { role: "student" },
    attributes: ["id", "name"],
    include: [
      {
        model: Course,
        attributes: ["id", "name"],
        include: [
          {
            model: User,
            as: "teacher",
            attributes: ["id", "firstName", "lastName"],
          },
        ],
      },
    ],
  });
  const courses = await Course.findAll({
    attributes: ["id", "name"],
    include: [
      {
        model: User,
        as: "teacher",
        attributes: ["id", "firstName", "lastName"],
      },
    ],
  });
  const teachers = await User.findAll({
    where: { role: "teacher" },
    attributes: ["id", "firstName", "lastName"],
  });

  res.render("listGroups", {
    layout: "default",
    user: res.locals.loggedInUser.toJSON(),
    role: "student",
    courseList: courses.map((course) => course.toJSON()),
    groupsList: groups.map((group) => group.toJSON()),
    teachersList: teachers.map((teacher) => teacher.toJSON()),
  });
};
//add a group
exports.addGroup = async (req, res, next) => {
  try {
    const { name, role, courses } = req.body;
    if (!name) {
      res.status(400).json({
        title: "Error",
        message: "Please provide valid name",
      });
    } else {
      const newGroup = await Group.create({
        name,
        role,
      });
      await newGroup.setCourses(courses);

      res.json({
        data: newGroup,
      });
    }
  } catch (error) {
    next(error);
  }
};
