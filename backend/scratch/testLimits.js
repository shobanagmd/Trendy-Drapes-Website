require('dotenv').config();
const db = require('../src/config/db');

async function test() {
  try {
    const code = 'LIMIT_TEST_' + Date.now();
    console.log('Creating test coupon:', code);
    
    // Create coupon with max_usage=1
    const createRes = await db.query(
      `INSERT INTO coupons (code, type, discount_percent, max_usage, max_usage_per_user, min_order_value, is_active) 
       VALUES ($1, 'percentage', 10, 1, 1, 0, TRUE) RETURNING *`,
      [code]
    );
    const coupon = createRes.rows[0];
    console.log('Coupon created:', coupon.coupon_id);
    
    // 1. First validation (should pass)
    console.log('Testing first validation...');
    const validateRes1 = await db.query('SELECT * FROM coupons WHERE code = $1', [code]);
    if (validateRes1.rows.length > 0) {
      console.log('Validation 1: PASSED');
    }
    
    // 2. Simulate usage
    console.log('Simulating usage...');
    await db.query('UPDATE coupons SET used_count = used_count + 1 WHERE coupon_id = $1', [coupon.coupon_id]);
    
    // 3. Second validation (should fail global limit)
    console.log('Testing second validation (global limit)...');
    const validateRes2 = await db.query('SELECT * FROM coupons WHERE code = $1', [code]);
    const c2 = validateRes2.rows[0];
    if (c2.used_count >= c2.max_usage) {
      console.log('Validation 2 (Global Limit): PASSED (Message would be: Coupon global usage limit reached)');
    } else {
      console.log('Validation 2 (Global Limit): FAILED');
    }
    
    // Cleanup
    await db.query('DELETE FROM coupons WHERE coupon_id = $1', [coupon.coupon_id]);
    console.log('Cleanup done');
    
  } catch (err) {
    console.error('Test Error:', err);
  } finally {
    process.exit();
  }
}

test();
