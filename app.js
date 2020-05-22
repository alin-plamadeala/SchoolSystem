const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");
//models
const User = require("./models/userModel");
const Hash = require("./models/hashModel");
const Group = require("./models/groupModel");
const Course = require("./models/courseModel");
const AssignmentFile = require("./models/assignmentFiles");
const Assignment = require("./models/assignmentModel");
const Submission = require("./models/submissionModel");
const SubmissionFile = require("./models/submissionFiles");
const Feedback = require("./models/feedbackModel");

const routes = require("./routes/route");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { Sequelize } = require("sequelize");
global.__basedir = __dirname;
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

//database
const db = require("./config/database");
//sync db tables
User.sync();
Hash.sync();
Group.sync();
Course.sync();
AssignmentFile.sync();
Assignment.sync();
Submission.sync();
SubmissionFile.sync();
Feedback.sync();
db.sync();
//db test
db.authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log(err));

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  if (req.cookies["Authorization"]) {
    try {
      const accessToken = req.cookies["Authorization"];
      const { userId, exp } = await jwt.verify(
        accessToken,
        process.env.JWT_SECRET
      );

      // Check if token has expired
      if (exp < Date.now().valueOf() / 1000) {
        return res.status(401).json({
          error: "JWT token has expired, please login to obtain a new one",
        });
      }
      res.locals.loggedInUser = await User.findByPk(userId, {
        include: [
          {
            model: Course,
            attributes: ["id", "name"],
            include: [
              {
                model: Group,
                attributes: ["id", "name"],
              },
            ],
          },
          {
            model: Group,
            attributes: ["id", "name"],
            include: [
              {
                model: Course,
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      });
      next();
    } catch (error) {
      console.log(error);
      next();
    }
  } else {
    next();
  }
});

var hbs = require("express-handlebars");

app.use(express.static("public"));

app.use("/", routes);
app.use("/", adminRoutes);
app.use("/teacher", teacherRoutes);
app.use("/student", studentRoutes);

const hbsHelpers = require("./views/helpers/helpers");

app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultView: "default",
    layoutsDir: __dirname + "/views/layouts/",
    partialsDir: __dirname + "/views/partials/",
    helpers: hbsHelpers,
  })
);

app.set("view engine", "hbs");
const server = app.listen(PORT, (error) => {
  if (error) {
    console.log("Error starting the server");
  }
  console.log("This server is running on port", server.address().port);
});
