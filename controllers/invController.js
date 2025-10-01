const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult } = require("express-validator");

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav, errors: null,
    grid,
  })
}

// THIS IS STEP #2 
invCont.buildByInventoryId = async function(req, res, next) {
  try {
    const invId = req.params.invId
    const item = await invModel.getInventoryById(invId)
    let nav = await utilities.getNav()
    if (!item) {
      return res.status(404).render("errors/error", { title: "404", message: "Vehicle not found.", nav })
    }
    const detail = utilities.buildDetailView(item)
    res.render("inventory/detail", {
      title: item.inv_make + " " + item.inv_model,
      nav, errors: null,
      item,
      detail
    })
  } catch (error) {
    next(error)
  }
}

// In controllers/invController.js
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    messages: req.flash()
  });
}

// THIS IS WK05 Take #2 
invCont.buildAddClassification = async function(req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    messages: req.flash(),
    errors: [],
    classification_name: ""
  });
};

// / Handle form submission
invCont.addClassificationProcess = async function(req, res, next) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: req.flash(),
      errors: errors.array(),
      classification_name
    });
  }
  // Insert into DB
  const result = await invModel.addClassification(classification_name);
  if (result) {
    req.flash("notice", "Classification added successfully!");
    nav = await utilities.getNav(); // update nav to include new classification
    return res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash()
    });
  } else {
    req.flash("notice", "Failed to add classification.");
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: req.flash(),
      errors: [],
      classification_name
    });
  }
};

// Wk04 task 3
// Show the form
invCont.buildAddInventory = async function(req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    messages: req.flash(),
    errors: [],
    // ...empty/default values for sticky fields
  });
};

// Handle form submission
invCont.addInventoryProcess = async function(req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList(req.body.classification_id);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      messages: req.flash(),
      errors: errors.array(),
      ...req.body // sticky fields
    });
  }
  // Insert into DB
  const result = await invModel.addInventory(req.body);
  if (result) {
    req.flash("notice", "Inventory item added successfully!");
    nav = await utilities.getNav(); // update nav
    return res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash()
    });
  } else {
    req.flash("notice", "Failed to add inventory item.");
    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      messages: req.flash(),
      errors: [],
      ...req.body
    });
  }
};
module.exports = invCont;