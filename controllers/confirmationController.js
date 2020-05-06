const Hash = require("../models/hashModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function validatePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

//render the page to confirm email update
exports.getConfirmEmail = async (req, res, next) => {
  const reqToken = req.query.token;
  const reqEmail = req.query.email;

  try {
    if (reqToken && reqEmail) {
      var token = await Hash.findOne({ where: { hash: reqToken } });
      if (!token) {
        return res.status(400).render("error", {
          layout: false,
          title: "Error",
          message:
            "We were unable to find a valid token. Your token my have expired.",
        });
      } else {
        // If we found a token, find a matching user
        var user = await User.findOne({
          where: { id: token.userId, newEmail: reqEmail },
        });

        res.render("confirmPassword", {
          layout: "loginLayout",
          user: user.toJSON(),
          token: token.hash,
        });
      }
    } else {
      return res.status(400).render("error", {
        layout: false,
        title: "Error",
        message: "Something went wrong",
      });
    }
  } catch (error) {
    return res.status(400).render("error", {
      layout: false,
      title: "Error",
      message: "Something went wrong",
    });
  }
};
//email update
exports.postConfirmEmail = async (req, res, next) => {
  const reqToken = req.query.token;
  const reqEmail = req.query.email;
  const password = req.body.password;
  var token = null;
  var user = null;

  try {
    if (reqToken && reqEmail) {
      var token = await Hash.findOne({ where: { hash: reqToken } });
      if (!token) {
        return res.status(400).render("error", {
          layout: false,
          title: "Error",
          message:
            "We were unable to find a valid token. Your token my have expired.",
        });
      } else {
        // If we found a token, find a matching user
        var foundUser = await User.findByPk(token.userId);
        if (!foundUser) {
          return res.status(400).render("error", {
            layout: false,
            title: "Error",
            message: "Something went wrong",
          });
        } else {
          user = foundUser;
          if (!password) {
            return res.status(400).render("confirmPassword", {
              layout: "loginLayout",
              user: user.toJSON(),
              token: token.hash,
              error: "Please enter the password.",
            });
          } else if (!(await validatePassword(password, user.password))) {
            return res.status(400).render("confirmPassword", {
              layout: "loginLayout",
              user: user.toJSON(),
              token: token.hash,
              error: "Wrong password..",
            });
          } else {
            user.email = user.newEmail;
            user.newEmail = null;
            user.save();
            token.destroy();
            return res.render("error", {
              layout: false,
              title: "Success",
              message: "Email updated",
            });
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.render("error", {
      layout: false,
      title: "Error",
      message: "Something went wrong",
    });
  }
};
//render the page to confirm password reset
exports.getConfirmPasswordReset = async (req, res, next) => {
  const reqToken = req.query.token;
  const userId = req.query.id;
  var token;
  var user;
  try {
    if (reqToken && userId) {
      token = await Hash.findOne({ where: { hash: reqToken } });
      if (token.userId == userId) {
        res.render("resetPassword", {
          layout: "loginLayout",
          reqToken: reqToken,
          userId: userId,
        });
      } else {
        return res.render("error", {
          layout: false,
          title: "Error",
          message: "Something went wrong",
        });
      }
    } else {
      return res.render("error", {
        layout: false,
        title: "Error",
        message: "Something went wrong",
      });
    }
  } catch (error) {
    return res.render("error", {
      layout: false,
      title: "Error",
      message: "Something went wrong",
    });
  }
};
//reset password
exports.postConfirmPasswordReset = async (req, res, next) => {
  const reqToken = req.query.token;
  const userId = req.query.id;
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;

  try {
    if (reqToken && userId) {
      token = await Hash.findOne({ where: { hash: reqToken } });
      if (!token) {
        return res.status(400).render("error", {
          layout: false,
          title: "Error",
          message:
            "We were unable to find a valid token. Your token my have expired.",
        });
      }
      if (token.userId == userId) {
        if (!newPassword) {
          res.status(400).render("resetPassword", {
            layout: "loginLayout",
            reqToken: reqToken,
            userId: userId,
            pageErrors: { newPassword: "Please enter the new password!" },
          });
        } else if (newPassword.length < 6) {
          res.status(400).render("resetPassword", {
            layout: "loginLayout",
            reqToken: reqToken,
            userId: userId,
            pageErrors: { newPassword: "Password too short!" },
          });
        } else if (!confirmPassword) {
          res.status(400).render("resetPassword", {
            layout: "loginLayout",
            reqToken: reqToken,
            userId: userId,
            pageErrors: { confirmPassword: "Please confirm the new password!" },
          });
        } else if (!(newPassword == confirmPassword)) {
          res.status(400).render("resetPassword", {
            layout: "loginLayout",
            reqToken: reqToken,
            userId: userId,
            pageErrors: { confirmPassword: "Passwords dont match!" },
          });
        } else {
          user = await User.findByPk(userId);
          user.password = await hashPassword(newPassword);
          await user.save();
          token.destroy();

          res.render("error", {
            layout: false,
            title: "Success!",
            message: "Password updated",
          });
        }
      } else {
        return res.render("error", {
          layout: false,
          title: "Error",
          message: "Something went wrong",
        });
      }
    } else {
      return res.render("error", {
        layout: false,
        title: "Error",
        message: "Something went wrong",
      });
    }
  } catch (error) {
    console.log(error);
    return res.render("error", {
      layout: false,
      title: "Error",
      message: "Something went wrong",
    });
  }
};
