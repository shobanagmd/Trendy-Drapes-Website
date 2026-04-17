const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'Shobana@805',
  port: 5432,
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
