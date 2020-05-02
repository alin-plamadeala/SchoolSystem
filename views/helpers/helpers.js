var hbsHelpers = {
  ifEquals: function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  },
  json: function (context) {
    return JSON.stringify(context);
  },
};

module.exports = hbsHelpers;
