const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgresql://postgres:Shobana@805@localhost:5432/local_db"
});

async function run() {
  try {
    const res = await pool.query("SELECT category_id, name FROM categories");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
