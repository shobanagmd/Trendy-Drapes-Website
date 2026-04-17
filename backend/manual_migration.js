const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'Shobana@805',
  port: 5432,
});

async function runMigration() {
  try {
    console.log("Running migration...");
    await pool.query(`
      ALTER TABLE seller 
      ADD COLUMN IF NOT EXISTS mobile VARCHAR(15),
      ADD COLUMN IF NOT EXISTS business_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS business_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS business_address TEXT,
      ADD COLUMN IF NOT EXISTS city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS state VARCHAR(100),
      ADD COLUMN IF NOT EXISTS pincode VARCHAR(10),
      ADD COLUMN IF NOT EXISTS country VARCHAR(100),
      ADD COLUMN IF NOT EXISTS pan_number VARCHAR(20),
      ADD COLUMN IF NOT EXISTS gstin VARCHAR(20),
      ADD COLUMN IF NOT EXISTS account_holder_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS account_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(20),
      ADD COLUMN IF NOT EXISTS store_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS store_description TEXT,
      ADD COLUMN IF NOT EXISTS pickup_address TEXT,
      ADD COLUMN IF NOT EXISTS return_address TEXT,
      ADD COLUMN IF NOT EXISTS instagram_url TEXT,
      ADD COLUMN IF NOT EXISTS facebook_url TEXT,
      ADD COLUMN IF NOT EXISTS twitter_url TEXT,
      ADD COLUMN IF NOT EXISTS kyc_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR(20),
      ADD COLUMN IF NOT EXISTS kyc_document_number VARCHAR(100),
      ADD COLUMN IF NOT EXISTS kyc_document_path TEXT,
      ADD COLUMN IF NOT EXISTS store_logo_path TEXT,
      ADD COLUMN IF NOT EXISTS store_banner_path TEXT,
      ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE
    `);
    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

runMigration();
