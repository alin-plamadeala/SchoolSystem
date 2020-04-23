const express = require("express");
const app = express();
var hbs = require("express-handlebars");

const port = 3000;

app.use(express.static("public"));
const index = require("./routes/index");

app.use("/", index);

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

const server = app.listen(port, (error) => {
  if (error) {
    console.log("Error starting the server");
  }
  console.log("This server is running on port", server.address().port);
});
