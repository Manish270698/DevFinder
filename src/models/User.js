const { Schema, default: mongoose } = require("mongoose");
const { isStrongPassword } = require("validator");
const { default: isEmail } = require("validator/lib/isEmail");
const { default: isURL } = require("validator/lib/isURL");

const checkDuplicate = (val) => {
  val = val.map((ele) => ele.trim().toLowerCase());
  const set = new Set(val);
  if (set.size != val.length) {
    throw new Error();
  }
};

// skills validators
const many = [
  {
    validator: checkDuplicate,
    message: "Can't enter same skill more than once!!",
  },
  {
    validator: function (val) {
      if (val.length < 3) {
        throw new Error();
      }
    },
    message: "Enter at least 3 skills!",
  },
  {
    validator: function (val) {
      if (val.length > 15) {
        throw new Error();
      }
    },
    message: "Maximum 15 skills allowed!!",
  },
];

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      minLength: 3,
      maxLength: 20,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      minLength: 3,
      maxLength: 30,
      trim: true,
    },
    emailId: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      // match: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
      required: true,
      validate: {
        validator(value) {
          if (!isEmail(value)) {
            throw new Error("Entered email is not valid!");
          }
        },
      },
    },
    password: {
      type: String,
      required: true,
      // minLength: 8,
      // match:
      //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      validate(value) {
        if (!isStrongPassword(value)) {
          throw new Error("Enter a strong password!");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
      required: true,
    },
    gender: {
      type: String,
      lowercase: true,
      trim: true,
      enum: ["male", "female", "other"],
      required: true,
    },
    skills: {
      type: [String],
      lowercase: true,
      required: true,
      trim: true,
      validate: many,
    },
    photoUrl: {
      type: String,
      required: true,
      default: "https://avatars.githubusercontent.com/u/51204518?v=3",
      trim: true,
      validate(value) {
        if (!isURL(value)) {
          throw new Error("Invalid image URL!");
        }
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
