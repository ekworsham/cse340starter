// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities");
const classificationValidate = require("../utilities/classification-validation");
const inventoryValidate = require("../utilities/inventory-validation");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);


// THIS IS STEP #1
// Route to build inventory item detail view
router.get("/detail/:invId", invController.buildByInventoryId);

// In routes/inventoryRoute.js
router.get("/", utilities.handleErrors(invController.buildManagement));

// Show the add-classification form
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

// Handle form submission
router.post("/add-classification", classificationValidate, // the validation middleware
  utilities.handleErrors(invController.addClassificationProcess)
);

// WK04 Task 3 Show the add-inventory form
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));

// Handle form submission the validation middleware
router.post("/add-inventory", inventoryValidate, utilities.handleErrors(invController.addInventoryProcess)
);

//  WK05 Team Activity DELETE
router.get("/delete/:inv_id", utilities.handleErrors(invController.buildDeleteInventory));

router.post("/delete/:inv_id", utilities.handleErrors(invController.deleteInventory));



module.exports = router;