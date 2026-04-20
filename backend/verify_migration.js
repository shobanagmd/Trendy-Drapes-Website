require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  await client.connect();
  const prodRes = await client.query("SELECT * FROM products LIMIT 5");
  console.log("SAMPLE PRODUCTS:", prodRes.rows.map(r => ({ name: r.name, category_id: r.category_id })));
  
  const imgRes = await client.query("SELECT count(*) FROM product_images");
  console.log("TOTAL PRODUCT IMAGES:", imgRes.rows[0].count);
  
  const catRes = await client.query("SELECT name, category_id FROM categories");
  console.log("CATEGORIES:", catRes.rows);
  
  await client.end();
}
check();
