const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");

// GET route for "My Account" page
router.get("/", utilities.handleErrors(accountController.buildAccount));

// Export the router
module.exports = router;