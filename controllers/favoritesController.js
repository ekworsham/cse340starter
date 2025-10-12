const favoritesModel = require("../models/favorites-model")
const utilities = require("../utilities/")

const favCont = {}

/* ***************************
 *  Toggle favorite status
 * ************************** */
favCont.toggleFavorite = async function (req, res, next) {
  try {
    const { inv_id } = req.body
    const account_id = res.locals.accountData.account_id

    // Validate input
    if (!inv_id || !account_id) {
      req.flash("notice", "Invalid request. Please try again.")
      return res.redirect("back")
    }

    // Check if already favorited
    const isCurrentlyFavorite = await favoritesModel.isFavorite(account_id, inv_id)
    
    let result
    let message
    
    if (isCurrentlyFavorite) {
      // Remove from favorites
      result = await favoritesModel.removeFromFavorites(account_id, inv_id)
      message = result ? "Vehicle removed from favorites." : "Failed to remove from favorites."
    } else {
      // Add to favorites
      result = await favoritesModel.addToFavorites(account_id, inv_id)
      message = result ? "Vehicle added to favorites!" : "Failed to add to favorites."
    }

    req.flash("notice", message)
    
    // Return JSON for AJAX requests
    if (req.xhr || req.headers.accept?.indexOf('json') > -1 || req.headers['content-type']?.indexOf('json') > -1) {
      return res.json({
        success: !!result,
        isFavorite: !isCurrentlyFavorite,
        message: message
      })
    }
    
    // Redirect for regular requests
    res.redirect("back")
    
  } catch (error) {
    console.error("Toggle favorite error:", error)
    req.flash("notice", "An error occurred. Please try again.")
    res.redirect("back")
  }
}

/* ***************************
 *  Display user's favorites page
 * ************************** */
favCont.buildFavorites = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const account_id = res.locals.accountData.account_id
    
    // Get user's favorite vehicles
    const favorites = await favoritesModel.getUserFavorites(account_id)
    
    // Build favorites grid HTML
    let favoritesGrid = ""
    if (favorites.length > 0) {
      favoritesGrid = await utilities.buildFavoritesGrid(favorites)
    } else {
      favoritesGrid = '<p class="no-favorites">You haven\'t added any vehicles to your favorites yet. <a href="/inv/browse">Browse vehicles</a> to find vehicles you love!</p>'
    }
    
    res.render("./Favorites/favorites", {
      title: "My Favorites",
      nav,
      favoritesGrid,
      errors: null,
    })
    
  } catch (error) {
    console.error("Build favorites error:", error)
    next(error)
  }
}

module.exports = favCont