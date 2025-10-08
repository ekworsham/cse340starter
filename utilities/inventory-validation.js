const { body, validationResult } = require("express-validator");
const utilities = require("../utilities");

const inventoryValidate = [
  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  body("inv_year").isInt({ min: 1886, max: 2099 }).withMessage("Year must be valid."),
  body("inv_description").trim().notEmpty().withMessage("Description is required."),
  body("inv_image").trim().notEmpty().withMessage("Image path is required."),
  body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
  body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a positive number."),
  body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a positive integer."),
  body("inv_color").trim().notEmpty().withMessage("Color is required."),
  body("classification_id").notEmpty().withMessage("Classification is required.")
];

// Add classification validation rules
const classificationValidate = [
  body("classification_name")
    .trim()
    .notEmpty()
    .withMessage("Classification name is required.")
    .matches(/^[A-Za-z]+$/)
    .withMessage("Classification name must contain only letters.")
];

/* ******************************
 * Check data and return errors or continue to add inventory
 * ***************************** */
const checkInventoryData = async (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)
    res.render("inventory/add-inventory", {
      errors: errors.array(),
      title: "Add Inventory",
      nav,
      classificationList,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
    return
  }
  next()
}

/* ******************************
 * Check classification data and return errors or continue to add classification
 * ***************************** */
const checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors: errors.array(),
      title: "Add Classification",
      nav,
      classification_name
    })
    return
  }
  next()
}

/* ******************************
 * Check data and return errors or continue to edit inventory
 * ***************************** */
const checkUpdateData = async (req, res, next) => {
  const { inv_id: rawInvId, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  
  // Handle case where inv_id might be an array
  const inv_id = Array.isArray(rawInvId) ? rawInvId[0] : rawInvId
  
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    res.render("inventory/edit-inventory", {
      errors: errors.array(),
      title: "Edit " + itemName,
      nav,
      classificationList,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
    return
  }
  next()
}

module.exports = { 
  inventoryValidate, 
  classificationValidate,
  checkInventoryData, 
  checkClassificationData,
  checkUpdateData, };