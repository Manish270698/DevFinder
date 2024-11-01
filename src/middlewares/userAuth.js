const User = require("../models/user");
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      throw new Error("Invalid token!");
    }

    const loggedInUser = await jwt.verify(token, "Dev@Finder123");

    const user = await User.findById(loggedInUser._id);
    if (!user) {
      throw new Error("Invalid token!");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("ERROR: " + err);
  }
};

module.exports = userAuth;
