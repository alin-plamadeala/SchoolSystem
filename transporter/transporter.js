const nodemailer = require("nodemailer");
require("dotenv").config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD, // naturally, replace both with your real credentials or an application-specific password
  },
});

module.exports.sendConfirmation = function (link, email) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Email Change Confirmation",
    html: `You have requested that your user profile on {SITE_NAME} should be updated with this email address {newAdress}.<br>
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
