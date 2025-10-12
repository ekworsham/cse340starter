const pool = require('./index.js');

async function createFavoritesTable() {
  try {
    console.log('Creating favorites table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS favorites (
          favorite_id SERIAL PRIMARY KEY,
          account_id INTEGER NOT NULL,
          inv_id INTEGER NOT NULL,
          date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_favorites_account
              FOREIGN KEY (account_id) 
              REFERENCES account (account_id)
              ON DELETE CASCADE,
          CONSTRAINT fk_favorites_inventory
              FOREIGN KEY (inv_id) 
              REFERENCES inventory (inv_id)
              ON DELETE CASCADE,
          CONSTRAINT unique_favorite
              UNIQUE (account_id, inv_id)
      );
    `;
    
    await pool.query(createTableSQL);
    console.log('Favorites table created successfully!');
    
    // Create indexes
    const indexSQL1 = `CREATE INDEX IF NOT EXISTS idx_favorites_account_id ON favorites (account_id);`;
    const indexSQL2 = `CREATE INDEX IF NOT EXISTS idx_favorites_inv_id ON favorites (inv_id);`;
    
    await pool.query(indexSQL1);
    await pool.query(indexSQL2);
    console.log('Indexes created successfully!');
    
    // Test the table
    const testSQL = `SELECT COUNT(*) FROM favorites;`;
    const result = await pool.query(testSQL);
    console.log('Table test successful. Current favorite count:', result.rows[0].count);
    
  } catch (error) {
    console.error('Error creating favorites table:', error);
  } finally {
    process.exit();
  }
}

createFavoritesTable();