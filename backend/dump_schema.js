const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'Shobana@805',
  port: 5432,
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
