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
  formatDateISO: function (dateTime) {
    if (moment) {
      // can use other formats like 'lll' too
      format = "YYYY-MM-DDTHH:mm";
      return moment(dateTime).utc(true).format(format);
    } else {
      return datetime;
    }
  },
  dateDifference: function (date1, date2) {
    // can use other formats like 'lll' too
    var start = moment(date1);
    var end = moment(date2);
    var dif = Math.abs(start.diff(end, "days"));
    var difference = `${dif} days`;
    if (dif == 0) {
      dif = Math.abs(start.diff(end, "hours"));
      difference = `${dif} hours`;
    }
    if (dif == 0) {
      dif = Math.abs(start.diff(end, "minutes"));
      difference = `${dif} minutes`;
    }
    return difference;
  },
  breaklines: function (text) {
    text = text.replace(/(\r\n|\n|\r)/gm, "<br>");
    return text;
  },
};

module.exports = hbsHelpers;
