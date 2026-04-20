require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const res = await pool.query("SELECT * FROM customer LIMIT 1");
    console.log("Customer structure:", res.rows[0] ? Object.keys(res.rows[0]) : "No data");
    
    // Also check products
    const resProd = await pool.query("SELECT * FROM products LIMIT 1");
    console.log("Product structure:", resProd.rows[0] ? Object.keys(resProd.rows[0]) : "No data");
  } catch (err) {
    console.error("Database error:", err.message);
  } finally {
    await pool.end();
  }
}
check();

