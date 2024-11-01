const { isStrongPassword } = require("validator");
const { default: isEmail } = require("validator/lib/isEmail");

const validateSignUpData = (req) => {
  const { firstName, emailId, password, age } = req.body;

  if (firstName.trim().length < 3) {
    throw new Error("First name should be atleast 3 characters long!");
  } else if (!isEmail(emailId)) {
    throw new Error("Email id is not valid!");
  } else if (!isStrongPassword(password)) {
    throw new Error("Please enter a strong password!");
  } else if (age < 18) {
    throw new Error("You should be atleast 18 to signUp!");
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
  return isUpdateAllowed;
};

module.exports = { validateSignUpData, validateEditData };
