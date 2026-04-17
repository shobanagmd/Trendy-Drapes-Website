const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgres://postgres:Shobana%40805@localhost:5432/local_db'
});

async function check() {
  await client.connect();
  const res = await client.query("SELECT * FROM sellers WHERE email LIKE 'admin%'");
  console.log("Admin Sellers:", res.rows);
  await client.end();
}
check();
