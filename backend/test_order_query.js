const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:Shobana%40805@localhost:5432/local_db'
});

async function testQuery() {
  await client.connect();
  
  const testIds = [
    'fe9e8c04-0738-4334-bbdf-7ff47ba07084', // Valid
    '123', // Invalid legacy
    '', // Empty
    null // Null
  ];

  for(const id of testIds) {
    console.log(`Testing with ID: [${id}]`);
    try {
      const result = await client.query(`
        SELECT o.order_id, o.customer_id, o.address_id, o.coupon_id, o.subtotal, 
               o.discount_amount, o.tax_amount, o.shipping_charge, o.total_amount, 
               o.order_status, o.payment_status, o.placed_at, o.updated_at,
               COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
                 'item_id', oi.order_item_id,
                 'product_name', p.name,
                 'quantity', oi.quantity,
                 'price', oi.unit_price
               )) FILTER (WHERE oi.order_item_id IS NOT NULL), '[]'::json) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.product_id
        WHERE o.customer_id = $1
        GROUP BY o.order_id
        ORDER BY o.placed_at DESC
      `, [id]);
      console.log(`Query Successful. Count: ${result.rows.length}`);
    } catch (err) {
      console.error(`Query Failed: ${err.message}`);
    }
    console.log("-------------------");
  }
  
  await client.end();
}

testQuery();
