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
      grid,
      errors: []
    })
  } catch (error) {
    console.error("Error in buildByClassificationId:", error)
    next(error)
  }
}

/* ***************************
 *  Build inventory detail view
 * ************************** */
invCont.buildByInventoryId = async function(req, res, next) {
  try {
    const inv_id = req.params.invId
    const data = await invModel.getInventoryById(inv_id)
    if (!data) {
      let nav = await utilities.getNav()
      return res.status(404).render("errors/error", {
        title: "404",
        message: "Vehicle not found.",
        nav,
        errors: []
      })
    }
    const detail = await utilities.buildVehicleDetail(data)
    let nav = await utilities.getNav()
    const vehicleName = `${data.inv_year} ${data.inv_make} ${data.inv_model}`
    res.render("./inventory/detail", {
      title: vehicleName,
      nav,
      detail,
      errors: []
    })
  } catch (error) {
    console.error("Error in buildByInventoryId:", error)
    next(error)
  }
}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    res.render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationSelect,
      errors: []
    })
  } catch (error) {
    console.error("Error in buildManagement:", error)
    next(error)
  }
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function(req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: []
    })
  } catch (error) {
    console.error("Error in buildAddClassification:", error)
    next(error)
  }
}

/* ***************************
 *  Process add classification
 * ************************** */
invCont.addClassificationProcess = async function(req, res, next) {
  try {
    console.log("Processing classification addition:", req.body)
    
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array())
      let nav = await utilities.getNav()
      return res.render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: errors.array()
      })
    }

    const { classification_name } = req.body
    
    // Check if classification already exists
    const existingClassification = await invModel.checkExistingClassification(classification_name)
    if (existingClassification) {
      console.log("Classification already exists:", classification_name)
      let nav = await utilities.getNav()
      return res.render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: [{ msg: "Classification name already exists. Please choose a different name." }]
      })
    }

    const regResult = await invModel.addClassification(classification_name)
    
    if (regResult) {
      console.log("Classification added successfully:", classification_name)
      req.flash("notice", `The ${classification_name} classification was successfully added.`)
      res.redirect("/inv/")
    } else {
      console.log("Failed to add classification:", classification_name)
      req.flash("notice", "Sorry, the classification addition failed.")
      res.redirect("/inv/add-classification")
    }
  } catch (error) {
    console.error("Error in addClassificationProcess:", error)
    req.flash("notice", "Sorry, there was an error processing the registration.")
    res.redirect("/inv/add-classification")
  }
}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function(req, res, next) {
  try {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList()
    res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: []
    })
  } catch (error) {
    console.error("Error in buildAddInventory:", error)
    next(error)
  }
}

/* ***************************
 *  Process add inventory
 * ************************** */
invCont.addInventoryProcess = async function(req, res, next) {
  try {
    console.log("Processing inventory addition:", req.body)
    
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array())
      let nav = await utilities.getNav()
      let classificationList = await utilities.buildClassificationList(req.body.classification_id)
      return res.render("./inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        errors: errors.array(),
        inv_make: req.body.inv_make,
        inv_model: req.body.inv_model,
        inv_year: req.body.inv_year,
        inv_description: req.body.inv_description,
        inv_image: req.body.inv_image,
        inv_thumbnail: req.body.inv_thumbnail,
        inv_price: req.body.inv_price,
        inv_miles: req.body.inv_miles,
        inv_color: req.body.inv_color,
        classification_id: req.body.classification_id
      })
    }

    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
    
    const regResult = await invModel.addInventory(
      inv_make, inv_model, inv_year, inv_description, inv_image, 
      inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
    )
    
    if (regResult) {
      console.log("Vehicle added successfully:", `${inv_year} ${inv_make} ${inv_model}`)
      req.flash("notice", `The ${inv_year} ${inv_make} ${inv_model} was successfully added.`)
      res.redirect("/inv/")
    } else {
      console.log("Failed to add vehicle:", `${inv_year} ${inv_make} ${inv_model}`)
      req.flash("notice", "Sorry, the vehicle addition failed.")
      res.redirect("/inv/add-inventory")
    }
  } catch (error) {
    console.error("Error in addInventoryProcess:", error)
    req.flash("notice", "Sorry, there was an error processing the vehicle addition.")
    res.redirect("/inv/add-inventory")
  }
}

