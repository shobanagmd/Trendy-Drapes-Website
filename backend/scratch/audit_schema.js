require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function run() {
  const tables = ['users', 'customer', 'seller'];
  for (const table of tables) {
    console.log(`--- ${table} ---`);
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [table]);
    res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type} (${r.is_nullable})`));
  }

  const allCols = await pool.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE column_name LIKE '%customer_id%' OR column_name LIKE '%user_id%'
    ORDER BY table_name
  `);
  console.log('--- Columns mentioning customer_id or user_id ---');
  allCols.rows.forEach(r => console.log(`${r.table_name}.${r.column_name}`));
  
  await pool.end();
}

run().catch(console.error);
