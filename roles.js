const AccessControl = require("accesscontrol");
const ac = new AccessControl();

exports.roles = (function () {
  ac.grant("student")
    .readOwn("profile")
    .updateOwn("profile")
    .readOwn("course")
    .readOwn("assignment")
    .createOwn("submission")
    .readOwn("submission")
    .updateOwn("submission")
    .readOwn("feedback");

  ac.grant("teacher")
    .extend("student")
    .readAny("profile")
    .readAny("course")
    .readAny("assignment")
    .createAny("assignment")
    .updateOwn("assignment")
    .deleteOwn("assignment")
    .readAny("submission")
    .createOwn("feedback")
    .readAny("feedback")
    .updateOwn("feedback");

  ac.grant("admin")
    .extend("student")
    .extend("teacher")
    .createAny("profile")
    .updateAny("profile")
    .deleteAny("profile")
    .createAny("course")
    .updateAny("course")
    .deleteAny("course")
    .readAny("group")
    .createAny("group")
    .updateAny("group")
    .deleteAny("group");

  return ac;
})();
