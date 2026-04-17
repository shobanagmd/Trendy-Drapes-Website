const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:Shobana%40805@localhost:5432/local_db'
});

async function debugEndpoints() {
  await client.connect();
  
  console.log("--- DEBUGGING REVIEWS ENDPOINT (FIXED) ---");
  try {
     const productId = '50c7ca0c-84df-4f1f-be0d-9645e1b7f460';
     // No more split!
     const rawId = productId; 
     console.log("Using rawId:", rawId);
     
     const reviewsRes = await client.query(`
       SELECT r.*, c.full_name as customer_name
       FROM reviews r
       JOIN customers c ON r.customer_id = c.customer_id
       WHERE r.product_id = $1
     `, [rawId]); 
     console.log("Reviews success, count:", reviewsRes.rows.length);
  } catch (err) {
     console.error("REVIEWS ERROR:", err.message);
  }

  console.log("\n--- DEBUGGING ORDERS ENDPOINT (RE-VERIFIED) ---");
  try {
    const custRes = await client.query("SELECT customer_id FROM customers LIMIT 1");
    if (custRes.rows.length === 0) {
      console.log("No customers found");
    } else {
      const customer_id = custRes.rows[0].customer_id;
      console.log("Using customer_id:", customer_id);
      
      const ordersRes = await client.query(`
        SELECT o.*, 
               JSON_AGG(JSON_BUILD_OBJECT(
                 'item_id', oi.order_item_id,
                 'product_name', p.name,
                 'quantity', oi.quantity,
                 'price', oi.unit_price
               )) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.product_id
        WHERE o.customer_id = $1
        GROUP BY o.order_id
        ORDER BY o.placed_at DESC
      `, [customer_id]);
      console.log("Orders success, count:", ordersRes.rows.length);
    }
  } catch (err) {
    console.error("ORDERS ERROR:", err.message);
  }

  await client.end();
}

debugEndpoints();
