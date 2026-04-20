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
    console.log("Starting Enhanced Data Migration...");

    // 1. MAPPING COLLECTIONS
    const adminMap = {}; // email -> UUID
    const customerMap = {}; // customer_id (C001) -> UUID
    const sellerMap = {}; // seller_id / email -> UUID
    const categoryMap = {}; // Name -> UUID
    const productMap = {}; // id/sku -> UUID
    const orderMap = {}; // order_id -> UUID

    // --- 2. MIGRATE ADMINS ---
    const legacyAdminTables = ['legacy_admin', 'legacy_admins'];
    for (const table of legacyAdminTables) {
      const exists = await client.query(`SELECT 1 FROM information_schema.tables WHERE table_name = $1`, [table]);
      if (exists.rowCount === 0) continue;
      const rows = await client.query(`SELECT * FROM "${table}"`);
      for (const row of rows.rows) {
        if (adminMap[row.email]) continue;
        const res = await client.query(
          "INSERT INTO admins (name, email, password_hash) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING admin_id",
          [row.name, row.email, row.password]
        );
        adminMap[row.email] = res.rows[0].admin_id;
      }
    }
    console.log(`Migrated ${Object.keys(adminMap).length} admins.`);

    // --- 3. CREATE ADMIN SELLER ---
    const adminSellerRes = await client.query(
      `INSERT INTO sellers (full_name, email, phone, password_hash, store_name, is_verified, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       ON CONFLICT (email) DO UPDATE SET store_name = EXCLUDED.store_name
       RETURNING seller_id`,
      ['Trendy Drapes Official', 'admin@trendydrapes.com', '0000000000', 'ADMIN_PROTECTED', 'Trendy Drapes Store', true, true]
    );
    const adminSellerId = adminSellerRes.rows[0].seller_id;
    sellerMap['admin@trendydrapes.com'] = adminSellerId;
    console.log("Created/Verified Admin Seller record.");

    // --- 4. MIGRATE SELLERS ---
    const legacySellerTables = ['legacy_seller', 'legacy_sellers'];
    for (const table of legacySellerTables) {
      const exists = await client.query(`SELECT 1 FROM information_schema.tables WHERE table_name = $1`, [table]);
      if (exists.rowCount === 0) continue;
      const rows = await client.query(`SELECT * FROM "${table}"`);
      for (const row of rows.rows) {
        if (sellerMap[row.email]) continue;
        const res = await client.query(
          `INSERT INTO sellers (
            full_name, email, phone, password_hash, store_name, gstin, 
            store_logo_url, store_description, is_verified, is_active, 
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name RETURNING seller_id`,
          [
            row.full_name || row.name || row.seller_name || 'Legacy Seller', 
            row.email, 
            row.phone || row.mobile || row.phone_no, 
            row.password_hash || row.password || 'LegacyPWD', 
            row.store_name || row.business_name, 
            row.gstin || row.gst_in, 
            row.store_logo_url || row.store_logo_path, 
            row.store_description, 
            row.is_verified === true || row.onboarding_completed === true, 
            row.is_active !== false, 
            row.created_at || new Date(), 
            row.updated_at || new Date()
          ]
        );
        sellerMap[row.seller_id || row.email] = res.rows[0].seller_id;
        sellerMap[row.email] = res.rows[0].seller_id;
      }
    }
    console.log(`Migrated ${Object.keys(sellerMap).length} unique sellers.`);

    // --- 5. MIGRATE CUSTOMERS & ADDRESSES ---
    const legacyCustomerTables = ['legacy_customer', 'legacy_customers'];
    for (const table of legacyCustomerTables) {
      const exists = await client.query(`SELECT 1 FROM information_schema.tables WHERE table_name = $1`, [table]);
      if (exists.rowCount === 0) continue;
      const rows = await client.query(`SELECT * FROM "${table}"`);
      for (const row of rows.rows) {
          if (customerMap[row.email]) continue;
          const res = await client.query(
              `INSERT INTO customers (
                  full_name, email, phone, password_hash, date_of_birth, gender, 
                  profile_picture_url, is_active, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name RETURNING customer_id`,
              [
                  row.full_name || row.name || 'Legacy Customer', 
                  row.email, 
                  row.phone || row.phone_no, 
                  row.password_hash || row.password || 'LegacyPWD', 
                  row.date_of_birth, 
                  row.gender, 
                  row.profile_picture_url || row.profile_image, 
                  row.is_active !== false, 
                  row.created_at || new Date(), 
                  row.updated_at || new Date()
              ]
          );
          const newCustId = res.rows[0].customer_id;
          customerMap[row.customer_id] = newCustId;
          customerMap[row.email] = newCustId;

          const addr = row.address || row.business_address || row.pickup_address;
          if (addr || row.city) {
              await client.query(
                  `INSERT INTO addresses (customer_id, full_name, address_line_1, city, state, pincode, country, is_default)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)`,
                  [newCustId, row.full_name || row.name || 'Legacy Customer', addr, row.city, row.state, row.pincode, row.country || 'India']
              );
          }
      }
    }
    console.log(`Migrated ${Object.keys(customerMap).length} customers.`);

    // --- 6. CATEGORY RESTORATION ---
    const catsFound = new Set();
    const tablesToScan = ['legacy_products', 'legacy_admin_products'];
    for (const table of tablesToScan) {
      const exists = await client.query(`SELECT 1 FROM information_schema.tables WHERE table_name = $1`, [table]);
      if (exists.rowCount === 0) continue;
      const res = await client.query(`SELECT DISTINCT category FROM "${table}" WHERE category IS NOT NULL`);
      res.rows.forEach(r => catsFound.add(r.category.trim()));
    }
    
    for (const name of catsFound) {
        const slug = name.toLowerCase().replace(/[^a-z0-0]/g, '-');
        const res = await client.query(
            "INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING category_id",
            [name, slug]
        );
        categoryMap[name] = res.rows[0].category_id;
    }
    console.log(`Created ${Object.keys(categoryMap).length} categories.`);

    // --- 7. MIGRATE PRODUCTS (Combined) ---
    // ... continues ...
    const productSources = [
        { table: 'legacy_admin_products' },
        { table: 'legacy_products' }
    ];

    let totalProducts = 0;
    for (const src of productSources) {
        const exists = await client.query(`SELECT 1 FROM information_schema.tables WHERE table_name = $1`, [src.table]);
        if (exists.rowCount === 0) continue;
        const rows = await client.query(`SELECT * FROM "${src.table}"`);
        for (const row of rows.rows) {
            const sId = sellerMap[row.seller_email] || sellerMap[row.seller_id] || adminSellerId;
            const cId = categoryMap[row.category?.trim()] || null;
            
            try {
                const res = await client.query(
                    `INSERT INTO products (
                      seller_id, category_id, name, description, sku, price, mrp, stock_quantity, 
                      weight, length, breadth, height, brand, is_active, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
                    ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name RETURNING product_id`,
                    [
                      sId, cId, row.name, row.description, row.sku, 
                      parseFloat(row.price) || 0, parseFloat(row.mrp) || parseFloat(row.price) || 0, 
                      row.stock || row.stock_quantity || 0,
                      parseFloat(row.weight) || 0.5, parseFloat(row.length) || 1, parseFloat(row.breadth) || 1, parseFloat(row.height) || 1, 
                      row.brand || 'Trendy Drapes',
                      row.is_active !== false, row.created_at || new Date(), row.updated_at || new Date()
                    ]
                );
                const newProdId = res.rows[0].product_id;
                productMap[row.sku] = newProdId;
                productMap[row.product_id] = newProdId;
                totalProducts++;

                if (row.main_image) {
                    await client.query("INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, TRUE)", [newProdId, row.main_image]);
                }
                if (Array.isArray(row.images)) {
                    for (const img of row.images) {
                        if (img !== row.main_image) {
                            await client.query("INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, FALSE)", [newProdId, img]);
                        }
                    }
                }
            } catch (err) {
                console.error(`Error product ${row.sku}:`, err.message);
            }
        }
    }
    console.log(`Migrated ${totalProducts} products.`);

    // --- 8. MIGRATE ORDERS ---
    const legacyOrderTables = ['legacy_orders', 'legacy_order'];
    for (const table of legacyOrderTables) {
      const exists = await client.query(`SELECT 1 FROM information_schema.tables WHERE table_name = $1`, [table]);
      if (exists.rowCount === 0) continue;
      const rows = await client.query(`SELECT * FROM "${table}"`);
      for (const row of rows.rows) {
        if (orderMap[row.order_id]) continue;
        const cId = customerMap[row.customer_id] || null;
        const res = await client.query(
          `INSERT INTO orders (
            customer_id, subtotal, discount_amount, tax_amount, shipping_charge, total_amount, 
            order_status, payment_status, placed_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING order_id`,
          [
            cId, parseFloat(row.subtotal) || 0, parseFloat(row.discount) || 0, 0, parseFloat(row.shipping_charge) || 0, 
            parseFloat(row.total) || 0, row.status || row.order_status, row.payment_status, row.created_at, row.updated_at
          ]
        );
        orderMap[row.order_id] = res.rows[0].order_id;
      }
    }
    console.log(`Migrated ${Object.keys(orderMap).length} orders.`);

    // --- 9. MIGRATE ORDER ITEMS ---
    const legacyOrderItems = await client.query("SELECT * FROM legacy_order_items");
    for (const row of legacyOrderItems.rows) {
      const oId = orderMap[row.order_id];
      const pId = productMap[row.product_id] || null;
      if (oId) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) 
           VALUES ($1, $2, $3, $4, $5)`,
          [oId, pId, row.quantity || 1, parseFloat(row.price) || 0, (parseFloat(row.price) || 0) * (row.quantity || 1)]
        );
      }
    }
    console.log(`Migrated ${legacyOrderItems.rowCount} order items.`);

    // --- 10. MIGRATE REVIEWS ---
    const legacyReviews = await client.query("SELECT * FROM legacy_reviews");
    for (const row of legacyReviews.rows) {
      const cId = customerMap[row.customer_id] || null;
      const pId = productMap[row.product_id] || null;
      await client.query(
        "INSERT INTO reviews (product_id, customer_id, rating, body, created_at) VALUES ($1, $2, $3, $4, $5)",
        [pId, cId, row.rating, row.comment || row.body || "No comment", row.created_at]
      );
    }
    console.log(`Migrated ${legacyReviews.rowCount} reviews.`);

    console.log("Enhanced Migration finished successfully.");

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
