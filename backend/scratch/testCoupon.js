require('dotenv').config();
const db = require('../src/config/db');

async function test() {
  try {
    const code = 'TRENDY26';
    const orderValue = 500;
    console.log('Validating coupon:', code);
    
    const query = `
      SELECT * FROM coupons 
      WHERE code = $1 
      AND is_active = TRUE 
      AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
    `;
    
    const result = await db.query(query, [code.toUpperCase()]);
    console.log('Query result:', JSON.stringify(result.rows, null, 2));
    
    if (result.rows.length === 0) {
      console.log('No coupon found');
      return;
    }
    
    const coupon = result.rows[0];
    const minOrder = parseFloat(coupon.min_order_value);
    const discPercent = parseFloat(coupon.discount_percent);
    
    if (orderValue < minOrder) {
      console.log('Order value too low:', orderValue, '<', minOrder);
    } else {
      let discount = (orderValue * discPercent) / 100;
      console.log('Discount calculated:', discount);
    }
  } catch (err) {
    console.error('Validation Error:', err);
  } finally {
    process.exit();
  }
}

test();
