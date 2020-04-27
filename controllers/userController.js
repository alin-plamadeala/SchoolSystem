const User = require("../models/userModel");
const Hash = require("../models/hashModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookies = require("cookie-parser");
const transporter = require("../transporter/transporter");
const { roles } = require("../roles");

exports.grantAccess = function (action, resource) {
  return async (req, res, next) => {
    try {
      const permission = roles.can(req.user.role)[action](resource);

      if (!permission.granted) {
        return res.status(401).json({
          error: "You don't have enough permission to perform this action",
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

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
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

async function validateProfile(input, updateUser) {
  var pageErrors = {};
  var changeEmail = false;
  var changePassword = false;
  var user = await User.findById(updateUser.id);
  if (input.changeEmail && input.changeEmail != user.email) {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      await User.countDocuments({ email: input.email }, function (err, count) {
        if (count != 0) {
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
exports.getEditProfile = async (req, res, next) => {
  res.render("editProfile", {
    layout: "default",
    user: res.locals.loggedInUser.toObject(),
  });
};

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
      res.locals.loggedInUser.toObject()
    );
    const pageErrors = validation[0];
    const changeEmail = validation[1];
    const changePassword = validation[2];

    if (Object.keys(pageErrors).length) {
      res.render("editProfile", {
        layout: "default",
        user: res.locals.loggedInUser.toObject(),
        pageErrors: pageErrors,
      });
    } else {
      if (changeEmail) {
        var userId = res.locals.loggedInUser.id;
        await User.updateOne({ _id: userId }, { newEmail: profile.email });
        const random = (Math.random() * Math.floor(1000)).toString();
        const hash = await bcrypt.hash(random, 10);
        const token = new Hash({
          _userId: userId,
          hash,
        });
        await token.save();
        const link = `${req.protocol}://${req.get("host")}/confirmEmail?token=${
          token.hash
        }&&email=${profile.email}`;
        transporter.sendConfirmation(link, profile.email);
        var message = `Profile updated! A confirmation message has been sent to ${profile.email}!`;
      }
      if (changePassword) {
        var userId = res.locals.loggedInUser.id;
        await User.updateOne(
          { _id: userId },
          { password: await hashPassword(profile.newPassword) }
        );
        if (!message) {
          message = `Profile updated!`;
        }
        res.cookie("Authorization", "");
      }
      res.render("editProfile", {
        layout: "default",
        user: res.locals.loggedInUser.toObject(),
        message: message,
      });
      //res.json({ pageErrors, changeEmail, changePassword });
    }
  } catch (error) {
    next(error);
  }
};

exports.signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || "student",
    });
    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    newUser.accessToken = accessToken;
    await newUser.save();
    res.json({
      data: newUser,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  res.cookie("Authorization", "");
  res.redirect("/login");
};

exports.forgotPassword = async (req, res, next) => {
  res.render("forgotPassword", {
    layout: "loginLayout",
  });
};

exports.resetPassword = async (req, res, next) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
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
      const token = new Hash({
        _userId: user._id,
        hash,
      });
      await token.save();
      const link = `${req.protocol}://${req.get(
        "host"
      )}/confirmResetPassword?token=${token.hash}&&id=${user._id}`;
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

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
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
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    await User.findByIdAndUpdate(user._id, { accessToken });
    res.cookie("Authorization", accessToken, {
      secure: false,
      httpOnly: true,
    });
    console.log(user);
    res.redirect("/");
    //res.status(200).send({ "x-access-token": accessToken });
  } catch (error) {
    next(error);
  }
};

exports.loginPage = async (req, res, next) => {
  res.render("login", {
    layout: "loginLayout",
  });
};

exports.getUsers = async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
    data: users,
  });
};

exports.getUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) return next(new Error("User does not exist"));
    res.status(200).json({
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

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
