const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgres://postgres:Shobana%40805@localhost:5432/local_db'
});

async function check() {
  await client.connect();
  const res = await client.query("SELECT * FROM legacy_customer LIMIT 1");
  console.log("legacy_customer COLUMNS:", Object.keys(res.rows[0] || {}));
  console.log("FIRST ROW:", res.rows[0]);
  await client.end();
}
check();
