require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function getFullSchema() {
  try {
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const schema = {};
    
    for (const row of tablesRes.rows) {
      const tableName = row.table_name;
      const columnsRes = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      
      schema[tableName] = columnsRes.rows;
    }
    
    console.log(JSON.stringify(schema, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error getting schema:", err);
    process.exit(1);
  }
}

getFullSchema();
