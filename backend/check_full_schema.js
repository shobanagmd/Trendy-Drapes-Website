const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'Shobana@805',
  port: 5432,
});

async function checkSchema() {
  try {
    const res = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'seller'");
    console.log("Detailed columns in 'seller' table:");
    res.rows.forEach(r => {
      console.log(`${r.column_name}: ${r.data_type} (Nullable: ${r.is_nullable})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error("Error checking schema:", err);
    process.exit(1);
  }
}

checkSchema();
