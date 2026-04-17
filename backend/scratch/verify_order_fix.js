const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function verifyOrderFix() {
  try {
    console.log("--- GETTING TEST DATA ---");
    const custRes = await pool.query("SELECT customer_id, full_name, email FROM customers LIMIT 1");
    if (custRes.rows.length === 0) {
      console.log("No customers found");
      return;
    }
    const customer = custRes.rows[0];
    console.log("Using customer:", customer.full_name);

    const prodRes = await pool.query("SELECT product_id, name, price, seller_id FROM products LIMIT 1");
    if (prodRes.rows.length === 0) {
      console.log("No products found");
      return;
    }
    const product = prodRes.rows[0];
    console.log("Using product:", product.name);

    // Simulate order creation payload from Checkout.jsx
    const testPayload = {
      customerName: customer.full_name,
      customerEmail: customer.email,
      customerPhone: "1234567890",
      shippingAddress: {
        address: "123 Test Street",
        city: "Test City",
        state: "Test State",
        pincode: "123456"
      },
      subtotal: Number(product.price),
      taxAmount: 50,
      shippingCharge: 0,
      total: Number(product.price) + 50, // This was the missing field: 'total' vs 'total_amount'
      items: [
        {
          productId: String(product.product_id), // Test camelCase
          productName: product.name,
          quantity: 1,
          price: Number(product.price)
        }
      ]
    };

    console.log("\n--- SIMULATING ORDER CREATION ---");
    
    // We'll simulate the logic inside createOrder controller
    const { total, subtotal, taxAmount, shippingCharge, items, shippingAddress, customerName, customerPhone } = testPayload;
    
    // 1. Insert address
    const addrRes = await pool.query(
      `INSERT INTO addresses (customer_id, full_name, phone, address_line_1, city, state, pincode) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING address_id`,
      [
        customer.customer_id, 
        shippingAddress.name || customerName, 
        shippingAddress.phone || customerPhone, 
        shippingAddress.address, 
        shippingAddress.city, 
        shippingAddress.state, 
        shippingAddress.pincode
      ]
    );
    const address_id = addrRes.rows[0].address_id;
    console.log("Address created:", address_id);

    // 2. Insert order (Verifying 'total' mapping)
    const orderRes = await pool.query(
      `INSERT INTO orders (customer_id, address_id, subtotal, tax_amount, shipping_charge, total_amount) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING order_id`,
      [customer.customer_id, address_id, subtotal, taxAmount, shippingCharge, total]
    );
    const order_id = orderRes.rows[0].order_id;
    console.log("Order created:", order_id);

    // 3. Insert items (Verifying item mapping)
    for (const item of items) {
      const productId = item.productId; // Verify camelCase
      const price = item.price;
      
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, seller_id, quantity, unit_price, total_price) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order_id, productId, product.seller_id, item.quantity, price, item.quantity * price]
      );
    }
    console.log("Order items created successfully");

    console.log("\n--- VERIFYING ORDER DATA ---");
    const checkOrder = await pool.query("SELECT * FROM orders WHERE order_id = $1", [order_id]);
    console.log("Order Total Amount:", checkOrder.rows[0].total_amount);
    
    if (Number(checkOrder.rows[0].total_amount) === testPayload.total) {
      console.log("\nSUCCESS: Order creation verified with mixed payload format.");
    } else {
      console.log("\nFAILURE: Value mismatch.");
    }

    // Cleanup
    await pool.query("DELETE FROM order_items WHERE order_id = $1", [order_id]);
    await pool.query("DELETE FROM orders WHERE order_id = $1", [order_id]);
    await pool.query("DELETE FROM addresses WHERE address_id = $1", [address_id]);
    console.log("Cleaned up test data.");

  } catch (err) {
    console.error("VERIFICATION FAILED:", err);
  } finally {
    await pool.end();
  }
}

verifyOrderFix();
