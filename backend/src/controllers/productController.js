const db = require('../config/db');

exports.getAllProducts = async (req, res) => {
  try {
    // Join with images to get the primary image
    const result = await db.query(`
      SELECT p.*, pi.image_url as main_image, c.name as category_name
      FROM products p
      LEFT JOIN product_images pi ON p.product_id = pi.product_id AND pi.is_primary = TRUE
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.deleted_at IS NULL AND p.is_active = TRUE
      ORDER BY p.created_at DESC
    `);
    res.json({ success: true, products: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching products" });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await db.query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      WHERE p.product_id = $1 AND p.deleted_at IS NULL
    `, [id]);

    if (product.rows.length === 0) return res.status(404).json({ success: false, message: "Product not found" });

    const images = await db.query("SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order", [id]);
    const variants = await db.query("SELECT * FROM product_variants WHERE product_id = $1", [id]);

    res.json({ 
      success: true, 
      product: { 
        ...product.rows[0], 
        images: images.rows, 
        variants: variants.rows 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching product details" });
  }
};

exports.createProduct = async (req, res) => {
  const { 
    name, description, sku, price, mrp, stock_quantity, 
    category_id, seller_id, weight, length, breadth, height, brand,
    images // Expected as array of { url, is_primary, alt_text }
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO products (
        name, description, sku, price, mrp, stock_quantity, 
        category_id, seller_id, weight, length, breadth, height, brand
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [name, description, sku, price, mrp, stock_quantity, category_id, seller_id, weight, length, breadth, height, brand]
    );

    const productId = result.rows[0].product_id;

    if (images && images.length > 0) {
      for (const img of images) {
        await db.query(
          "INSERT INTO product_images (product_id, image_url, is_primary, alt_text) VALUES ($1, $2, $3, $4)",
          [productId, img.url, img.is_primary || false, img.alt_text || '']
        );
      }
    }

    res.json({ success: true, product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating product" });
  }
};
