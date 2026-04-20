const db = require('../config/db');

exports.getProductReviews = async (req, res) => {
  const { productId } = req.params;
  const rawId = productId;
  
  try {
    const reviewsRes = await db.query(`
      SELECT r.*, c.full_name as customer_name
      FROM reviews r
      JOIN customers c ON r.customer_id = c.customer_id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC
    `, [rawId]);

    // Fetch media for each review
    const reviews = await Promise.all(reviewsRes.rows.map(async (r) => {
      const mediaRes = await db.query("SELECT * FROM review_media WHERE review_id = $1", [r.review_id]);
      return { ...r, media: mediaRes.rows };
    }));

    res.json({ success: true, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching reviews" });
  }
};

exports.addReview = async (req, res) => {
  const customer_id = req.user.id;
  const { productId, rating, comment, title } = req.body;
  const product_id = productId;

  try {
    await db.query('BEGIN');

    // Check if user bought the product (optional but good)
    const orderCheck = await db.query(`
      SELECT o.order_id 
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.customer_id = $1 AND oi.product_id = $2 AND o.status = 'Delivered'
      LIMIT 1
    `, [customer_id, product_id]);

    const order_id = orderCheck.rows.length > 0 ? orderCheck.rows[0].order_id : null;

    const reviewRes = await db.query(
      `INSERT INTO reviews (product_id, customer_id, order_id, rating, title, body, is_verified) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING review_id`,
      [product_id, customer_id, order_id, rating, title || 'Review', comment || '', !!order_id]
    );

    const review_id = reviewRes.rows[0].review_id;

    // Handle files if multer is set up (simplified)
    if (req.files) {
      for (const file of req.files) {
        const url = `/uploads/reviews/${file.filename}`;
        await db.query(
          "INSERT INTO review_media (review_id, media_url, media_type) VALUES ($1, $2, $3)",
          [review_id, url, file.mimetype]
        );
      }
    }

    await db.query('COMMIT');
    res.json({ success: true, message: "Review added successfully", review_id });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: "Error adding review" });
  }
};
exports.getSellerReviews = async (req, res) => {
  const seller_id = req.user.id;
  try {
    const result = await db.query(`
      SELECT r.*, c.full_name as customer_name, p.name as product_name, p.image as product_image
      FROM reviews r
      JOIN products p ON r.product_id = p.product_id
      JOIN customers c ON r.customer_id = c.customer_id
      WHERE p.seller_id = $1
      ORDER BY r.created_at DESC
    `, [seller_id]);
    
    // Fetch media for each review
    const reviews = await Promise.all(result.rows.map(async (r) => {
      const mediaRes = await db.query("SELECT * FROM review_media WHERE review_id = $1", [r.review_id]);
      return { ...r, media: mediaRes.rows };
    }));

    res.json({ success: true, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching seller reviews" });
  }
};
