const moment = require("moment");
var hbsHelpers = {
  ifEquals: function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  },
  json: function (context) {
    return JSON.stringify(context);
  },
  formatDate: function (dateTime) {
    if (moment) {
      // can use other formats like 'lll' too
      format = "DD.MM.YYYY HH:mm";
      return moment(dateTime).format(format);
    } else {
      return datetime;
    }
  },
};

module.exports = hbsHelpers;
