// wk04 task 2

const { body } = require("express-validator");

const classificationValidate = [
  body("classification_name")
    .trim()
    .notEmpty().withMessage("Classification name is required.")
    .matches(/^[A-Za-z0-9]+$/).withMessage("No spaces or special characters allowed.")
];

module.exports = classificationValidate;