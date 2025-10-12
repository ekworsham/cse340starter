const pool = require("../database/")

/* ***************************
 *  Add vehicle to favorites
 * ************************** */
async function addToFavorites(account_id, inv_id) {
  try {
    const sql = "INSERT INTO favorites (account_id, inv_id) VALUES ($1, $2) RETURNING *"
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rows[0]
  } catch (error) {
    console.error("Add to favorites error: " + error)
    return null
  }
}

/* ***************************
 *  Remove vehicle from favorites
 * ************************** */
async function removeFromFavorites(account_id, inv_id) {
  try {
    const sql = "DELETE FROM favorites WHERE account_id = $1 AND inv_id = $2 RETURNING *"
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rows[0]
  } catch (error) {
    console.error("Remove from favorites error: " + error)
    return null
  }
}

/* ***************************
 *  Get user's favorite vehicles
 * ************************** */
async function getUserFavorites(account_id) {
  try {
    const sql = `SELECT f.favorite_id, f.date_added, i.*, c.classification_name 
                 FROM favorites f
                 JOIN inventory i ON f.inv_id = i.inv_id
                 JOIN classification c ON i.classification_id = c.classification_id
                 WHERE f.account_id = $1
                 ORDER BY f.date_added DESC`
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    console.error("Get user favorites error: " + error)
    return []
  }
}

/* ***************************
 *  Check if vehicle is favorited by user
 * ************************** */
async function isFavorite(account_id, inv_id) {
  try {
    const sql = "SELECT favorite_id FROM favorites WHERE account_id = $1 AND inv_id = $2"
    const result = await pool.query(sql, [account_id, inv_id])
    return result.rows.length > 0
  } catch (error) {
    console.error("Check favorite error: " + error)
    return false
  }
}

/* ***************************
 *  Get favorite count for vehicle
 * ************************** */
async function getFavoriteCount(inv_id) {
  try {
    const sql = "SELECT COUNT(*) as count FROM favorites WHERE inv_id = $1"
    const result = await pool.query(sql, [inv_id])
    return parseInt(result.rows[0].count)
  } catch (error) {
    console.error("Get favorite count error: " + error)
    return 0
  }
}

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  isFavorite,
  getFavoriteCount
}