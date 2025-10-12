-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    favorite_id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL,
    inv_id INTEGER NOT NULL,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favorites_account FOREIGN KEY (account_id) REFERENCES account (account_id) ON DELETE CASCADE,
    CONSTRAINT fk_favorites_inventory FOREIGN KEY (inv_id) REFERENCES inventory (inv_id) ON DELETE CASCADE,
    CONSTRAINT unique_favorite UNIQUE (account_id, inv_id)
);
-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_account_id ON favorites (account_id);
CREATE INDEX IF NOT EXISTS idx_favorites_inv_id ON favorites (inv_id);