/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.buildDeleteInventory = async function(req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getInventoryById(inv_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: [],
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price
    })
  } catch (error) {
    console.error("Error in buildDeleteInventory:", error)
    next(error)
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async function (req, res, next) {
  try {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0]) {
      return res.json(invData)
    } else {
      res.status(404).json({ message: "No data found" })
    }
  } catch (error) {
    console.error("Error in getInventoryJSON:", error)
    next(error)
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async function(req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getInventoryById(inv_id)
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList: classificationSelect,
      errors: [],
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    })
  } catch (error) {
    console.error("Error in buildEditInventory:", error)
    next(error)
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    console.log("Processing inventory update:", req.body)
    
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array())
      let nav = await utilities.getNav()
      const classificationSelect = await utilities.buildClassificationList(req.body.classification_id)
      const itemName = `${req.body.inv_make} ${req.body.inv_model}`
      return res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationList: classificationSelect,
        errors: errors.array(),
        inv_id: req.body.inv_id,
        inv_make: req.body.inv_make,
        inv_model: req.body.inv_model,
        inv_year: req.body.inv_year,
        inv_description: req.body.inv_description,
        inv_image: req.body.inv_image,
        inv_thumbnail: req.body.inv_thumbnail,
        inv_price: req.body.inv_price,
        inv_miles: req.body.inv_miles,
        inv_color: req.body.inv_color,
        classification_id: req.body.classification_id
      })
    }

    const { 
      inv_id: rawInvId,
      inv_make, 
      inv_model, 
      inv_description, 
      inv_image, 
      inv_thumbnail, 
      inv_price, 
      inv_year, 
      inv_miles, 
      inv_color, 
      classification_id 
    } = req.body
    
    // Handle case where inv_id might be an array
    const inv_id = Array.isArray(rawInvId) ? rawInvId[0] : rawInvId
    
    const updateResult = await invModel.updateInventory({
      inv_id,
      inv_make, 
      inv_model, 
      inv_description, 
      inv_image, 
      inv_thumbnail, 
      inv_price, 
      inv_year, 
      inv_miles, 
      inv_color, 
      classification_id
    })
    
    if (updateResult) {
      const itemName = updateResult.inv_make + " " + updateResult.inv_model
      req.flash("notice", `The ${itemName} was successfully updated.`)
      res.redirect("/inv/")
    } else {
      let nav = await utilities.getNav()
      const classificationList = await utilities.buildClassificationList(classification_id)
      const itemName = `${inv_make} ${inv_model}`
      req.flash("notice", "Sorry, the insert failed.")
      res.status(501).render("./inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationList,
        errors: null,
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
    }
  } catch (error) {
    console.error("Error in updateInventory:", error)
    req.flash("notice", "Sorry, there was an error processing the update.")
    res.redirect("/inv/")
  }
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function(req, res, next) {
  try {
    let nav = await utilities.getNav();
    
    // Collect the inv_id value from the URL parameters
    const inv_id = parseInt(req.params.inv_id);
    
    // Pass the inv_id value to a model-based function to delete the inventory item
    const deleteResult = await invModel.deleteInventory(inv_id);
    
    if (deleteResult) {
      // If the delete was successful, return a flash message to the inventory management view
      req.flash("notice", "The vehicle was successfully deleted.");
      res.redirect("/inv/");
    } else {
      // If the delete failed, return a flash failure message to the delete confirmation view
      req.flash("notice", "Sorry, the deletion failed.");
      // Redirect to the route to rebuild the delete view for the same inventory item
      res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    console.error("Error in deleteInventory:", error);
    // If there's an error, redirect back to the delete confirmation view
    const inv_id = parseInt(req.params.inv_id);
    req.flash("notice", "Sorry, there was an error processing the deletion.");
    res.redirect(`/inv/delete/${inv_id}`);
  }
}

module.exports = invCont