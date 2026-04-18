const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'Shobana@805',
  port: 5432,
});

async function checkCategories() {
  try {
    const res = await pool.query("SELECT * FROM categories");
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error checking categories:", err);
    process.exit(1);
  }
}

checkCategories();
