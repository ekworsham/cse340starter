const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult } = require("express-validator");

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    if (!data || data.length === 0) {
      let nav = await utilities.getNav()
      return res.status(404).render("errors/error", {
        title: "404",
        message: "No vehicles found for this classification.",
        nav,
        errors: []
      })
    }
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      errors: [],
      grid,
      messages: req.flash()
    })
  } catch (error) {
    next(error)
  }
}

// THIS IS STEP #2 
invCont.buildByInventoryId = async function(req, res, next) {
  try {
    const invId = req.params.invId
    const item = await invModel.getInventoryById(invId)
    let nav = await utilities.getNav()
    if (!item) {
      return res.status(404).render("errors/error", {
        title: "404",
        message: "Vehicle not found.",
        nav,
        errors: []
      })
    }
    const detail = utilities.buildDetailView(item)
    res.render("inventory/detail", {
      title: item.inv_make + " " + item.inv_model,
      nav,
      errors: [],
      item,
      detail,
      messages: req.flash()
    })
  } catch (error) {
    next(error)
  }
}

/* ********************************
* Build vehicle management view
* Assignment 5
************************************ */
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash(),
      classificationSelect,
      errors: []
    })
  } catch (error) {
    next(error)
  }
}

// THIS IS WK05 Take #2 
invCont.buildAddClassification = async function(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: req.flash(),
      errors: [],
      classification_name: ""
    })
  } catch (error) {
    next(error)
  }
}

// / Handle form submission
invCont.addClassificationProcess = async function(req, res, next) {
  try {
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
      })
    }
    // Insert into DB
    const result = await invModel.addClassification(classification_name);
    if (result) {
      req.flash("notice", "Classification added successfully!");
      nav = await utilities.getNav(); // update nav to include new classification
      const classificationSelect = await utilities.buildClassificationList()
      return res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        messages: req.flash(),
        classificationSelect,
        errors: []
      });
    } else {
      req.flash("notice", "Failed to add classification.");
      return res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        messages: req.flash(),
        errors: [],
        classification_name
      })
    }
  } catch (error) {
    next(error)
  }
}

// Wk04 task 3
// Show the form
invCont.buildAddInventory = async function(req, res, next) {
  try {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      messages: req.flash(),
      errors: [],
      // ...empty/default values for sticky fields
    })
  } catch (error) {
    next(error)
  }
}

// Handle form submission
invCont.addInventoryProcess = async function(req, res, next) {
  try {
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
      })
    }

    // Insert into DB
    const result = await invModel.addInventory(req.body);
    if (result) {
      req.flash("notice", "Inventory item added successfully!");
      nav = await utilities.getNav(); // update nav
      const classificationSelect = await utilities.buildClassificationList()
      return res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        messages: req.flash(),
        classificationSelect,
        errors: []
      })
    } else {
      req.flash("notice", "Failed to add inventory item.");
      return res.render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        messages: req.flash(),
        errors: [],
        ...req.body
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteInventory = async function(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const inv_id = req.params.inv_id;
    const item = await invModel.getInventoryById(inv_id);
    if (!item) {
      req.flash("notice", "Inventory item not found.");
      return res.redirect("/inv");
    }
    res.render("inventory/delete-confirm", {
      title: `Delete ${item.inv_make} ${item.inv_model}`,
      nav,
      item,
      messages: req.flash(),
      errors: []
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  WK 05 assignment - Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  try {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData && invData.length > 0 && invData[0].inv_id) {
      return res.json(invData)
    } else {
      next(new Error("No data returned"))
    }
  } catch (error) {
    next(error)
  }
}


module.exports = invCont;