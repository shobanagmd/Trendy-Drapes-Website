const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkSchema() {
  try {
    console.log("--- CHECKING CART_ITEMS ---");
    const cartItems = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cart_items'");
    console.log(cartItems.rows);

    console.log("\n--- CHECKING CARTS ---");
    const carts = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'carts'");
    console.log(carts.rows);

    console.log("\n--- CHECKING CUSTOMERS ---");
    const customers = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'customers'");
    console.log(customers.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkSchema();
