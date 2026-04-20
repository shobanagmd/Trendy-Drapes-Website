require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  await client.connect();
  const p1 = await client.query("SELECT sku FROM legacy_products");
  const p2 = await client.query("SELECT sku FROM legacy_admin_products");
  
  const s1 = new Set(p1.rows.map(r => r.sku));
  const s2 = new Set(p2.rows.map(r => r.sku));
  
  const intersection = [...s1].filter(x => s2.has(x));
  console.log("Overlap SKUs:", intersection.length);
  console.log("Unique in legacy_products:", p1.rows.length);
  console.log("Unique in legacy_admin_products:", p2.rows.length);
  await client.end();
}
check();
