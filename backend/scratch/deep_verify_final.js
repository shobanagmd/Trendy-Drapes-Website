const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function deepVerify() {
  try {
    console.log("--- FINDING ANY VALID ORDER ---");
    const orderRes = await pool.query("SELECT customer_id FROM orders WHERE customer_id IS NOT NULL LIMIT 1");
    if (orderRes.rows.length === 0) return console.log("No orders found.");
    const customer_id = orderRes.rows[0].customer_id;

    console.log("\n--- EXECUTING ROBUST QUERY ---");
    const result = await pool.query(`
      SELECT o.order_id, o.customer_id, o.address_id, o.coupon_id, 
             COALESCE(o.subtotal, 0) AS subtotal, 
             COALESCE(o.discount_amount, 0) AS discount, 
             COALESCE(o.tax_amount, 0) AS gst, 
             COALESCE(o.shipping_charge, 0) AS delivery_fee, 
             COALESCE(o.total_amount, 0) AS total, 
             o.order_status AS status, o.payment_status, 
             o.placed_at AS created_at, o.updated_at,
             COALESCE(a.full_name, c.full_name, 'Valued Customer') AS customer_name,
             COALESCE(a.phone, c.phone, '') AS customer_phone,
             JSON_BUILD_OBJECT(
               'address', COALESCE(a.address_line_1, ''),
               'city', COALESCE(a.city, ''),
               'state', COALESCE(a.state, ''),
               'pincode', COALESCE(a.pincode, ''),
               'country', COALESCE(a.country, 'India')
             ) AS shipping_address,
             COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
               'item_id', oi.order_item_id,
               'product_id', p.product_id,
               'product_name', p.name,
               'product_image', img.image_url,
               'quantity', COALESCE(oi.quantity, 1),
               'price', COALESCE(oi.unit_price, 0)
             )) FILTER (WHERE oi.order_item_id IS NOT NULL), '[]'::json) as items
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN addresses a ON o.address_id = a.address_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.product_id
      LEFT JOIN LATERAL (
        SELECT image_url FROM product_images pi 
        WHERE pi.product_id = p.product_id 
        ORDER BY pi.is_primary DESC 
        LIMIT 1
      ) img ON TRUE
      WHERE o.customer_id = $1
      GROUP BY o.order_id, c.customer_id, a.address_id
      ORDER BY o.placed_at DESC
    `, [customer_id]);

    const order = result.rows[0];
    const errors = [];

    // Check Numbers
    if (isNaN(Number(order.total))) errors.push("Total is not a valid number: " + order.total);
    if (isNaN(Number(order.gst))) errors.push("GST is not a valid number: " + order.gst);
    if (isNaN(Number(order.delivery_fee))) errors.push("Delivery Fee is not a valid number: " + order.delivery_fee);
    if (isNaN(Number(order.discount))) errors.push("Discount is not a valid number: " + order.discount);
    if (isNaN(Number(order.subtotal))) errors.push("Subtotal is not a valid number: " + order.subtotal);

    // Check Objects
    if (!order.shipping_address || typeof order.shipping_address !== 'object') errors.push("shipping_address is not an object");
    if (!order.items || !Array.isArray(order.items)) errors.push("items is not an array");

    // Check Images
    if (order.items.length > 0) {
      const item = order.items[0];
      if (!item.product_image || !item.product_image.startsWith("/uploads/")) {
        console.warn("WARNING: Product image URL might be missing or invalid:", item.product_image);
      }
    }

    if (errors.length === 0) {
      console.log("\nSUCCESS: All defensive checks passed. API JSON is robust.");
      console.log("Sample Order JSON Preview (first few fields):");
      console.log({
        total: order.total,
        gst: order.gst,
        customer_name: order.customer_name,
        address: order.shipping_address.address,
        first_item_img: order.items[0]?.product_image
      });
    } else {
      console.log("\nFAILURE: Defensive checks failed:");
      console.table(errors);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

deepVerify();
