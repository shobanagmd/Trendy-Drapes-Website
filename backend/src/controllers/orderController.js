const db = require('../config/db');
const financeController = require('./financeController');

exports.createOrder = async (req, res) => {
  const customer_id = req.user.id;
  const { 
    address_id, 
    shippingAddress, 
    coupon_id, 
    items, 
    subtotal, 
    discount_amount, 
    discountAmount,
    tax_amount, 
    taxAmount,
    gst,
    shipping_charge, 
    shippingCharge,
    deliveryFee,
    total_amount,
    total,
    finalAmount,
    customerName,
    customerPhone
  } = req.body;

  try {
    await db.query('BEGIN');

    // NORMALIZE IDs: Convert empty strings to null for UUID fields
    let final_address_id = (address_id && address_id.trim() !== "") ? address_id : null;
    const final_coupon_id = (coupon_id && coupon_id.trim() !== "") ? coupon_id : null;

    // If address_id is not provided but full address is
    if (!final_address_id && shippingAddress) {
      console.log("Creating new address...");
      const full_name = shippingAddress.name || shippingAddress.fullName || shippingAddress.full_name || customerName || 'Valued Customer';
      const phone = shippingAddress.phone || customerPhone || null;
      const address_line_1 = shippingAddress.door || shippingAddress.address || shippingAddress.address_line_1 || shippingAddress.addressLine1 || 'N/A';
      const address_line_2 = shippingAddress.street || shippingAddress.address_line_2 || shippingAddress.addressLine2 || '';
      const city = shippingAddress.city || '';
      const state = shippingAddress.state || '';
      const pincode = String(shippingAddress.pincode || shippingAddress.zip || shippingAddress.zipcode || '');
      const address_type = shippingAddress.address_type || 'Home';

      const addrRes = await db.query(
        `INSERT INTO addresses (customer_id, full_name, phone, address_line_1, address_line_2, city, state, pincode, is_default, address_type) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING address_id`,
        [customer_id, full_name, phone, address_line_1, address_line_2, city, state, pincode, false, address_type]
      );
      final_address_id = addrRes.rows[0].address_id;
      console.log("Address created with ID:", final_address_id);
    }

    // 1. Insert Order
    const orderRes = await db.query(
      `INSERT INTO orders (customer_id, address_id, coupon_id, subtotal, discount_amount, tax_amount, shipping_charge, total_amount) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        customer_id, 
        final_address_id, 
        (final_coupon_id && final_coupon_id.length === 36) ? final_coupon_id : null, 
        subtotal, 
        discount_amount || discountAmount || 0, 
        tax_amount || taxAmount || gst || 0, 
        shipping_charge || shippingCharge || deliveryFee || 0, 
        total_amount || total || finalAmount
      ]
    );

    const order_id = orderRes.rows[0].order_id;

    // 2. Insert Order Items
    console.log("Inserting order items...");
    for (const item of items) {
      const productId = item.product_id || item.productId || (item.product && (item.product.id || item.product.product_id));
      
      // Basic UUID validation
      if (!productId || productId.length !== 36) {
        console.warn("Skipping item with invalid productId:", productId);
        continue;
      }

      const price = item.unit_price || item.price || (item.product && item.product.price) || 0;
      const quantity = item.quantity || 1;
      const variantId = (item.variant_id && String(item.variant_id).length === 36) ? item.variant_id : null;

      let seller_id = item.seller_id;
      if (!seller_id && productId) {
        const prodRes = await db.query("SELECT seller_id FROM products WHERE product_id = $1", [productId]);
        if (prodRes.rows.length > 0) seller_id = prodRes.rows[0].seller_id;
      }

      await db.query(
        `INSERT INTO order_items (order_id, product_id, seller_id, variant_id, quantity, unit_price, total_price) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [order_id, productId, seller_id, variantId, quantity, price, quantity * price]
      );
    }

    // 3. Create initial status history
    await db.query(
      `INSERT INTO order_status_history (order_id, status, changed_by, notes) 
       VALUES ($1, $2, $3, $4)`,
      [order_id, 'Pending', 'System', 'Order placed successfully']
    );

    // 4. Record financial transaction (Sale)
    await financeController.recordTransaction({
        order_id: order_id,
        transaction_type: 'Sale',
        amount: total_amount || total || finalAmount
    });

    await db.query('COMMIT');

    res.json({ success: true, order: orderRes.rows[0] });

  } catch (err) {
    await db.query('ROLLBACK');
    console.error("ORDER CREATION ERROR:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error creating order", 
      error: err.message,
      detail: err.detail // PG specific detail (e.g. which constraint failed)
    });
  }
};

exports.getCustomerOrders = async (req, res) => {
  const customer_id = req.user.id;
  try {
    const result = await db.query(`
      SELECT o.order_id, o.customer_id, o.address_id, o.coupon_id, 
             COALESCE(o.subtotal, 0) AS subtotal, 
             COALESCE(o.discount_amount, 0) AS discount, 
             COALESCE(o.tax_amount, 0) AS gst, 
             COALESCE(o.shipping_charge, 0) AS delivery_fee, 
             COALESCE(o.total_amount, 0) AS total, 
             o.order_status AS status, o.payment_status, 
             o.placed_at AS created_at, o.updated_at,
             COALESCE(a.full_name, c.full_name, 'Valued Customer') AS customer_name,
             COALESCE(a.phone, c.phone, '') AS customer_phone,
             JSON_BUILD_OBJECT(
               'address', COALESCE(a.address_line_1, ''),
               'city', COALESCE(a.city, ''),
               'state', COALESCE(a.state, ''),
               'pincode', COALESCE(a.pincode, ''),
               'country', COALESCE(a.country, 'India')
             ) AS shipping_address,
             COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
               'item_id', oi.order_item_id,
               'product_id', p.product_id,
               'product_name', p.name,
               'product_image', img.image_url,
               'quantity', COALESCE(oi.quantity, 1),
               'price', COALESCE(oi.unit_price, 0)
             )) FILTER (WHERE oi.order_item_id IS NOT NULL), '[]'::json) as items
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN addresses a ON o.address_id = a.address_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.product_id
      LEFT JOIN LATERAL (
        SELECT image_url FROM product_images pi 
        WHERE pi.product_id = p.product_id 
        ORDER BY pi.is_primary DESC 
        LIMIT 1
      ) img ON TRUE
      WHERE o.customer_id = $1
      GROUP BY o.order_id, c.customer_id, a.address_id
      ORDER BY o.placed_at DESC
    `, [customer_id]);
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};
