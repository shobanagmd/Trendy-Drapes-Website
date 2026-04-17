const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkOrderSchema() {
  try {
    console.log("--- CHECKING ORDERS ---");
    const orders = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders'");
    console.log(orders.rows);

    console.log("\n--- CHECKING ORDER_ITEMS ---");
    const orderItems = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'order_items'");
    console.log(orderItems.rows);

    console.log("\n--- CHECKING ORDER_STATUS_HISTORY ---");
    const history = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'order_status_history'");
    console.log(history.rows);

    console.log("\n--- CHECKING ADDRESSES ---");
    const addresses = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'addresses'");
    console.log(addresses.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkOrderSchema();
