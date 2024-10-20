const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://manish:Manish%401234@cluster0.behkz.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
