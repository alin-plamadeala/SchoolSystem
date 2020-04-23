const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const path = require("path");
const User = require("./models/userModel");
const routes = require("./routes/route.js");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

mongoose
  .connect("mongodb://localhost:27017/rbac", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Connected to the Database successfully");
  });

app.use(bodyParser.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  if (req.headers["x-access-token"]) {
    const accessToken = req.headers["x-access-token"];
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
    res.locals.loggedInUser = await User.findById(userId);
    next();
  } else {
    next();
  }
});

var hbs = require("express-handlebars");

app.use(express.static("public"));

app.use("/", routes);

app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultView: "default",
    layoutsDir: __dirname + "/views/layouts/",
    partialsDir: __dirname + "/views/partials/",
  })
);

const server = app.listen(PORT, (error) => {
  if (error) {
    console.log("Error starting the server");
  }
  console.log("This server is running on port", server.address().port);
});
