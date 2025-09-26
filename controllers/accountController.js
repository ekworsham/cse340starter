const utilities = require("../utilities");

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

/* ****************************************
*  Process login form submission
* *************************************** */
async function loginProcess(req, res, next) {
  // For now, just re-render the login view with a flash message
  let nav = await utilities.getNav()
  req.flash("notice", "Login processing not yet implemented.")
  res.render("account/login", {
    title: "Login",
    nav,
    messages: req.flash()
  })
}

module.exports = { buildLogin, loginProcess }