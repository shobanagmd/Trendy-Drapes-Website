require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  await client.connect();
  const res = await client.query("SELECT * FROM legacy_products LIMIT 1");
  console.log("legacy_products COLUMNS:", Object.keys(res.rows[0] || {}));
  await client.end();
}
check();
