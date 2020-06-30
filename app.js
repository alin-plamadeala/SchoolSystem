const express = require("express");
const app = express();
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");
var server = require("http").createServer(app);
var io = require("socket.io")(server);

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
const Announcement = require("./models/announcementModel");
const createAdmin = require("./config/createAdminAccount");

const routes = require("./routes/route");
const apiRoutes = require("./routes/apiRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { Sequelize } = require("sequelize");
global.__basedir = __dirname;
require("dotenv").config();

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
Announcement.sync();
db.sync();
//create admin account
createAdmin.adminAccount();
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
app.use("/api", apiRoutes);
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

// Chatroom
var chatUsers = [];

io.on("connection", (socket) => {
  var addedUser = false;

  // when the client emits 'join user', this listens and executes
  socket.on("join user", (user) => {
    // if user already has a chat open, emit the message below
    if (
      addedUser ||
      chatUsers.filter((value, index, array) => value.id == user.id).length !==
        0
    ) {
      socket.emit("multiple windows");
    } else {
      // we store the username in the socket session for this client
      socket.user = user;
      chatUsers.push(user);
      addedUser = true;

      socket.emit("update users", {
        user: socket.user,
        chatUsers: chatUsers,
      });
      // echo globally (all clients) the new user list
      socket.broadcast.emit("update users", {
        chatUsers: chatUsers,
      });
    }
  });
  // when the client emits 'new message', this listens and executes
  socket.on("new message", (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit("new message", {
      user: socket.user,
      message: data,
    });
  });
  // when the user disconnects.. perform this
  socket.on("disconnect", () => {
    if (addedUser) {
      chatUsers = chatUsers.filter(
        (value, index, array) => value.id !== socket.user.id
      );
    }
    socket.broadcast.emit("update users", {
      chatUsers: chatUsers,
    });
  });
});

server.listen(PORT, (error) => {
  if (error) {
    console.log("Error running the server");
  }
  console.log("The server is running on port", 3000);
});
