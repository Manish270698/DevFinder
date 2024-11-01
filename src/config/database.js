const mongoose = require("mongoose");
const { config } = require("dotenv");
config();

const connectDB = async () => {
  await mongoose.connect(process.env.DATABASE_URL);
};

module.exports = connectDB;
