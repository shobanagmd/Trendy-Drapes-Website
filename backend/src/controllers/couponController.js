const db = require('../config/db');

exports.getAllCoupons = async (req, res) => {
  try {
    let result;
    if (req.user.role === 'seller') {
      result = await db.query('SELECT * FROM coupons WHERE seller_id = $1 ORDER BY created_at DESC', [req.user.id]);
    } else {
      result = await db.query(`
        SELECT c.*, s.store_name as seller_name 
        FROM coupons c 
        LEFT JOIN sellers s ON c.seller_id = s.seller_id 
        ORDER BY c.created_at DESC
      `);
    }
    res.json({ success: true, coupons: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching coupons" });
  }
};

exports.createCoupon = async (req, res) => {
  const { code, type, discount_percent, max_discount, min_order_value, max_usage, max_usage_per_user, valid_until } = req.body;
  
  try {
    let query, values;
    if (req.user.role === 'seller') {
      query = `INSERT INTO coupons (code, type, discount_percent, max_discount, min_order_value, max_usage, max_usage_per_user, valid_until, seller_id)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;
      values = [code.toUpperCase(), type, discount_percent, max_discount, min_order_value, max_usage, max_usage_per_user || 1, valid_until || null, req.user.id];
    } else {
      query = `INSERT INTO coupons (code, type, discount_percent, max_discount, min_order_value, max_usage, max_usage_per_user, valid_until, admin_id)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;
      values = [code.toUpperCase(), type, discount_percent, max_discount, min_order_value, max_usage, max_usage_per_user || 1, valid_until || null, req.user.id];
    }
    const result = await db.query(query, values);
    let coupon = result.rows[0];

    if (req.user.role === 'seller') {
      const sellerInfo = await db.query('SELECT store_name FROM sellers WHERE seller_id = $1', [req.user.id]);
      coupon.seller_name = sellerInfo.rows[0]?.store_name || "Seller";
    }

    res.json({ success: true, coupon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating coupon" });
  }
};

exports.validateCoupon = async (req, res) => {
  const { code, orderValue } = req.body;
  
  try {
    const result = await db.query(
      `SELECT * FROM coupons 
       WHERE code = $1 
       AND is_active = TRUE 
       AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)`,
      [code.toUpperCase()]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Invalid or expired coupon code" });
    }
    
    const coupon = result.rows[0];
    
    // 1. Global Usage Limit Check
    const usedCount = parseInt(coupon.used_count || 0);
    const maxUsage = coupon.max_usage ? parseInt(coupon.max_usage) : null;
    
    if (maxUsage !== null && usedCount >= maxUsage) {
      return res.status(400).json({ success: false, message: "Coupon global usage limit reached" });
    }

    // 2. Per-User Usage Limit Check
    if (req.user && req.user.id) {
      const usageRes = await db.query(
        'SELECT COUNT(*) FROM coupon_usage WHERE coupon_id = $1 AND customer_id = $2',
        [coupon.coupon_id, req.user.id]
      );
      const userUsageCount = parseInt(usageRes.rows[0]?.count || 0);
      const maxPerUser = parseInt(coupon.max_usage_per_user || 1);

      if (userUsageCount >= maxPerUser) {
        return res.status(400).json({ success: false, message: maxPerUser === 1 ? "You have already used this coupon" : `You can only use this coupon ${maxPerUser} times` });
      }
    }

    
    // Ensure numeric comparisons work correctly
    const minOrder = parseFloat(coupon.min_order_value);
    const discPercent = parseFloat(coupon.discount_percent);
    const maxDisc = coupon.max_discount ? parseFloat(coupon.max_discount) : null;

    if (orderValue < minOrder) {
      return res.status(400).json({ success: false, message: `Minimum order value for this coupon is ₹${minOrder}` });
    }
    
    let discount = (orderValue * discPercent) / 100;
    if (maxDisc && discount > maxDisc) {
      discount = maxDisc;
    }
    
    res.json({ success: true, coupon, discount });
  } catch (err) {
    console.error("Coupon Validation Error:", err);
    res.status(500).json({ success: false, message: "Error validating coupon", error: err.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.role === 'seller') {
      // Ensure sellers can only delete their own coupons
      const checkResult = await db.query('SELECT * FROM coupons WHERE coupon_id = $1 AND seller_id = $2', [id, req.user.id]);
      if (checkResult.rows.length === 0) {
        return res.status(403).json({ success: false, message: "Forbidden: Not your coupon" });
      }
    }
    await db.query('DELETE FROM coupons WHERE coupon_id = $1', [id]);
    res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting coupon" });
  }
};
