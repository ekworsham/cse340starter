const { Pool } = require("pg")
require("dotenv").config()
/* ***************
 * Connection Pool
 * SSL Object needed for local testing of app
 * But will cause problems in production environment
 * If - else will make determination which to use
 * *************** */
let pool

// Check if DATABASE_URL is provided
if (!process.env.DATABASE_URL) {
  console.log("No DATABASE_URL provided. Please set up your database connection in .env file")
  // Create a mock pool for development without database
  module.exports = {
    async query(text, params) {
      console.log("Mock database query:", { text, params })
      return { rows: [] }
    }
  }
} else if (process.env.NODE_ENV == "development") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  // Added for troubleshooting queries during development
  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params)
        console.log("executed query", { text })
        return res
      } catch (error) {
        console.error("error in query", { text })
        throw error
      }
    },
  }
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  module.exports = pool
}