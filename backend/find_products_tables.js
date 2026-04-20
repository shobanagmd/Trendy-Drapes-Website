require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  await client.connect();
  const res = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_name LIKE '%product%' AND table_schema = 'public'
    ORDER BY table_name
  `);
  console.log("PRODUCT TABLES FOUND:", res.rows.length);
  res.rows.forEach(r => console.log(r.table_name));
  await client.end();
}
check();
