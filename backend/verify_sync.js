const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/products',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      if (data.success && data.products.length > 0) {
        const p = data.products[0];
        const mapped = {
          id: p.product_id,
          category: p.category_name || "Uncategorized",
          main_image: p.main_image
        };
        console.log("MAPPED PRODUCT SAMPLE:", mapped);
        
        if (mapped.category === "Uncategorized") {
          console.error("FAIL: Category name is not being returned correctly!");
        } else {
          console.log("SUCCESS: Category name mapped correctly.");
        }
        
        if (mapped.id && mapped.id.includes('-')) {
           console.log("SUCCESS: ID is a UUID.");
        }
      } else {
        console.error("FAIL: No products returned or API failed.");
      }
    } catch (e) {
      console.error("Parse error:", e.message);
    }
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
