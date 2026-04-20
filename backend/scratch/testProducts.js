require('dotenv').config();
const db = require('../src/config/db');

async function test() {
  try {
    console.log('Fetching products...');
    const result = await db.query(`
      SELECT p.name, s.store_name
      FROM products p
      LEFT JOIN sellers s ON p.seller_id = s.seller_id
      LIMIT 5
    `);
    console.log('QueryResult:', JSON.stringify(result.rows, null, 2));
  } catch (err) {
    console.error('Fetch Error:', err);
  } finally {
    process.exit();
  }
}

test();
