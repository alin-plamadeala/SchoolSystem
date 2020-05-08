const AccessControl = require("accesscontrol");
const ac = new AccessControl();

exports.roles = (function () {
  ac.grant("student").readOwn("profile").updateOwn("profile");

  ac.grant("teacher").extend("student").readAny("profile").readAny("course");

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
