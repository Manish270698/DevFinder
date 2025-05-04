const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { validateSignUpData } = require("../utils/validate");
const { config } = require("dotenv");
config();

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    //Validating the signUpData
    validateSignUpData(req);

    for (const [key, value] of Object.entries(req.body)) {
      if (value === "") {
        req.body[key] = undefined;
      }
    }

    let {
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

    skills = skills.map(
      (skill) =>
        skill.trim().charAt(0).toUpperCase() +
        skill.trim().slice(1).toLowerCase()
    );

    const presentUser = await User.findOne({ emailId });
    if (presentUser) {
      throw new Error("An account with the entered emailId already exists!");
    }

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
    const token = await user.getJWT();

    //send the token with the cookie
    res.cookie("token", token, {
      expires: new Date(Date.now() + 168 * 3600000), //expires after 168 hours/ 7 days
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    if (!photoUrl)
      photoUrl = "https://avatars.githubusercontent.com/u/51204518?v=3";

    res.json({
      message: "User created successfully",
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
    // res.json("User created successfully");
  } catch (err) {
    res.status(400).send({ ERROR: err.message });
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
        secure: true,
        sameSite: "None",
      });

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
        message: "Login successful",
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
    } else {
      throw new Error("Invalid credentials!");
    }
  } catch (err) {
    res.status(400).json({ ERROR: err.message });
  }
});

authRouter.post("/logout", (req, res) => {
  res
    .cookie("token", null, { expires: new Date(Date.now()) })
    .send("Logged Out successfully!");
});

module.exports = authRouter;
