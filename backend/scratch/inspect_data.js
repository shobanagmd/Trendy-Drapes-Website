const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function inspectData() {
  try {
    console.log("--- PRODUCT IMAGES PREVIEW ---");
    const piRes = await pool.query("SELECT * FROM product_images LIMIT 10");
    console.table(piRes.rows);

    console.log("\n--- ORDERS DATA PREVIEW ---");
    const oRes = await pool.query(`
      SELECT o.order_id, o.total_amount, o.placed_at, o.address_id 
      FROM orders o 
      LIMIT 5
    `);
    console.table(oRes.rows);

    console.log("\n--- ADDRESSES DATA PREVIEW ---");
    const aRes = await pool.query("SELECT * FROM addresses LIMIT 5");
    console.table(aRes.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

inspectData();
