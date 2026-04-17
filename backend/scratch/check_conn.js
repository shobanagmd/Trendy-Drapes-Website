const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "Shobana@805",
  port: 5432,
});

async function checkConnections() {
  try {
    const res = await pool.query("SELECT count(*) FROM pg_stat_activity");
    console.log("Total connections:", res.rows[0].count);
    
    const details = await pool.query("SELECT state, count(*) FROM pg_stat_activity GROUP BY state");
    console.log("Connection details:", details.rows);
    
    await pool.end();
  } catch (err) {
    console.error("Error checking connections:", err.message);
  }
}

checkConnections();
