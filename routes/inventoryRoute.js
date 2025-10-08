// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const { classificationValidate, inventoryValidate, checkInventoryData, checkUpdateData, checkClassificationData } = require("../utilities/inventory-validation")

// ==========================================
// PUBLIC ROUTES (No authentication required)
// ==========================================

// Route to build inventory by classification view (PUBLIC)
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to build inventory item detail view (PUBLIC)
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId))

// JSON route for AJAX (PUBLIC - for populating management table)
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// ==========================================
// ADMIN ROUTES (Employee/Admin access required)
// ==========================================

// Route to build inventory management view (ADMIN ONLY)
router.get("/", utilities.checkAccountType, utilities.handleErrors(invController.buildManagement))

// ==========================================
// CLASSIFICATION ADMIN ROUTES
// ==========================================

// Route to build add classification view (ADMIN ONLY)
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification))

// Route to process add classification (ADMIN ONLY)
router.post("/add-classification", 
  utilities.checkAccountType,
  classificationValidate,
  checkClassificationData,
  utilities.handleErrors(invController.addClassificationProcess)
)

// ==========================================
// INVENTORY ADMIN ROUTES
// ==========================================

// Route to build add inventory view (ADMIN ONLY)
router.get("/add-inventory", utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory))

// Route to process add inventory (ADMIN ONLY)
router.post("/add-inventory",
  utilities.checkAccountType,
  inventoryValidate,
  checkInventoryData,
  utilities.handleErrors(invController.addInventoryProcess)
)

// Route to build edit inventory view (ADMIN ONLY)
router.get("/edit/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.buildEditInventory))

// Route to process update inventory (ADMIN ONLY)
router.post("/update/",
  utilities.checkAccountType,
  inventoryValidate,
  checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

// Route to build delete confirmation view (ADMIN ONLY)
router.get("/delete/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.buildDeleteInventory))

// Route to process delete inventory (ADMIN ONLY)
router.post("/delete/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.deleteInventory))

module.exports = router