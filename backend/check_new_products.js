const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgres://postgres:Shobana%40805@localhost:5432/local_db'
});

async function check() {
  await client.connect();
  const res = await client.query("SELECT count(*) FROM products");
  console.log("Current PRODUCTS count:", res.rows[0].count);
  await client.end();
}
check();
