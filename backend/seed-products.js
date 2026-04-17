const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'Shobana@805',
  port: 5432,
});

async function seed() {
  const productsJsPath = path.join(__dirname, '../src/data/products_utf8.js');
  let content = fs.readFileSync(productsJsPath, 'utf8');

  // 1. Transform ES Modules to CommonJS for easier 'require'
  // Convert imports to simple assignments
  content = content.replace(/import (\w+) from "@\/assets\/([\w\-\.]+)"/g, 'const $1 = "/uploads/$2";');
  // Convert export to module.exports
  content = content.replace(/export const products = (\[[\s\S]*?\]);/, 'module.exports = { products: $1 };');
  // Remove other exports like categories/filterOptions to keep it clean
  content = content.replace(/export const (categories|filterOptions|sortOptions) = [\s\S]*?;/g, '');

  const tempFilePath = path.join(__dirname, 'temp_products.js');
  fs.writeFileSync(tempFilePath, content);

  let productsData;
  try {
    const tempModule = require(tempFilePath);
    productsData = tempModule.products;
  } catch (err) {
    console.error("Error requiring temp products file:", err.message);
    return;
  } finally {
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
  }

  console.log(`Found ${productsData.length} products. Proceeding to migration...`);

  // 2. Ensure uploads directory exists and copy files
  const assetsDir = path.join(__dirname, '../src/assets');
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

  // Re-run regex to get the filenames for copying
  const assetLineRegex = /const (\w+) = "\/uploads\/([\w\-\.]+)";/g;
  let match;
  while ((match = assetLineRegex.exec(content)) !== null) {
    const filename = match[2];
    const src = path.join(assetsDir, filename);
    const dest = path.join(uploadsDir, filename);
    if (fs.existsSync(src)) {
      if (!fs.existsSync(dest)) fs.copyFileSync(src, dest);
    }
  }

  // 3. Insert into database (admin_products)
  for (const p of productsData) {
    try {
      const mainImage = Array.isArray(p.images) ? p.images[0] : null;
      const images = Array.isArray(p.images) ? p.images : [];
      
      await pool.query(
        `INSERT INTO admin_products (
          sku, name, category, sub_category, 
          price, mrp, stock, description, main_image, 
          images, fabric, color, work, pattern, 
          sizes, ready_to_ship, featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
        ON CONFLICT (sku) DO UPDATE SET 
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          mrp = EXCLUDED.mrp,
          description = EXCLUDED.description,
          main_image = EXCLUDED.main_image,
          images = EXCLUDED.images`,
        [
          p.sku || `TD-ST-${p.id}`,
          p.name,
          p.category,
          p.subCategory || p.sub_category,
          p.price,
          p.originalPrice || p.mrp || p.price,
          p.stock || 10,
          p.description,
          mainImage,
          images,
          p.fabric,
          p.color,
          p.work,
          p.pattern,
          p.sizes || ['Free Size'],
          p.readyToShip ?? true,
          p.featured ?? false
        ]
      );
    } catch (err) {
      console.error(`Error inserting product ${p.name}:`, err.message);
    }
  }

  console.log("Migration complete!");
  process.exit();
}

seed();
