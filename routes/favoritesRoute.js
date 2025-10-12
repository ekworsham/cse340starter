const express = require("express")
const router = new express.Router()
const favoritesController = require("../controllers/favoritesController")
const utilities = require("../utilities")

// Route to toggle favorite status
router.post("/toggle", 
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(favoritesController.toggleFavorite)
)

// Route to display favorites page
router.get("/", 
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(favoritesController.buildFavorites)
)

module.exports = router