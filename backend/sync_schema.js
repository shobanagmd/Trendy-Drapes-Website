const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'Shobana@805',
  port: 5432,
});

async function syncSchema() {
  try {
    console.log("Starting schema synchronization...");

    // 1. Customer Table (Update existing 'users' and create 'customer' if separate)
    // The user provided 'Customer Table' specifically. I'll create it.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customer (
        customer_id VARCHAR(50) PRIMARY KEY,
        product_id VARCHAR(100),
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        phone_no VARCHAR(20),
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);
    // Add missing fields to 'users' if we keep using it
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS customer_id VARCHAR(50),
      ADD COLUMN IF NOT EXISTS product_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS phone_no VARCHAR(20),
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // 2. Order Table (Singular)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "order" (
        order_id VARCHAR(50) PRIMARY KEY,
        customer_id VARCHAR(50),
        address_id INTEGER,
        status VARCHAR(50),
        total_amount DECIMAL(10, 2),
        discount_amount DECIMAL(10, 2),
        final_amount DECIMAL(10, 2),
        coupon_code VARCHAR(50),
        ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Product Table (Update 'products')
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS product_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS parent_product_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS seller_id VARCHAR(50),
      ADD COLUMN IF NOT EXISTS category_id INTEGER,
      ADD COLUMN IF NOT EXISTS review_id INTEGER,
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS stock_quantity INTEGER,
      ADD COLUMN IF NOT EXISTS weight DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS length DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS breadth DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS height DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS brand VARCHAR(100),
      ADD COLUMN IF NOT EXISTS image_url TEXT,
      ADD COLUMN IF NOT EXISTS variant_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS variant_value VARCHAR(100),
      ADD COLUMN IF NOT EXISTS is_variant BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS add_charge DECIMAL(10, 2)
    `);

    // 4. Cart Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart (
        cart_id SERIAL PRIMARY KEY,
        customer_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    // 5. Wishlist Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        wishlist_id SERIAL PRIMARY KEY,
        customer_id VARCHAR(50),
        product_id VARCHAR(100),
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);

    // 6. Payment Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment (
        payment_id SERIAL PRIMARY KEY,
        order_id VARCHAR(50),
        customer_id VARCHAR(50),
        payment_method VARCHAR(50),
        amount DECIMAL(10, 2),
        payment_status VARCHAR(50),
        gateway_name VARCHAR(100),
        gateway_response JSONB,
        failure_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP
      )
    `);

    // 7. Orders Table (Plural - Existing update)
    await pool.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS customer_id VARCHAR(50),
      ADD COLUMN IF NOT EXISTS address_id INTEGER,
      ADD COLUMN IF NOT EXISTS coupon_id INTEGER,
      ADD COLUMN IF NOT EXISTS seller_id VARCHAR(50),
      ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS shipping_charge DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS order_status VARCHAR(50),
      ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50),
      ADD COLUMN IF NOT EXISTS ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // 8. Seller Table (Update existing 'seller')
    await pool.query(`
      ALTER TABLE seller 
      ADD COLUMN IF NOT EXISTS seller_id VARCHAR(50),
      ADD COLUMN IF NOT EXISTS admin_id INTEGER,
      ADD COLUMN IF NOT EXISTS seller_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS phone_no VARCHAR(20),
      ADD COLUMN IF NOT EXISTS gst_in VARCHAR(50),
      ADD COLUMN IF NOT EXISTS bank_account VARCHAR(50),
      ADD COLUMN IF NOT EXISTS pickup_details TEXT
    `);

    // 9. Address Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS address (
        address_id SERIAL PRIMARY KEY,
        customer_id VARCHAR(50)
      )
    `);

    // 10. Shiprocket Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shiprocket (
        order_id VARCHAR(50),
        order_date TIMESTAMP,
        pickup_creation TIMESTAMP
      )
    `);

    console.log("Schema synchronization completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error synchronizing schema:", err);
    process.exit(1);
  }
}

syncSchema();
