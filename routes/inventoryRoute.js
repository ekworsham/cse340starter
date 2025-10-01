// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities");
const classificationValidate = require("../utilities/classification-validation");

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
router.post(
  "/add-classification",
  classificationValidate, // your validation middleware
  utilities.handleErrors(invController.addClassificationProcess)
);

module.exports = router;