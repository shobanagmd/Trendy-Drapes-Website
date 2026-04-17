const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local_db",
  password: "Shobana@805",
  port: 5432,
});

async function migrate() {
  try {
    await pool.query("ALTER TABLE seller ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE");
    console.log("Column onboarding_completed added to seller table successfully.");
    await pool.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
