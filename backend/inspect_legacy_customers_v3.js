const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgres://postgres:Shobana%40805@localhost:5432/local_db'
});

async function check() {
  await client.connect();
  const res = await client.query("SELECT * FROM legacy_customers LIMIT 5");
  console.log("legacy_customers rows:", res.rows);
  await client.end();
}
check();
