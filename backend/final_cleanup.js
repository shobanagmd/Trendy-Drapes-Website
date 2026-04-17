const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgres://postgres:Shobana%40805@localhost:5432/local_db'
});

async function cleanup() {
  await client.connect();
  const res = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name LIKE 'legacy_%'
  `);
  
  console.log(`Dropping ${res.rows.length} legacy tables...`);
  for (const r of res.rows) {
    await client.query(`DROP TABLE IF EXISTS "${r.table_name}" CASCADE`);
    console.log(`Dropped ${r.table_name}`);
  }
  
  const finalRes = await client.query(`
    SELECT count(*) FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `);
  console.log(`Final Table Count: ${finalRes.rows[0].count}`);
  await client.end();
}
cleanup();
