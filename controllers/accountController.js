const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ***************************************
*  Deliver login view
**************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: [],
    messages: req.flash()
  })
}

/* ***************************************
*  Deliver registration view
**************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: []
  })
}

/* ***************************************
*  Process login form submission
**************************************** */
async function loginProcess(req, res, next) {
  // For now, just re-render the login view with a flash message
  let nav = await utilities.getNav()
  req.flash("notice", "Login processing not yet implemented.")
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    messages: req.flash()
  })
}

/* ***************************************
*  Process Registration
**************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: [],
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: [],
      messages: req.flash()
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: [],
      account_firstname,
      account_lastname,
      account_email,
      messages: req.flash()
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  console.log("Login attempt started") // Debug log
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  console.log("Email:", account_email) // Debug log
  const accountData = await accountModel.getAccountByEmail(account_email)
  console.log("Account found:", !!accountData) // Debug log
  if (!accountData) {
    console.log("No account found for email") // Debug log
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: [],
      account_email,
      messages: req.flash()
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: [],
        account_email,
        messages: req.flash()
      })
    }
  } catch (error) {
    console.log("Login error:", error) // Debug log
    req.flash("notice", "An error occurred during login. Please try again.")
    res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: [],
      account_email,
      messages: req.flash()
    })
  }
}

/* ****************************************
 *  WK05 Build account management view
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account Management",
    nav,
    messages: req.flash(),
    errors: []
  });
};

module.exports = { buildLogin, loginProcess, buildRegister, registerAccount, accountLogin, buildAccountManagement }