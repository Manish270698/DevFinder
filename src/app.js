const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/User");
const validateSignUpData = require("./utils/validate");
const bcrypt = require("bcrypt");

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(7777, () => {
      console.log("Server lstening on port 7777");
    });
  })
  .catch((err) => {
    console.error("Error while connecting to database with message: ", err);
  });

app.use(express.json());

app.post("/signup", async (req, res) => {
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
    });
    // manually creating index
    await User.createIndexes();
    await user.save();
    res.send("User created successfully");
  } catch (err) {
    res.status(400).send("ERROR: " + err);
  }
});

app.patch("/profile/:userId", async (req, res) => {
  const userId = req?.params?.userId;
  const data = req?.body;
  try {
    const ALLOWED_UPDATES = [
      "firstName",
      "lastName",
      "password",
      "age",
      "gender",
      "skills",
      "photoUrl",
    ];
    const isUpdateAllowed = Object.keys(data).every((key) =>
      ALLOWED_UPDATES.includes(key)
    );

    //Only allowing some fields to be updated
    if (!isUpdateAllowed) {
      return res.status(400).send("Update not allowed!"); // return helps to stop the flow here if this block is entered
    }

    await User.findByIdAndUpdate(userId, data, {
      returnDocument: true,
      runValidators: true,
    });
    res.send("Updated successfully");
  } catch (err) {
    res.status(400).send("ERROR : " + err);
  }
});
