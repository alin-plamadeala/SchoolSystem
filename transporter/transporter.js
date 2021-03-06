const nodemailer = require("nodemailer");
require("dotenv").config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

// Send email to confirm email update
module.exports.sendConfirmation = function (link, email) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Email Change Confirmation",
    html: `You have requested that your user profile on School System should be updated.<br>
        If you did not do this, please ignore this email. Please do not reply.<br>        
        To complete the update of your user profile, please follow this link:<br>        
        ${link}<br>
        Your new email address will appear in your profile after you do this. Otherwise your profile will remain unchanged.
        `,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

// Send email to confirm password reset
module.exports.resetPassword = function (link, email) {
  const mailOptions = {
    from: "study.cfbc@gmail.com",
    to: email,
    subject: "Password reset",
    html: `You have requested a password reset<br>
        ${link}<br>
        `,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

// Send email containing account details
module.exports.createAccount = function (user, password) {
  const mailOptions = {
    from: "study.cfbc@gmail.com",
    to: user.email,
    subject: "Account details",
    html: `Hello ${user.firstName},<br>
    A new account has been created for this email.<br>
    Use these details to log into your account:<br>
    Email: ${user.email}<br>
    Password: ${password}<br>
    We suggest changing the password.
        `,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
