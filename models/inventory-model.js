const pool = require("../database/")

/* *******************************************
 * Get all classification data
* ******************************************** */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")   
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  THIS IS STEP # 3 and I added getInventoryById to my modeul.exports

Get inventory item by ID
 * ************************** */
async function getInventoryById(invId) {
  const data = await pool.query(
    "SELECT * FROM public.inventory WHERE inv_id = $1",
    [invId]
  )
  return data.rows[0]
}

/* ***************************
 *  THIS IS WK04 task 2 
****************************** */
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0];
  } catch (error) {
    console.error("Add classification error:", error);
    return null;
  }
}

module.exports = { getClassifications, getInventoryByClassificationId, getInventoryById, addClassification };