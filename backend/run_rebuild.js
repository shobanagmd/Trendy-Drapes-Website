require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const fs = require('fs');
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  await client.connect();
  const sql = fs.readFileSync('rebuild_schema.sql', 'utf8');
  await client.query(sql);
  console.log("Schema rebuilt successfully");
  await client.end();
}
run().catch(console.error);
