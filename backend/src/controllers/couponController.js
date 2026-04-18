const db = require('../config/db');

exports.getAllCoupons = async (req, res) => {
  try {
    let result;
    if (req.user.role === 'seller') {
      result = await db.query('SELECT * FROM coupons WHERE seller_id = $1 ORDER BY created_at DESC', [req.user.id]);
    } else {
      result = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
    }
    res.json({ success: true, coupons: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching coupons" });
  }
};

exports.createCoupon = async (req, res) => {
  const { code, type, discount_percent, max_discount, min_order_value, max_usage, valid_until } = req.body;
  
  try {
    let query, values;
    if (req.user.role === 'seller') {
      query = `INSERT INTO coupons (code, type, discount_percent, max_discount, min_order_value, max_usage, valid_until, seller_id)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
      values = [code.toUpperCase(), type, discount_percent, max_discount, min_order_value, max_usage, valid_until || null, req.user.id];
    } else {
      query = `INSERT INTO coupons (code, type, discount_percent, max_discount, min_order_value, max_usage, valid_until, admin_id)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
      values = [code.toUpperCase(), type, discount_percent, max_discount, min_order_value, max_usage, valid_until || null, req.user.id];
    }
    const result = await db.query(query, values);
    res.json({ success: true, coupon: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating coupon" });
  }
};

exports.validateCoupon = async (req, res) => {
  const { code, orderValue } = req.body;
  
  try {
    const result = await db.query(
      'SELECT * FROM coupons WHERE code = $1 AND is_active = TRUE AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)',
      [code.toUpperCase()]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Invalid or expired coupon code" });
    }
    
    const coupon = result.rows[0];
    
    if (coupon.max_usage && coupon.used_count >= coupon.max_usage) {
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    }
    
    if (orderValue < coupon.min_order_value) {
      return res.status(400).json({ success: false, message: `Minimum order value for this coupon is ₹${coupon.min_order_value}` });
    }
    
    let discount = (orderValue * coupon.discount_percent) / 100;
    if (coupon.max_discount && discount > coupon.max_discount) {
      discount = coupon.max_discount;
    }
    
    res.json({ success: true, coupon, discount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error validating coupon" });
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
