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
  const { store_name, store_description, gstin, phone } = req.body;
  // File paths would come from multer (simplified here)
  try {
    await db.query(
      `UPDATE sellers SET 
        store_name = $1, store_description = $2, gstin = $3, phone = $4, is_active = TRUE, updated_at = NOW() 
       WHERE seller_id = $5`,
      [store_name, store_description, gstin, phone, seller_id]
    );
    res.json({ success: true, message: "Onboarding completed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
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
