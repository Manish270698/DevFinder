const { isStrongPassword } = require("validator");
const { default: isEmail } = require("validator/lib/isEmail");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password, age, gender, skills, about } =
    req.body;
  if (firstName.trim().length < 3) {
    throw new Error("First name should be atleast 3 characters long!");
  } else if (lastName && lastName.trim().length < 3) {
    throw new Error("Last name should be atleast 3 characters long!");
  } else if (!isEmail(emailId)) {
    throw new Error("Email id is not valid!");
  } else if (!isStrongPassword(password)) {
    throw new Error("Please enter a strong password!");
  } else if (age < 18) {
    console.log(gender);
    throw new Error("You should be atleast 18 to signUp!");
  } else if (!gender) {
    throw new Error("Choose your gender!");
  } else if (skills.length < 3) {
    throw new Error("Enter at least 3 skills!");
  } else if (
    new Set(skills).size !== skills.map((e) => e.toLowerCase()).length
  ) {
    throw new Error("Duplicate skills not allowed!");
  } else if (about.trim().length === 0) {
    throw new Error("Write something about yourself!");
  } else if (about.length > 200) {
    throw new Error("Write about yourself in max 200 characters!");
  }
};

const validateEditData = (req) => {
  const EDITABLE_FIELDS = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "skills",
    "photoUrl",
    "about",
  ];

  const isUpdateAllowed = Object.keys(req.body).every((field) =>
    EDITABLE_FIELDS.includes(field)
  );
  if (!isUpdateAllowed) throw new Error("Update not allowed!");

  const { firstName, lastName, age, gender, skills, about } = req.body;
  if (firstName && firstName.trim().length < 3) {
    throw new Error("First name should be atleast 3 characters long!");
  } else if (lastName && lastName.trim().length < 3) {
    throw new Error("Last name should be atleast 3 characters long!");
  } else if (age < 18) {
    console.log(gender);
    throw new Error("You should be atleast 18!");
  } else if (gender) {
    if (!["male", "female", "others"].includes(gender.trim().toLowerCase()))
      throw new Error("Choose your gender from the options!");
  } else if (skills && skills.length < 3) {
    throw new Error("Enter at least 3 skills!");
  } else if (
    skills &&
    new Set(skills).size !== skills.map((e) => e.toLowerCase()).length
  ) {
    throw new Error("Duplicate skills not allowed!");
  } else if (about && about.trim().length === 0) {
    throw new Error("Write something about yourself!");
  } else if (about && about.length > 200) {
    throw new Error("Write about yourself in max 200 characters!");
  }
};

module.exports = { validateSignUpData, validateEditData };
