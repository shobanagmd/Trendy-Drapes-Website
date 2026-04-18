const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'Shobana@805',
  port: 5432,
});

async function checkSchema() {
  const tables = ['products', 'product_images', 'product_variants', 'categories'];
  try {
    for (const table of tables) {
      const res = await pool.query(`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '${table}'`);
      console.log(`\nDetailed columns in '${table}' table:`);
      res.rows.forEach(r => {
        console.log(`${r.column_name}: ${r.data_type} (Nullable: ${r.is_nullable})`);
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Error checking schema:", err);
    process.exit(1);
  }
}

checkSchema();
