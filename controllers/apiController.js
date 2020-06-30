const User = require("../models/userModel");
const Group = require("../models/groupModel");
const Course = require("../models/courseModel");
const bcrypt = require("bcrypt");
const transporter = require("../transporter/transporter");

//encrypt the password
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// return all students
exports.getStudents = async (req, res, next) => {
  const students = await User.findAll({
    where: { role: "student" },
    attributes: ["id", "firstName", "lastName", "fullName", "email"],
    order: [
      ["firstName", "ASC"],
      ["lastName", "ASC"],
    ],
    include: { model: Group, attributes: ["id", "name"] },
  });
  return res.json(students);
};

//return all teachers
exports.getTeachers = async (req, res, next) => {
  const teachers = await User.findAll({
    where: { role: "teacher" },
    attributes: ["id", "firstName", "lastName", "fullName", "email"],
    order: [
      ["lastName", "ASC"],
      ["firstName", "ASC"],
    ],
    include: { model: Group, attributes: ["id", "name"] },
  });
  return res.json(teachers);
};

//return all administrators
exports.getAdmins = async (req, res, next) => {
  const administrators = await User.findAll({
    where: { role: "admin" },
    attributes: ["id", "firstName", "lastName", "fullName", "email"],
    order: [
      ["lastName", "ASC"],
      ["firstName", "ASC"],
    ],
    include: { model: Group, attributes: ["id", "name"] },
  });
  return res.json(administrators);
};

//get user
exports.getUser = async (req, res, next) => {
  const { userId } = req.params;

  user = await User.findByPk(userId, {
    attributes: ["id", "firstName", "lastName", "email", "groupId"],
    include: { model: Group, attributes: ["id", "name"] },
  });
  if (user) {
    return res.json(user.toJSON());
  } else {
    return res.json({ message: "not found" });
  }
};

