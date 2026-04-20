require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

const tablesToDrop = [
  'addresses', 'admins', 'audit_logs', 'auth_sessions', 'bank_account', 'cart_items', 'carts', 'categories', 'coupon_usage', 'coupons', 'customers', 'deliveries', 'notifications', 'order_coupons', 'order_items', 'order_sellers', 'order_status_history', 'orders', 'otp_verifications', 'payments', 'product_images', 'product_variants', 'products', 'return_requests', 'reverse_shipments', 'reviews', 'seller_commissions', 'seller_payouts', 'seller_pickup_locations', 'sellers', 'shiprocket_orders', 'shiprocket_payload', 'shiprocket_tracking', 'shiprocket_webhook_log', 'wishlist_items', 'wishlists'
];

async function cleanup() {
  await client.connect();
  console.log("Dropping 36 core tables...");
  for (const table of tablesToDrop) {
    try {
      await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
      console.log(`Dropped ${table}`);
    } catch (err) {
      console.error(`Error dropping ${table}:`, err.message);
    }
  }
  await client.end();
}
cleanup();
