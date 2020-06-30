const Hash = require("../models/hashModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

// function to check if password matches
async function validatePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
// function to encrypt password
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

//render the page to confirm email update
exports.getConfirmEmail = async (req, res, next) => {
  const reqToken = req.query.token;
  const reqEmail = req.query.email;

  try {
    // check if token and email present in request query
    if (!(reqToken && reqEmail)) {
      return res.status(400).render("error", {
        layout: false,
        title: "Error",
        message: "Something went wrong",
      });
    }
    // search for token
    var token = await Hash.findOne({ where: { hash: reqToken } });
    // check if token exists
    if (!token) {
      return res.status(400).render("error", {
        layout: false,
        title: "Error",
        message:
          "We were unable to find a valid token. Your token my have expired.",
      });
    }
    // If we found a token, find a matching user
    var user = await User.findOne({
      where: { id: token.userId, newEmail: reqEmail },
    });

    return res.render("confirmPassword", {
      layout: "loginLayout",
      user: user.toJSON(),
      token: token.hash,
    });
  } catch (error) {
    console.log(error);
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
  var token;
  var user;

  try {
    // check if token and email present in request query
    if (!(reqToken && reqEmail)) {
      return res.status(400).render("error", {
        layout: false,
        title: "Error",
        message: "Something went wrong",
      });
    }
    // search for token
    token = await Hash.findOne({ where: { hash: reqToken } });
    // if token not found
    if (!token) {
      return res.status(400).render("error", {
        layout: false,
        title: "Error",
        message:
          "We were unable to find a valid token. Your token my have expired.",
      });
    }
    // Find a matching user
    user = await User.findByPk(token.userId);
    // check if user exists
    if (!user) {
      return res.status(400).render("error", {
        layout: false,
        title: "Error",
        message: "Something went wrong",
      });
    }
    // check if password entered
    if (!password) {
      return res.status(400).render("confirmPassword", {
        layout: "loginLayout",
        user: user.toJSON(),
        token: token.hash,
        error: "Please enter the password.",
      });
      // check if password matches
    } else if (!(await validatePassword(password, user.password))) {
      return res.status(400).render("confirmPassword", {
        layout: "loginLayout",
        user: user.toJSON(),
        token: token.hash,
        error: "Wrong password...",
      });
    }
    // change the email to newEmail
    user.email = user.newEmail;
    user.newEmail = null;
    // save changes to database
    await user.save();
    // remove the token
    await token.destroy();
    // return the confirmation page
    return res.render("error", {
      layout: false,
      title: "Success",
      message: "Email updated",
    });
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
    // check if token and userId present in request query
    if (!(reqToken && userId)) {
      return res.render("error", {
        layout: false,
        title: "Error",
        message: "Something went wrong",
      });
    }
    // find the token in db
    token = await Hash.findOne({ where: { hash: reqToken } });
    // check if token userId matches the request userId
    if (!token.userId == userId) {
      console.log("test");

      return res.render("error", {
        layout: false,
        title: "Error",
        message: "Something went wrong",
      });
    }
    // render the reset password page
    return res.render("resetPassword", {
      layout: "loginLayout",
      reqToken: reqToken,
      userId: userId,
    });
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
    // check if token and userId present in request query
    if (!(reqToken && userId)) {
      return res.render("error", {
        layout: false,
        title: "Error",
        message: "Something went wrong",
      });
    }
    // find token in db
    var token = await Hash.findOne({ where: { hash: reqToken } });
    // if token doesnt exist return error page
    if (!token) {
      return res.status(400).render("error", {
        layout: false,
        title: "Error",
        message:
          "We were unable to find a valid token. Your token my have expired.",
      });
    }
    // if user id in token does not match the user id in request
    if (!token.userId == userId) {
      return res.render("error", {
        layout: false,
        title: "Error",
        message: "Something went wrong",
      });
    }
    // check if new password entered
    if (!newPassword) {
      return res.status(400).render("resetPassword", {
        layout: "loginLayout",
        reqToken: reqToken,
        userId: userId,
        pageErrors: { newPassword: "Please enter the new password!" },
      });
      // check if password len > 6
    } else if (newPassword.length < 6) {
      return res.status(400).render("resetPassword", {
        layout: "loginLayout",
        reqToken: reqToken,
        userId: userId,
        pageErrors: { newPassword: "Password too short!" },
      });
      // check if password confirm entered
    } else if (!confirmPassword) {
      res.status(400).render("resetPassword", {
        layout: "loginLayout",
        reqToken: reqToken,
        userId: userId,
        pageErrors: { confirmPassword: "Please confirm the new password!" },
      });
      //check if passwords match
    } else if (!(newPassword == confirmPassword)) {
      res.status(400).render("resetPassword", {
        layout: "loginLayout",
        reqToken: reqToken,
        userId: userId,
        pageErrors: { confirmPassword: "Passwords dont match!" },
      });
    }
    // find user in db
    user = await User.findByPk(userId);
    // update password
    user.password = await hashPassword(newPassword);
    // save changes
    await user.save();
    // remove token from db
    await token.destroy();

    // render the success page
    return res.render("error", {
      layout: false,
      title: "Success!",
      message: "Password updated",
    });
  } catch (error) {
    console.log(error);
    return res.render("error", {
      layout: false,
      title: "Error",
      message: "Something went wrong",
    });
  }
};
