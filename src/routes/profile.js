const express = require("express");
const userAuth = require("../middlewares/userAuth");
const { validateEditData, validateSignUpData } = require("../utils/validate");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const {
      firstName,
      lastName,
      emailId,
      age,
      skills,
      gender,
      photoUrl,
      about,
    } = user;
    res.json({
      user: {
        firstName,
        lastName,
        emailId,
        age,
        skills,
        gender,
        photoUrl,
        about,
      },
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    validateEditData(req);
    const loggedInUser = req.user;
    // update the loggedInUser data
    Object.keys(req.body).forEach((field) => {
      loggedInUser[field] = req.body[field];
    });

    // save the updated user
    await loggedInUser.save();
    res.json({ message: "Profile Updated successfully", loggedInUser });
  } catch (err) {
    res.status(400).send({ ERROR: err.message });
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
