require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  await client.connect();
  const res = await client.query("SELECT * FROM legacy_customers LIMIT 5");
  console.log("legacy_customers rows:", res.rows);
  await client.end();
}
check();