//add or update a user
exports.addUser = async (req, res, next) => {
  const { id, fullName, email, role, group } = req.body;
  const name = fullName.split(" ");
  const firstName = name[0];
  const lastName = fullName.substring(name[0].length).trim();
  var editedUser = { email: "undefined" };
  if (id) {
    editedUser = await User.findByPk(id);
  }

  if (!firstName || !lastName || !email) {
    return res.status(400).json({
      title: "Error",
      message: "Please provide valid name and email",
    });
  } else if (!group) {
    return res.status(400).json({
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
    return res.status(400).json({
      title: "Error",
      message: "Email already in use",
    });
  } else {
    if (id) {
      const updatedUser = await User.update(
        { firstName, lastName, email, groupId: group },
        { where: { id } }
      );
      return res.json({
        title: "Success",
        message: "User successfuly updated.",
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
      return res.json({
        title: "Success",
        message:
          "Account successfuly created. The user will receive the authentication details on the email.",
        data: newUser,
      });
    }
  }
};

//remove user
exports.removeUser = async (req, res, next) => {
  const { userId } = req.params;

  removedUser = await User.destroy({ where: { id: userId } });
  if (!removedUser == 1) {
    return res.status(400).json({
      title: "Error",
      message:
        "A problem was encountered while trying to remove the user. Try to refresh the page.",
    });
  } else {
    return res.json({
      title: "Success",
      message: "The user has been removed.",
    });
  }
};

//import multiple users
exports.addUserList = async (req, res, next) => {
  try {
    const { csvResult, role, group } = req.body;
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
      return res.status(200).json({ message: "Accounts created" });
    } else {
      return res.status(400).json({ errors });
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
  return res.json(courses);
};

// get a course
exports.getCourse = async (req, res, next) => {
  const { courseId } = req.params;

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
    return res.json(course.toJSON());
  } else {
    return res.status(400).json({ title: "Error", message: "not found" });
  }
};

//add or update a course
exports.addUpdateCourse = async (req, res, next) => {
  const { id, name, teacherId } = req.body;

  // check if fields not empty
  if (!name || !teacherId) {
    return res.status(400).json({
      title: "Error",
      message: "Please provide a valid name and teacher",
    });
  }

  //check if selected teacher is valid
  const teacher = await User.findByPk(teacherId);

  if (!teacher || !teacher.role == "teacher") {
    return res.status(400).json({
      title: "Error",
      message: "Please select a valid teacher",
    });
  }

  //if updating a course
  if (id) {
    // returns an array containing number of affected rows and an array of the affected rows
    const updatedCourse = await Course.update(
      { name, teacherId },
      { returning: true, where: { id } }
    );
    return res.json({
      title: "Success",
      message: `Course ${updatedCourse[1][0].name} has been updated.`,
      course: updatedCourse,
    });
  }
  // if adding a course
  const newCourse = await Course.create({
    name,
    teacherId,
  });
  return res.json({
    title: "Success",
    message: `Course ${newCourse.name} has been created.`,
    course: newCourse,
  });
};

//remove course
exports.removeCourse = async (req, res, next) => {
  const { courseId } = req.params;

  removedCourse = await Course.destroy({ where: { id: courseId } });

  if (!removedCourse == 1) {
    return res.status(400).json({
      title: "Error",
      message:
        "A problem was encountered while trying to remove the course. Try to refresh the page.",
    });
  } else {
    return res.json({
      title: "Success",
      message: "The course has been removed.",
    });
  }
};

//return all admin groups
exports.getAdminGroups = async (req, res, next) => {
  const groups = await Group.findAll({
    where: { role: "admin" },
    attributes: ["id", "name"],
  });
  return res.json(groups);
};

//return all student groups
exports.getGroups = async (req, res, next) => {
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
  return res.json(groups);
};

//add or update a group
exports.addUpdateGroup = async (req, res, next) => {
  const { id, name, role, courses } = req.body;

  if (!name) {
    return res.status(400).json({
      title: "Error",
      message: "Please provide valid name",
    });
  }
  if (id) {
    const updatedGroup = await Group.update(
      {
        name,
      },
      { returning: true, where: { id } }
    );
    await updatedGroup[1][0].setCourses(courses);

    return res.json({
      title: "Success",
      message: `Group ${updatedGroup[1][0].name} has been updated.`,
      data: updatedGroup,
    });
  }
  const newGroup = await Group.create({
    name,
    role,
  });
  await newGroup.setCourses(courses);

  return res.json({
    title: "Success",
    message: `Group ${newGroup.name} has been created.`,
    data: newGroup,
  });
};

// get a group
exports.getGroup = async (req, res, next) => {
  const { groupId } = req.params;

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
    return res.json(group);
  } else {
    return res.json({ title: "error", message: "not found" });
  }
};

//remove group
exports.removeGroup = async (req, res, next) => {
  const { groupId } = req.params;

  removedGroup = await Group.destroy({ where: { id: groupId } });
  if (!removedGroup == 1) {
    return res.status(400).json({
      title: "Error",
      message:
        "A problem was encountered while trying to remove the group. Try to refresh the page.",
    });
  } else {
    return res.json({
      title: "Success",
      message: "The group has been removed.",
    });
  }
};

//return all teacher departments
exports.getTeacherDepartments = async (req, res, next) => {
  const departments = await Group.findAll({
    where: { role: "teacher" },
    attributes: ["id", "name"],
    include: [
      {
        model: User,
        as: "members",
        attributes: ["id", "firstName", "lastName"],
      },
    ],
  });
  return res.json(departments);
};

// get a teacher department
exports.getTeacherDepartment = async (req, res, next) => {
  const { departmentId } = req.params;

  department = await Group.findByPk(departmentId, {
    attributes: ["id", "name"],
    include: [
      {
        model: User,
        as: "members",
        attributes: ["id", "firstName", "lastName"],
      },
    ],
  });
  if (department) {
    return res.json(department.toJSON());
  } else {
    return res.status(400).json({ title: "Error", message: "not found" });
  }
};

//add or update a teacher department
exports.addUpdateDepartment = async (req, res, next) => {
  const { name, role, id } = req.body;
  if (!name) {
    return res.status(400).json({
      title: "Error",
      message: "Please provide valid name",
    });
  }
  //if updating a department
  else if (id) {
    // returns an array containing number of affected rows and an array of the affected rows
    const updatedDepartment = await Group.update(
      { name },
      { returning: true, where: { id } }
    );
    return res.json({
      title: "Success",
      message: `Department ${updatedDepartment[1][0].name} has been updated.`,
    });
  } else {
    const newDepartment = await Group.create({
      name,
      role,
    });
    return res.json({
      title: "Success",
      message: `Department ${newDepartment.name} has been created.`,
      data: newDepartment,
    });
  }
};

//remove department
exports.removeDepartment = async (req, res, next) => {
  const { departmentId } = req.params;

  removedDepartment = await Group.destroy({ where: { id: departmentId } });

  if (!removedDepartment == 1) {
    return res.status(400).json({
      title: "Error",
      message:
        "A problem was encountered while trying to remove the department. Try to refresh the page.",
    });
  } else {
    return res.json({
      title: "Success",
      message: "The department has been removed.",
    });
  }
};
