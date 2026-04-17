const db = require('../config/db');

exports.getCart = async (req, res) => {
  const customer_id = req.user.id;
  try {
    const cartRes = await db.query("SELECT cart_id FROM carts WHERE customer_id = $1", [customer_id]);
    if (cartRes.rows.length === 0) return res.json({ success: true, cart: [] });

    const cart_id = cartRes.rows[0].cart_id;
    const items = await db.query(`
      SELECT ci.*, p.name, p.price as current_price, pi.image_url as main_image
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.product_id
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = TRUE
      WHERE ci.cart_id = $1
    `, [cart_id]);

    res.json({ success: true, cart: items.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching cart" });
  }
};

exports.addToCart = async (req, res) => {
  const customer_id = req.user.id;
  const { product_id, size, quantity } = req.body;

  try {
    let cartRes = await db.query("SELECT cart_id FROM carts WHERE customer_id = $1", [customer_id]);
    let cart_id;
    if (cartRes.rows.length === 0) {
      const newCart = await db.query("INSERT INTO carts (customer_id) VALUES ($1) RETURNING cart_id", [customer_id]);
      cart_id = newCart.rows[0].cart_id;
    } else {
      cart_id = cartRes.rows[0].cart_id;
    }

    // Check if exists
    const existing = await db.query(
      "SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2 AND (size = $3 OR ($3 IS NULL AND size IS NULL))",
      [cart_id, product_id, size]
    );

    if (existing.rows.length > 0) {
      await db.query(
        "UPDATE cart_items SET quantity = quantity + $1, updated_at = NOW() WHERE cart_item_id = $2",
        [quantity || 1, existing.rows[0].cart_item_id]
      );
    } else {
      await db.query(
        "INSERT INTO cart_items (cart_id, product_id, size, quantity) VALUES ($1, $2, $3, $4)",
        [cart_id, product_id, size, quantity || 1]
      );
    }

    res.json({ success: true, message: "Added to cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error adding to cart" });
  }
};

exports.updateQuantity = async (req, res) => {
  const customer_id = req.user.id;
  const { product_id } = req.params;
  const { quantity, size } = req.body;

  try {
    const cartRes = await db.query("SELECT cart_id FROM carts WHERE customer_id = $1", [customer_id]);
    if (cartRes.rows.length === 0) return res.status(404).json({ success: false, message: "Cart not found" });

    const cart_id = cartRes.rows[0].cart_id;
    await db.query(
      "UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE cart_id = $2 AND product_id = $3 AND (size = $4 OR ($4 IS NULL AND size IS NULL))",
      [quantity, cart_id, product_id, size]
    );

    res.json({ success: true, message: "Quantity updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating quantity" });
  }
};

exports.removeFromCart = async (req, res) => {
  const customer_id = req.user.id;
  const { product_id } = req.params;
  const { size } = req.query;
  
  try {
    const cartRes = await db.query("SELECT cart_id FROM carts WHERE customer_id = $1", [customer_id]);
    if (cartRes.rows.length === 0) return res.json({ success: true });

    const cart_id = cartRes.rows[0].cart_id;
    if (size) {
      await db.query(
        "DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 AND size = $3",
        [cart_id, product_id, size]
      );
    } else {
      await db.query(
        "DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2",
        [cart_id, product_id]
      );
    }
    
    res.json({ success: true, message: "Removed from cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error removing from cart" });
  }
};
