
const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require('../utilities/account-validation')

// GET route for "My Account" page
router.get("/", utilities.handleErrors(accountController.buildLogin));

// GET route for login page - WK04 "The Login View" section was added
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// GET route for registration page
router.get("/register", utilities.handleErrors(accountController.buildRegister));

router.post('/register', 
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// POST route for login form 
router.post("/login", utilities.handleErrors(accountController.loginProcess));

// TEMPORARY Process the login attempt
router.post(
  "/login",
  (req, res) => {
    res.status(200).send('login process')
  }
)

// Export the router
module.exports = router;