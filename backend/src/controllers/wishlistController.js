const db = require('../config/db');

exports.getWishlist = async (req, res) => {
  const customer_id = req.user.id;
  try {
    const listRes = await db.query("SELECT wishlist_id FROM wishlists WHERE customer_id = $1", [customer_id]);
    if (listRes.rows.length === 0) return res.json({ success: true, wishlist: [] });

    const wishlist_id = listRes.rows[0].wishlist_id;
    const items = await db.query(`
      SELECT p.product_id
      FROM wishlist_items wi
      JOIN products p ON wi.product_id = p.product_id
      WHERE wi.wishlist_id = $1
    `, [wishlist_id]);

    res.json({ success: true, wishlist: items.rows.map(r => r.product_id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching wishlist" });
  }
};

exports.toggleWishlist = async (req, res) => {
  const customer_id = req.user.id;
  const { product_id } = req.body;

  try {
    let listRes = await db.query("SELECT wishlist_id FROM wishlists WHERE customer_id = $1", [customer_id]);
    let wishlist_id;
    if (listRes.rows.length === 0) {
      const newList = await db.query("INSERT INTO wishlists (customer_id) VALUES ($1) RETURNING wishlist_id", [customer_id]);
      wishlist_id = newList.rows[0].wishlist_id;
    } else {
      wishlist_id = listRes.rows[0].wishlist_id;
    }

    const existing = await db.query(
      "SELECT * FROM wishlist_items WHERE wishlist_id = $1 AND product_id = $2",
      [wishlist_id, product_id]
    );

    if (existing.rows.length > 0) {
      await db.query("DELETE FROM wishlist_items WHERE wishlist_item_id = $1", [existing.rows[0].wishlist_item_id]);
      res.json({ success: true, message: "Removed from wishlist", action: "removed" });
    } else {
      await db.query("INSERT INTO wishlist_items (wishlist_id, product_id) VALUES ($1, $2)", [wishlist_id, product_id]);
      res.json({ success: true, message: "Added to wishlist", action: "added" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error toggling wishlist" });
  }
};
