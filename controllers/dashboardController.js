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
    const { id, name, teacherId } = req.body;

    if (!name || !teacherId) {
      res.status(400).json({
        title: "Error",
        message: "Please provide valid name and teacher",
      });
    } else {
      if (id) {
        const updatedCourse = await Course.update(
          { name, teacherId },
          { where: { id } }
        );
        res.json({
          data: updatedCourse,
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
    }
  } catch (error) {
    next(error);
  }
};

// get a course
exports.getCourse = async (req, res, next) => {
  const { courseId } = req.params;

  try {
    course = await Course.findByPk(courseId, {
      attributes: ["id", "name"],
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });
    if (course) {
      res.json(course.toJSON());
    } else {
      res.json({ message: "not found" });
    }
  } catch (error) {
    next(error);
  }
};
//remove course
exports.removeCourse = async (req, res, next) => {
  const { courseId } = req.params;

  try {
    await Course.destroy({ where: { id: courseId } });
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
    const { id, name, role, courses } = req.body;
    if (!name) {
      res.status(400).json({
        title: "Error",
        message: "Please provide valid name",
      });
    } else {
      if (id) {
        const updatedGroup = await Group.update(
          {
            name,
          },
          { returning: true, where: { id } }
        );
        await updatedGroup[1][0].setCourses(courses);

        res.json({
          data: updatedGroup,
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
    }
  } catch (error) {
    next(error);
  }
};

// get a group
exports.getGroup = async (req, res, next) => {
  const { groupId } = req.params;

  try {
    group = await Group.findByPk(groupId, {
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
    if (group) {
      res.json(group.toJSON());
    } else {
      res.json({ message: "not found" });
    }
  } catch (error) {
    next(error);
  }
};
//remove group
exports.removeGroup = async (req, res, next) => {
  const { groupId } = req.params;

  try {
    await Group.destroy({ where: { id: groupId } });
  } catch (error) {
    next(error);
  }
};

//return all teacher departments
exports.getTeacherDepartments = async (req, res, next) => {
  const departments = await Group.findAll({
    where: { role: "teacher" },
    attributes: ["id", "name"],
    include: { model: User, as: "members" },
  });
  res.render("listDepartments", {
    layout: "default",
    user: res.locals.loggedInUser.toJSON(),
    departmentsList: departments.map((department) => department.toJSON()),
  });
};
//add a teacher department
exports.addDepartment = async (req, res, next) => {
  try {
    const { name, role } = req.body;
    console.log({ name, role });
    if (!name) {
      res.status(400).json({
        title: "Error",
        message: "Please provide valid name",
      });
    } else {
      const newDepartment = await Group.create({
        name,
        role,
      });
      res.json({
        data: newDepartment,
      });
    }
  } catch (error) {
    next(error);
  }
};
