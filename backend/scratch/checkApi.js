const http = require('http');

const data = JSON.stringify({
  code: 'TRENDY26',
  orderValue: 500
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/coupons/validate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('BODY:', body);
    process.exit();
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
  process.exit();
});

req.write(data);
req.end();
