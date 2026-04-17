const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkNullable() {
  try {
    console.log("--- ADDRESSES ---");
    const res = await pool.query("SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'addresses'");
    console.log(res.rows);

    console.log("\n--- ORDER_ITEMS ---");
    const res2 = await pool.query("SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'order_items'");
    console.log(res2.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkNullable();
