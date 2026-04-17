const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runTest() {
  try {
    console.log("--- GETTING TEST DATA ---");
    const custRes = await pool.query("SELECT customer_id FROM customers LIMIT 1");
    if (custRes.rows.length === 0) {
      console.log("No customers found");
      return;
    }
    const customer_id = custRes.rows[0].customer_id;
    console.log("Using customer_id:", customer_id);

    const prodRes = await pool.query("SELECT product_id FROM products LIMIT 1");
    if (prodRes.rows.length === 0) {
      console.log("No products found");
      return;
    }
    const product_id = prodRes.rows[0].product_id;
    console.log("Using product_id:", product_id);

    // Simulate addToCart logic
    console.log("\n--- TESTING ADD TO CART ---");
    const testSize = "XL-Test";
    
    // 1. Get or create cart
    let cartRes = await pool.query("SELECT cart_id FROM carts WHERE customer_id = $1", [customer_id]);
    let cart_id;
    if (cartRes.rows.length === 0) {
      console.log("Creating new cart...");
      const newCart = await pool.query("INSERT INTO carts (customer_id) VALUES ($1) RETURNING cart_id", [customer_id]);
      cart_id = newCart.rows[0].cart_id;
    } else {
      cart_id = cartRes.rows[0].cart_id;
    }
    console.log("Using cart_id:", cart_id);

    // 2. Add item
    await pool.query(
      "INSERT INTO cart_items (cart_id, product_id, size, quantity) VALUES ($1, $2, $3, $4)",
      [cart_id, product_id, testSize, 1]
    );
    console.log("Item added successfully");

    // 3. Verify item
    const verifyRes = await pool.query(
      "SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2 AND size = $3",
      [cart_id, product_id, testSize]
    );
    console.log("Verification result:", verifyRes.rows[0]);

    if (verifyRes.rows.length > 0 && verifyRes.rows[0].size === testSize) {
      console.log("\nSUCCESS: Cart functionality verified on database level.");
    } else {
      console.log("\nFAILURE: Verification failed.");
    }

    // Cleanup test item
    await pool.query("DELETE FROM cart_items WHERE cart_id = $1 AND size = $2", [cart_id, testSize]);
    console.log("Cleaned up test item.");

  } catch (err) {
    console.error("TEST ERROR:", err);
  } finally {
    await pool.end();
  }
}

runTest();
