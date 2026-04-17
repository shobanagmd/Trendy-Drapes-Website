const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgres://postgres:Shobana%40805@localhost:5432/local_db'
});

async function check() {
  await client.connect();
  const res = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name LIKE 'legacy_%'
    ORDER BY table_name
  `);
  
  for (const r of res.rows) {
    const countRes = await client.query(`SELECT count(*) FROM "${r.table_name}"`);
    console.log(`${r.table_name}: ${countRes.rows[0].count}`);
  }
  await client.end();
}
check();
