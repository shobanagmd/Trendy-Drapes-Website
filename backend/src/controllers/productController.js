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
    fabric, color, work, pattern, ready_to_ship, featured,
    delivery_charge, additional_charge, is_active
  } = req.body;

  // Seller ID logic: Admin can assign, Seller is auto-assigned
  const final_seller_id = (req.user.role === 'admin' && seller_id) ? seller_id : req.user.id;

  try {
    await db.query('BEGIN');

    const result = await db.query(
      `INSERT INTO products (
        name, description, sku, price, mrp, stock_quantity, 
        category_id, seller_id, weight, length, breadth, height, brand,
        fabric, color, work, pattern, ready_to_ship, featured,
        delivery_charge, additional_charge, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING *`,
      [
        name, description, sku, price, mrp, stock_quantity, 
        category_id, final_seller_id, weight, length, breadth, height, brand,
        fabric, color, work, pattern, 
        ready_to_ship === 'true' || ready_to_ship === true, 
        featured === 'true' || featured === true,
        delivery_charge || 0, additional_charge || 0, 
        is_active === 'false' || is_active === false ? false : true
      ]
    );

    const productId = result.rows[0].product_id;

    // Handle variants
    const variantsData = req.body.variants;
    let variants = [];
    if (variantsData) {
      try {
        variants = typeof variantsData === 'string' ? JSON.parse(variantsData) : variantsData;
      } catch (e) {
        console.error("Error parsing variants:", e);
      }
    }

    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        if (variant.sku || variant.variant_name) {
          await db.query(
            `INSERT INTO product_variants (
              product_id, sku, variant_name, variant_value, price, stock_quantity, weight
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              productId, 
              variant.sku || `SKU-${Date.now()}`, 
              variant.variant_name, 
              variant.variant_value,
              variant.price || price, 
              variant.stock_quantity || 0, 
              variant.weight || weight
            ]
          );
        }
      }
    }

    // Handle files from multer
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageUrl = `/uploads/${file.filename}`;
        await db.query(
          "INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES ($1, $2, $3, $4)",
          [productId, imageUrl, i === 0, i]
        );
      }
    }

    await db.query('COMMIT');
    res.json({ success: true, product: result.rows[0] });

  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating product" });
  }
};
