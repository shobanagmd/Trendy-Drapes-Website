require('dotenv').config({ path: require('path').resolve(__dirname, 'backend', '.env') });
const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function migrate() {
  try {
    await pool.query("ALTER TABLE seller ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE");
    console.log("Column onboarding_completed added to seller table successfully.");
    await pool.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
