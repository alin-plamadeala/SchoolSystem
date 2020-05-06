const User = require("../models/userModel");
const Hash = require("../models/hashModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const transporter = require("../transporter/transporter");
const { roles } = require("../roles");

//check if current user has enough permissions
exports.grantAccess = function (action, resource) {
  return async (req, res, next) => {
    try {
      const permission = roles.can(req.user.role)[action](resource);

      if (!permission.granted) {
        return res.status(401).render("error", {
          layout: false,
          title: "Error",
          message: "You don't have enough permission to perform this action",
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
//check if logged in
exports.allowIfLoggedin = async (req, res, next) => {
  try {
    const user = res.locals.loggedInUser;

    if (!user) return res.redirect("/login");
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
//encrypt the password
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

//check if password matches
async function validatePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

//validate profile changes
async function validateProfile(input, updateUser) {
  var pageErrors = {};
  var changeEmail = false;
  var changePassword = false;
  var user = await User.findByPk(updateUser.id);
  if (input.changeEmail && input.changeEmail != user.email) {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      await User.count({ where: { email: input.email } }).then((count) => {
        if (count > 0) {
          pageErrors["email"] = "Email already in use";
        } else {
          changeEmail = true;
        }
      });
    } else {
      pageErrors["email"] = "Invalid Email";
    }
  }

  if (input.currentPassword || input.newPassword || input.confirmPassword) {
    if (!input.currentPassword) {
      pageErrors["currentPassword"] = "Please insert current password";
    } else if (!input.newPassword) {
      pageErrors["newPassword"] = "Please insert the new password";
    } else if (!input.confirmPassword) {
      pageErrors["confirmPassword"] = "Please confirm the new password";
    } else if (
      !(await validatePassword(input.currentPassword, user.password))
    ) {
      pageErrors["currentPassword"] = "Wrong password";
    } else if (input.newPassword.length < 6) {
      pageErrors["newPassword"] = "Password too short";
    } else if (input.newPassword != input.confirmPassword) {
      pageErrors["confirmPassword"] = "Passwords don't match";
    } else {
      changePassword = true;
    }
  }

  return [pageErrors, changeEmail, changePassword];
}

//edit profile page
exports.getEditProfile = async (req, res, next) => {
  res.render("editProfile", {
    layout: "default",
    user: res.locals.loggedInUser.toJSON(),
  });
};

//post profile changes
exports.postEditProfile = async (req, res, next) => {
  try {
    const profile = {
      email: req.body.email,
      changeEmail: req.body.changeEmail,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
      confirmPassword: req.body.confirmPassword,
    };

    const validation = await validateProfile(
      profile,
      res.locals.loggedInUser.toJSON()
    );
    const pageErrors = validation[0];
    const changeEmail = validation[1];
    const changePassword = validation[2];

    if (Object.keys(pageErrors).length) {
      res.render("editProfile", {
        layout: "default",
        user: res.locals.loggedInUser.toJSON(),
        pageErrors: pageErrors,
      });
    } else {
      if (changeEmail) {
        var user = await User.findByPk(res.locals.loggedInUser.id);
        user.newEmail = profile.email;
        const random = (Math.random() * Math.floor(1000)).toString();
        const hash = await bcrypt.hash(random, 10);
        const token = await Hash.create({
          userId: user.id,
          hash,
        });
        await user.save();
        const link = `${req.protocol}://${req.get("host")}/confirmEmail?token=${
          token.hash
        }&&email=${profile.email}`;
        transporter.sendConfirmation(link, profile.email);
        var message = `Profile updated! A confirmation message has been sent to ${profile.email}!`;
      }
      if (changePassword) {
        var user = User.findByPk(res.locals.loggedInUser.id);
        user.password = await hashPassword(profile.newPassword);
        await user.save();
        if (!message) {
          message = `Profile updated!`;
        }
        res.cookie("Authorization", "");
      }
      res.render("editProfile", {
        layout: "default",
        user: res.locals.loggedInUser.toJSON(),
        message: message,
      });
      //res.json({ pageErrors, changeEmail, changePassword });
    }
  } catch (error) {
    next(error);
  }
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

//logout
exports.logout = async (req, res, next) => {
  res.cookie("Authorization", "");
  res.redirect("/login");
};

//display forgot passsword page
exports.forgotPassword = async (req, res, next) => {
  res.render("forgotPassword", {
    layout: "loginLayout",
  });
};

//method to generate a link for recovering password and sending it to user email
exports.resetPassword = async (req, res, next) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.render("forgotPassword", {
        layout: "loginLayout",
        pageErrors: {
          email: "Email does not exist",
        },
      });
    } else {
      const random = (Math.random() * Math.floor(1000)).toString();
      const hash = await bcrypt.hash(random, 10);
      const token = await Hash.create({
        userId: user.id,
        hash,
      });
      const link = `${req.protocol}://${req.get(
        "host"
      )}/confirmResetPassword?token=${token.hash}&&id=${user.id}`;
      transporter.resetPassword(link, user.email);

      return res.render("forgotPassword", {
        layout: "loginLayout",
        confirm: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

//login post method
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(400).render("login", {
        layout: "loginLayout",
        pageErrors: { email: "Email does not exist!" },
      });
    const validPassword = await validatePassword(password, user.password);
    if (!validPassword)
      return res.status(400).render("login", {
        layout: "loginLayout",
        pageErrors: { password: "Wrong password!" },
      });
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    await User.update({ accessToken }, { where: { id: user.id } });
    res.cookie("Authorization", accessToken, {
      secure: false,
      httpOnly: true,
    });
    res.redirect("/");
  } catch (error) {
    next(error);
  }
};

//render login page
exports.loginPage = async (req, res, next) => {
  res.render("login", {
    layout: "loginLayout",
  });
};

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

//return a user
exports.getUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByPk(userId);
    if (!user) return next(new Error("User does not exist"));
    res.status(200).json({
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

//update a user
exports.updateUser = async (req, res, next) => {
  try {
    const update = req.body;
    const userId = req.params.userId;
    await User.findByIdAndUpdate(userId, update);
    const user = await User.findById(userId);
    res.status(200).json({
      data: user,
      message: "User has been updated",
    });
  } catch (error) {
    next(error);
  }
};

//delete a user
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    await User.findByIdAndDelete(userId);
    res.status(200).json({
      data: null,
      message: "User has been deleted",
    });
  } catch (error) {
    next(error);
  }
};
