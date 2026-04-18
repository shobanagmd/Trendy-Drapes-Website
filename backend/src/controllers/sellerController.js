const db = require('../config/db');

exports.getOnboardingStatus = async (req, res) => {
  const seller_id = req.user.id;
  try {
    const result = await db.query("SELECT is_verified as onboarding_completed FROM sellers WHERE seller_id = $1", [seller_id]);
    if (result.rows.length > 0) {
      res.json({ success: true, onboardingCompleted: result.rows[0].onboarding_completed });
    } else {
      res.status(404).json({ success: false, message: "Seller not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.completeOnboarding = async (req, res) => {
  const seller_id = req.user.id;
  const { 
    fullName, mobile, businessType, businessName, legalName, 
    address, city, state, pincode, country,
    panNumber, gstin,
    bankDetails, // JSON string from frontend
    storeName, storeDescription, pickupAddress, returnAddress
  } = req.body;

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. Update Seller Main Info
    await client.query(
      `UPDATE sellers SET 
        full_name = COALESCE($1, full_name),
        legal_name = $2,
        business_type = $3,
        store_name = $4,
        store_description = $5,
        gst_number = $6,
        pan_number = $7,
        phone = $8,
        onboarding_status = 'pending_verification',
        updated_at = NOW() 
       WHERE seller_id = $9`,
      [fullName, legalName || businessName, businessType, storeName, storeDescription, gstin, panNumber, mobile, seller_id]
    );

    // 2. Handle Bank Details
    if (bankDetails) {
      const bank = JSON.parse(bankDetails);
      await client.query(
        `INSERT INTO bank_accounts (seller_id, account_holder_name, account_number, ifsc_code, bank_name, branch_name, account_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (seller_id) DO UPDATE SET
         account_holder_name = EXCLUDED.account_holder_name,
         account_number = EXCLUDED.account_number,
         ifsc_code = EXCLUDED.ifsc_code,
         bank_name = EXCLUDED.bank_name,
         branch_name = EXCLUDED.branch_name,
         account_type = EXCLUDED.account_type`,
        [seller_id, bank.accountHolderName, bank.accountNumber, bank.ifscCode, bank.bankName, bank.branchName || 'Main', bank.accountType || 'Savings']
      );
    }

    // 3. Handle Pickup Location
    if (pickupAddress) {
      await client.query(
        `INSERT INTO seller_pickup_locations (seller_id, address_line_1, city, state, pincode, country, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE)
         ON CONFLICT (seller_id) DO UPDATE SET
         address_line_1 = EXCLUDED.address_line_1`,
        [seller_id, pickupAddress, city || 'Unknown', state || 'Unknown', pincode || '000000', country || 'India']
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, message: "Onboarding completed. Your account is under review." });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: "Server error during onboarding" });
  } finally {
    client.release();
  }
};

exports.getAnalytics = async (req, res) => {
  const seller_id = req.user.id;
  try {
    const result = await db.query(`
      SELECT p.product_id, p.name, p.sku, COALESCE(SUM(oi.quantity), 0) as sold
      FROM products p
      LEFT JOIN order_items oi ON p.product_id = oi.product_id
      WHERE p.seller_id = $1
      GROUP BY p.product_id
      ORDER BY sold DESC
      LIMIT 10
    `, [seller_id]);
    res.json({ success: true, products: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllSellers = async (req, res) => {
  try {
    const result = await db.query("SELECT seller_id, full_name, store_name FROM sellers WHERE is_active = TRUE ORDER BY full_name ASC");
    res.json({ success: true, sellers: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error fetching sellers" });
  }
};
