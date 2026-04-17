const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgres://postgres:Shobana%40805@localhost:5432/local_db'
});

async function check() {
  await client.connect();
  const res = await client.query("SELECT * FROM categories");
  console.log("Current Categories:", res.rows);
  await client.end();
}
check();
