require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  await client.connect();
  const res = await client.query("SELECT * FROM categories");
  console.log("Current Categories:", res.rows);
  await client.end();
}
check();
