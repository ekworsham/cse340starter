const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");

// GET route for "My Account" page
router.get("/", utilities.handleErrors(accountController.buildLogin));

// GET route for login page - WK04 "The Login View" section was added
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// GET route for registration page
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// POST route for login form 
router.post("/login", utilities.handleErrors(accountController.loginProcess));

// Export the router
module.exports = router;