const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/trendydrapes' });

async function check() {
  const res = await pool.query("SELECT * FROM order_items LIMIT 5;");
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit();
}
check();
