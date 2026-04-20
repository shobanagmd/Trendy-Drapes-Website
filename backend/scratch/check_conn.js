require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function checkConnections() {
  try {
    const res = await pool.query("SELECT count(*) FROM pg_stat_activity");
    console.log("Total connections:", res.rows[0].count);
    
    const details = await pool.query("SELECT state, count(*) FROM pg_stat_activity GROUP BY state");
    console.log("Connection details:", details.rows);
    
    await pool.end();
  } catch (err) {
    console.error("Error checking connections:", err.message);
  }
}

checkConnections();
