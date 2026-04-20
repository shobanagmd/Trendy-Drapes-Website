require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

const ASSETS_DIR = path.join(__dirname, '..', 'src', 'assets');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Map of imported variable names to filenames in src/assets
const assetMap = {
  saree1: 'saree-1.jpg',
  saree2: 'saree-2.jpg',
  saree3: 'saree-3.jpg',
  saree4: 'saree-4.jpg',
  saree5: 'saree-5.jpg',
  saree6: 'saree-6.jpg',
  saree7: 'saree-7.jpg',
  saree8: 'saree-8.jpg',
  saree9: 'saree-9.jpg',
  saree10: 'saree-10.jpg',
  saree11: 'saree-11.jpg',
  saree12: 'saree-12.jpg',
  bridal1: 'bridal-1.jpg',
  bridal2: 'bridal-2.jpg',
  lehenga1: 'lehenga-1.jpg',
  lehenga2: 'lehenga-2.jpg',
  indowestern1: 'indowestern-1.jpg',
  indowestern2: 'indowestern-2.jpg',
  jewellery1: 'jewellery-1.jpg',
  jewellery2: 'jewellery-2.jpg',
  jewelery3: 'jewelery-3.jpg',
  jewellery4: 'jewellery-4.jpg',
  jewellery5: 'jewellery-5.jpg',
  jewellery6: 'jewellery-6.jpg',
  jewellery7: 'jewellery-7.jpg',
  jewellery8: 'jewellery-8.jpg',
  iwe3: 'iw-3.jpg',
  iwe4: 'iw-4.jpg',
  iwe6: 'iw-6.jpg',
  iwe7: 'iw-7.jpg',
  iwe8: 'iw-8.jpg',
  iwe9: 'iw-9.jpg',
  l3: 'l-3.jpg',
  l4: 'l-4.jpg',
  l5: 'l-5.jpg',
  l6: 'l-6.jpg',
  l7: 'l-7.jpg',
  l8: 'l-8.jpg',
  b1: 'b-1.jpg',
  b4: 'b-4.jpg',
  b5: 'b-5.jpg',
  b6: 'b-6.jpg',
  b7: 'b-7.jpg',
  b8: 'b-8.jpg',
  b9: 'b-9.jpg',
  b10: 'b-10.jpg',
};

async function migrateProducts() {
  const client = await pool.connect();
  try {
    console.log("Starting migration of static products...");

    const productsPath = path.join(__dirname, '..', 'src', 'data', 'products.js');
    const content = fs.readFileSync(productsPath, 'utf8');
    
    // Improved extraction of the products array
    const startMarker = 'export const products = [';
    const endMarker = '];\r\n\r\nexport const categories = [';
    const altEndMarker = '];\n\nexport const categories = [';
    
    const startIdx = content.indexOf(startMarker);
    let endIdx = content.indexOf(endMarker);
    if (endIdx === -1) endIdx = content.indexOf(altEndMarker);
    
    // If markers fail, try searching for the end of the array strictly
    if (startIdx === -1 || (endIdx === -1)) {
       // Fallback: look for the first ]; after the start
       if (startIdx !== -1) {
          endIdx = content.indexOf('];', startIdx);
       } else {
          throw new Error("Could not find products array in products.js");
       }
    }

    let productsText = content.substring(startIdx + startMarker.length - 1, endIdx + 1);
    
    // Replace asset variables with their filenames
    for (const [v, f] of Object.entries(assetMap)) {
      const regex = new RegExp(`\\b${v}\\b`, 'g');
      productsText = productsText.replace(regex, `'${f}'`);
    }

    // Replace any remaining imports/assets that might be used
    productsText = productsText.replace(/import .* from .*/g, '');

    let products;
    try {
      products = eval(`(${productsText})`);
    } catch (evalErr) {
      console.error("Eval failed. First 100 chars of productsText:", productsText.substring(0, 100));
      console.error("Last 100 chars of productsText:", productsText.substring(productsText.length - 100));
      throw evalErr;
    }
    
    console.log(`Parsed ${products.length} products.`);

    await client.query('BEGIN');

    for (const p of products) {
      const sku = `TD-STATIC-${p.id}`;
      const name = p.name;
      const category = p.category;
      const subCategory = p.subCategory;
      const price = p.price;
      const mrp = p.originalPrice || p.price;
      const stock = 100; // Default stock for static products
      const description = p.description;
      const fabric = p.fabric;
      const color = p.color;
      const work = p.work;
      const pattern = p.pattern;
      const sizes = p.sizes || ['Free Size'];
      const readyToShip = !!p.readyToShip;
      const featured = !!p.discount && p.discount >= 30;

      // Process images
      const images = [];
      const rawImages = Array.isArray(p.images) ? p.images : [p.images].filter(Boolean);
      
      for (const img of rawImages) {
        if (typeof img === 'string' && img.startsWith('http')) {
          images.push(img);
        } else if (typeof img === 'string') {
          // It's a filename from our asset map
          const destName = `migrated-${img}`;
          const srcPath = path.join(ASSETS_DIR, img);
          const destPath = path.join(UPLOADS_DIR, destName);
          
          if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            images.push(`/uploads/${destName}`);
          } else {
            console.warn(`Asset not found: ${srcPath}`);
          }
        }
      }

      const mainImage = images[0] || null;

      await client.query(
        `INSERT INTO admin_products (
          sku, name, category, sub_category, price, mrp, stock, 
          description, main_image, images, fabric, color, 
          work, pattern, sizes, ready_to_ship, featured
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (sku) DO NOTHING`,
        [
          sku, name, category, subCategory, price, mrp, stock,
          description, mainImage, images, fabric, color,
          work, pattern, sizes, readyToShip, featured
        ]
      );
    }

    await client.query('COMMIT');
    console.log("Migration completed successfully!");

  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error("Migration failed:", err);
  } finally {
    if (client) client.release();
    process.exit();
  }
}

migrateProducts();
