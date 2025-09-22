const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

// THIS IS STEP #2 
invCont.buildByInventoryId = async function(req, res, next) {
  try {
    const invId = req.params.invId
    const item = await invModel.getInventoryById(invId)
    let nav = await utilities.getNav()
    if (!item) {
      return res.status(404).render("errors/error", { title: "404", message: "Vehicle not found.", nav })
    }
    const detail = utilities.buildDetailView(item)
    res.render("inventory/detail", {
      title: item.inv_make + " " + item.inv_model,
      nav,
      item,
      detail
    })
  } catch (error) {
    next(error)
  }
}



module.exports = invCont