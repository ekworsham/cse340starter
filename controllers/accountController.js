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

/* ****************************************
 *  WK05 Assignment Process logout request
 * *************************************** */
async function accountLogout(req, res, next) {
  try {
    // Set a flash message BEFORE destroying the session
    req.flash("notice", "You have been logged out successfully.");
    
    // Clear the JWT cookie with proper options
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development'
    });
    
    // Redirect to homepage (don't destroy session here as flash message needs it)
    res.redirect("/");
  } catch (error) {
    console.error("Logout error:", error);
    // Clear the JWT cookie even if there's an error
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development'
    });
    res.redirect("/");
  }
}

/* ****************************************
 *  Build update account view
 * *************************************** */
async function buildUpdateAccount(req, res, next) {
  let nav = await utilities.getNav()
  
  // Get account data from JWT token (stored in res.locals.accountData)
  const accountData = res.locals.accountData
  res.render("account/update", {
    title: "Update Account Information",
    nav,
    errors: null,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_id: accountData.account_id,
    messages: req.flash()
  })
}

/* ****************************************
 *  Process account update
 * *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  
  // Verify the logged-in user is trying to update their own account
  if (parseInt(account_id) !== res.locals.accountData.account_id) {
    req.flash("notice", "You can only update your own account.")
    return res.redirect("/account/")
  }

  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname, 
    account_email,
    account_id
  )

  if (updateResult) {
    // Get updated account data from database
    const updatedAccountData = await accountModel.getAccountById(account_id)
    
    // Update JWT token with new data
    delete updatedAccountData.account_password // Remove password from token
    const accessToken = jwt.sign(updatedAccountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
    if(process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }
    
    req.flash("notice", "Account information updated successfully.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the account update failed.")
    res.render("account/update", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
      messages: req.flash()
    })
  }
}

/* ****************************************
 *  Process password change
 * *************************************** */
async function changePassword(req, res, next) {
  let nav = await utilities.getNav()
  const { account_password, account_id } = req.body
  
  // Verify the logged-in user is trying to update their own account
  if (parseInt(account_id) !== res.locals.accountData.account_id) {
    req.flash("notice", "You can only update your own account.")
    return res.redirect("/account/")
  }

  // Hash the new password
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the password change.')
    // Get account data for form repopulation
    const accountData = await accountModel.getAccountById(account_id)
    res.render("account/update", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id,
      messages: req.flash()
    })
    return
  }

  const updateResult = await accountModel.updatePassword(hashedPassword, account_id)

  if (updateResult) {
    req.flash("notice", "Password changed successfully.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the password change failed.")
    // Get account data for form repopulation
    const accountData = await accountModel.getAccountById(account_id)
    res.render("account/update", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id,
      messages: req.flash()
    })
  }
}

module.exports = { 
  buildLogin, 
  loginProcess, 
  buildRegister, 
  registerAccount, 
  accountLogin, 
  buildAccountManagement,
  buildUpdateAccount,
  updateAccount,
  changePassword,
  accountLogout 
}