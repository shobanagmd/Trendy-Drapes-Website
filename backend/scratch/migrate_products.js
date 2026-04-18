const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'Shobana@805',
  port: 5432,
});

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS fabric VARCHAR(100),
      ADD COLUMN IF NOT EXISTS color VARCHAR(100),
      ADD COLUMN IF NOT EXISTS work VARCHAR(255),
      ADD COLUMN IF NOT EXISTS pattern VARCHAR(100),
      ADD COLUMN IF NOT EXISTS ready_to_ship BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(15,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS additional_charge DECIMAL(15,2) DEFAULT 0;
    `);
    console.log('Columns added successfully');
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrate();
