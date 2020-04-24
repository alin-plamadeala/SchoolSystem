exports.index = async (req, res, next) => {
  res.render("index", {
    layout: "default",
    template: "home-template",
    user: res.locals.loggedInUser.toObject(),
  });
};
