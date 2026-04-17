const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'Shobana@805',
  port: 5432,
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('--- Step 1: Preparing customer table ---');
    await client.query(`
      ALTER TABLE customer 
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS state VARCHAR(100),
      ADD COLUMN IF NOT EXISTS pincode VARCHAR(20),
      ADD COLUMN IF NOT EXISTS country VARCHAR(100),
      ADD COLUMN IF NOT EXISTS profile_image TEXT,
      ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT TRUE,
      ALTER COLUMN phone_no TYPE VARCHAR(50),
      ALTER COLUMN email TYPE VARCHAR(255)
    `);

    console.log('--- Step 2: Migrating data from users to customer ---');
    // We'll update existing customers and insert new ones from users
    const usersRes = await client.query('SELECT * FROM users');
    for (const user of usersRes.rows) {
      const { 
        customer_id, name, email, phone_no, password, 
        address, city, state, pincode, country, profile_image,
        created_at, updated_at
      } = user;

      const cid = customer_id || `C${Math.floor(1000 + Math.random() * 9000)}`;

      await client.query(`
        INSERT INTO customer (
          customer_id, name, email, phone_no, password, 
          address, city, state, pincode, country, profile_image,
          created_at, updated_at, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, TRUE)
        ON CONFLICT (customer_id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          phone_no = EXCLUDED.phone_no,
          password = EXCLUDED.password,
          address = COALESCE(customer.address, EXCLUDED.address),
          city = COALESCE(customer.city, EXCLUDED.city),
          state = COALESCE(customer.state, EXCLUDED.state),
          pincode = COALESCE(customer.pincode, EXCLUDED.pincode),
          country = COALESCE(customer.country, EXCLUDED.country),
          profile_image = COALESCE(customer.profile_image, EXCLUDED.profile_image)
      `, [
        cid, name, email, phone_no, password, 
        address, city, state, pincode, country, profile_image,
        created_at, updated_at
      ]);
    }

    console.log('--- Step 3: Migrating reviews foreign keys ---');
    // Check if customer_id in reviews is integer
    const reviewsColRes = await client.query(`
      SELECT data_type FROM information_schema.columns 
      WHERE table_name = 'reviews' AND column_name = 'customer_id'
    `);
    
    if (reviewsColRes.rows[0].data_type === 'integer') {
      console.log('Processing reviews FK migration...');
      
      // Temporarily rename the column to map it
      await client.query('ALTER TABLE reviews RENAME COLUMN customer_id TO old_user_id');
      await client.query('ALTER TABLE reviews ADD COLUMN customer_id VARCHAR(50)');
      
      // Map old_user_id (integer) to customer_id (string) via users table
      await client.query(`
        UPDATE reviews r
        SET customer_id = u.customer_id
        FROM users u
        WHERE r.old_user_id = u.id
      `);
      
      // For any that didn't match (shouldn't happen with good data), handle nulls if necessary
      await client.query('ALTER TABLE reviews DROP COLUMN old_user_id');
    }

    console.log('--- Step 4: Restructuring seller table identity ---');
    // Ensure all sellers have a seller_id
    const sellersWithoutId = await client.query('SELECT * FROM seller WHERE seller_id IS NULL');
    for (const seller of sellersWithoutId.rows) {
      const sid = `S${Math.floor(1000 + Math.random() * 9000)}`;
      await client.query('UPDATE seller SET seller_id = $1 WHERE id = $2', [sid, seller.id]);
    }

    // Attempt to make seller_id the primary key
    // First, drop the old PK if it exists
    await client.query(`
      DO $$ 
      DECLARE 
        pk_name TEXT;
      BEGIN 
        SELECT conname INTO pk_name 
        FROM pg_constraint 
        WHERE conrelid = 'seller'::regclass AND contype = 'p';
        
        IF pk_name IS NOT NULL THEN
          EXECUTE 'ALTER TABLE seller DROP CONSTRAINT ' || pk_name;
        END IF;
      END $$;
    `);

    await client.query('ALTER TABLE seller ADD PRIMARY KEY (seller_id)');

    console.log('--- Step 5: Dropping users table ---');
    await client.query('DROP TABLE users CASCADE');

    console.log('--- Migration Successful ---');
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('--- Migration Failed ---');
    console.error(err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
