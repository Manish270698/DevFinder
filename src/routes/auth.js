const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { validateSignUpData } = require("../utils/validate");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    //Validating the signUpData
    validateSignUpData(req);

    const {
      firstName,
      lastName,
      emailId,
      password,
      age,
      gender,
      skills,
      photoUrl,
      about,
    } = req.body;
    // hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      age,
      gender,
      skills,
      photoUrl,
      about,
    });
    // manually creating index
    // await User.createIndexes();
    await user.save();
    res.cookie("token", null, { expires: new Date(Date.now()) }).send();
    res.send("User created successfully");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId.toLowerCase() });
    if (!user) {
      throw new Error("invalid credentials!");
    }
    const isPasswordValid = await user.validateUser(password);
    if (isPasswordValid) {
      //create JWT Token
      const token = await user.getJWT();

      //send the token with the cookie
      res.cookie("token", token, {
        expires: new Date(Date.now() + 168 * 3600000), //expires after 168 hours/ 7 days
        httpOnly: true,
      });

      res.send("Login successful");
    } else {
      throw new Error("Invalid credentials!");
    }
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

authRouter.post("/logout", (req, res) => {
  res
    .cookie("token", null, { expires: new Date(Date.now()) })
    .send("Logged Out successfully!");
});

module.exports = authRouter;
