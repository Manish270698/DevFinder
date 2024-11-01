const express = require("express");
const userAuth = require("../middlewares/userAuth");
const { validateEditData } = require("../utils/validate");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send("The user is logged in" + user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditData(req)) {
      throw new Error("Update not allowed!");
    }

    const loggedInUser = req.user;
    // update the loggedInUser data
    Object.keys(req.body).forEach((field) => {
      loggedInUser[field] = req.body[field];
    });

    // save the updated user
    await loggedInUser.save();
    res.json({ message: "Profile Updated successfully", loggedInUser });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

//forgot password
profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    loggedInUser = req.user;
    const isPasswordValid = await loggedInUser.validateUser(
      req.body.oldPassword
    );
    if (!isPasswordValid) {
      throw new Error("Entered old password is wrong!");
    }

    if (!(req.body.firstNewPassword === req.body.secondNewPassword)) {
      throw new Error("The new entered passwords don't match!");
    }

    if (req.body.oldPassword === req.body.firstNewPassword) {
      throw new Error("New password can't be same as old password!");
    }

    const passwordHash = await bcrypt.hash(req.body.firstNewPassword, 10);
    await User.findByIdAndUpdate(
      loggedInUser._id,
      { password: passwordHash },
      { runValidators: true }
    );
    console.log("NEWUser: " + loggedInUser);
    res.send("Password updated successfully!");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = profileRouter;
