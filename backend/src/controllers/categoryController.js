const db = require('../config/db');

exports.getAllCategories = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM categories WHERE is_active = TRUE ORDER BY name ASC");
    res.json({ success: true, categories: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching categories" });
  }
};
