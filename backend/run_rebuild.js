const fs = require('fs');
const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgres://postgres:Shobana%40805@localhost:5432/local_db'
});

async function run() {
  await client.connect();
  const sql = fs.readFileSync('rebuild_schema.sql', 'utf8');
  await client.query(sql);
  console.log("Schema rebuilt successfully");
  await client.end();
}
run().catch(console.error);
