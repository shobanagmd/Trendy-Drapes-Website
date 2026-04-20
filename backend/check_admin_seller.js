require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  await client.connect();
  const res = await client.query("SELECT * FROM sellers WHERE email LIKE 'admin%'");
  console.log("Admin Sellers:", res.rows);
  await client.end();
}
check();
