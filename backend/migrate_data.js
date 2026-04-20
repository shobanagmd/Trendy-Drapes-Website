require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Starting legacy data migration...");

    // 1. Get current tables
    const tablesRes = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    const existingTables = tablesRes.rows.map(r => r.table_name);

    // 2. Rename existing tables to legacy_
    console.log("Renaming existing tables to legacy_...");
    for (const table of existingTables) {
      if (!table.startsWith('legacy_')) {
        // If legacy table already exists, drop it first to allow rename OR just skip
        // Since we want to preserve data from the very first state, we only rename IF legacy doesn't exist
        const checkLegacy = await client.query(`SELECT 1 FROM information_schema.tables WHERE table_name = 'legacy_${table}'`);
        if (checkLegacy.rowCount === 0) {
          await client.query(`ALTER TABLE "${table}" RENAME TO "legacy_${table}"`);
        } else {
          console.log(`Legacy table legacy_${table} already exists. Skipping rename for ${table}.`);
          // Optionally drop the current (empty/partial) table to clean up
          await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        }
      }
    }

    // 3. Create new schema
    console.log("Creating new schema from rebuild_schema.sql...");
    const schemaSql = fs.readFileSync(path.join(__dirname, 'rebuild_schema.sql'), 'utf8');
    await client.query(schemaSql);

    // 4. Data Mapping & Migration
    console.log("Migrating data...");

    // --- MAPPING COLLECTIONS ---
    const adminMap = {}; // email -> UUID
    const customerMap = {}; // customer_id (C001) -> UUID
    const sellerMap = {}; // seller_id (S001) -> UUID
    const productMap = {}; // id/sku -> UUID
    const orderMap = {}; // order_id (ORD123) -> UUID

    // --- MIGRATE ADMINS ---
    const legacyAdmins = await client.query("SELECT * FROM legacy_admin");
    for (const row of legacyAdmins.rows) {
      const res = await client.query(
        "INSERT INTO admins (name, email, password_hash) VALUES ($1, $2, $3) RETURNING admin_id",
        [row.name, row.email, row.password]
      );
      adminMap[row.email] = res.rows[0].admin_id;
    }
    console.log(`Migrated ${legacyAdmins.rowCount} admins.`);

    // --- MIGRATE CUSTOMERS ---
    const legacyCustomers = await client.query("SELECT * FROM legacy_customer");
    for (const row of legacyCustomers.rows) {
      const res = await client.query(
        `INSERT INTO customers (
          full_name, email, phone, password_hash, date_of_birth, gender, 
          profile_picture_url, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING customer_id`,
        [
          row.name, row.email, row.phone_no, row.password, row.date_of_birth, row.gender, 
          row.profile_image, row.is_active !== false, row.created_at, row.updated_at
        ]
      );
      customerMap[row.customer_id] = res.rows[0].customer_id;
    }
    console.log(`Migrated ${legacyCustomers.rowCount} customers.`);

    // --- MIGRATE SELLERS ---
    const legacySellers = await client.query("SELECT * FROM legacy_seller");
    for (const row of legacySellers.rows) {
      const res = await client.query(
        `INSERT INTO sellers (
          full_name, email, phone, password_hash, store_name, gstin, 
          store_logo_url, store_description, is_verified, is_active, 
          approved_by_admin_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING seller_id`,
        [
          row.name, row.email, row.mobile, row.password, row.store_name, row.gstin || row.gst_in, 
          row.store_logo_path, row.store_description, false, row.is_active !== false, 
          null, row.created_at || new Date(), row.updated_at || new Date()
        ]
      );
      sellerMap[row.seller_id || row.email] = res.rows[0].seller_id;
    }
    console.log(`Migrated ${legacySellers.rowCount} sellers.`);

    // --- MIGRATE PRODUCTS ---
    const legacyProducts = await client.query("SELECT * FROM legacy_products");
    for (const row of legacyProducts.rows) {
      const sId = sellerMap[row.seller_email] || null;
      const res = await client.query(
        `INSERT INTO products (
          seller_id, name, description, sku, price, mrp, stock_quantity, 
          weight, length, breadth, height, brand, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING product_id`,
        [
          sId, row.name, row.description, row.sku, row.price, row.mrp, row.stock || row.stock_quantity || 0,
          row.weight || 0.5, row.length || 1, row.breadth || 1, row.height || 1, row.brand || 'Trendy Drapes',
          row.is_active !== false, row.created_at, row.updated_at
        ]
      );
      productMap[row.sku] = res.rows[0].product_id;
      
      // Migrate main image
      if (row.main_image) {
        await client.query(
          "INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, TRUE)",
          [res.rows[0].product_id, row.main_image]
        );
      }
      
      // Migrate gallery images
      if (Array.isArray(row.images)) {
        for (const img of row.images) {
          if (img !== row.main_image) {
            await client.query(
              "INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, FALSE)",
              [res.rows[0].product_id, img]
            );
          }
        }
      }
    }
    console.log(`Migrated ${legacyProducts.rowCount} products.`);

    // --- MIGRATE ORDERS ---
    const legacyOrders = await client.query("SELECT * FROM legacy_orders");
    for (const row of legacyOrders.rows) {
      const cId = customerMap[row.customer_id] || null;
      const res = await client.query(
        `INSERT INTO orders (
          customer_id, subtotal, discount_amount, tax_amount, shipping_charge, total_amount, 
          order_status, payment_status, placed_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING order_id`,
        [
          cId, row.subtotal, row.discount || 0, row.tax_amount || 0, row.shipping_charge || 0, 
          row.total, row.status || row.order_status, row.payment_status, row.created_at, row.updated_at
        ]
      );
      orderMap[row.order_id] = res.rows[0].order_id;
    }
    console.log(`Migrated ${legacyOrders.rowCount} orders.`);

    // --- MIGRATE ORDER ITEMS ---
    const legacyOrderItems = await client.query("SELECT * FROM legacy_order_items");
    for (const row of legacyOrderItems.rows) {
      const oId = orderMap[row.order_id];
      const pId = productMap[row.product_id] || null;
      const price = parseFloat(row.price) || 0;
      if (oId) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) 
           VALUES ($1, $2, $3, $4, $5)`,
          [oId, pId, row.quantity || 1, price, (row.quantity || 1) * price]
        );
      }
    }
    console.log(`Migrated ${legacyOrderItems.rowCount} order items.`);

    // --- MIGRATE CART ITEMS ---
    const legacyCartItems = await client.query("SELECT * FROM legacy_cart_items");
    for (const row of legacyCartItems.rows) {
        // Find customer
        const custRes = await client.query("SELECT customer_id FROM customers WHERE email = $1", [row.user_email]);
        if (custRes.rows.length > 0) {
            const customerId = custRes.rows[0].customer_id;
            // Get or Create Cart
            let cartRes = await client.query("SELECT cart_id FROM carts WHERE customer_id = $1", [customerId]);
            let cartId;
            if (cartRes.rows.length === 0) {
                const newCart = await client.query("INSERT INTO carts (customer_id) VALUES ($1) RETURNING cart_id", [customerId]);
                cartId = newCart.rows[0].cart_id;
            } else {
                cartId = cartRes.rows[0].cart_id;
            }
            
            // Clean productId (strip 'seller-' or 'admin-')
            let sku = row.product_id;
            if (sku.includes('-')) {
              // Try to find by SKU if lucky, or ignore if complex
            }

            // Attempt to link to product
            const prodRes = await client.query("SELECT product_id FROM products WHERE sku = $1", [sku]);
            if (prodRes.rows.length > 0) {
                await client.query(
                    "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)",
                    [cartId, prodRes.rows[0].product_id, row.quantity]
                );
            }
        }
    }
    console.log(`Migrated ${legacyCartItems.rowCount} cart items.`);

    // --- MIGRATE REVIEWS ---
    const legacyReviews = await client.query("SELECT * FROM legacy_reviews");
    for (const row of legacyReviews.rows) {
      const cId = customerMap[row.customer_id];
      const prodRes = await client.query("SELECT product_id FROM products WHERE product_id = (SELECT product_id FROM products WHERE sku = $1 LIMIT 1)", [row.product_id]);
      const pId = prodRes.rows[0] ? prodRes.rows[0].product_id : null;
      
      await client.query(
        "INSERT INTO reviews (product_id, customer_id, rating, body, created_at) VALUES ($1, $2, $3, $4, $5)",
        [pId, cId, row.rating, row.comment || row.body, row.created_at]
      );
    }
    console.log(`Migrated ${legacyReviews.rowCount} reviews.`);

    console.log("Migration finished successfully.");

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
