-- Trendy Drapes Database Schema - 36 Tables
-- UUID as Primary Keys, Normalized Structure, Soft Delete Strategy

-- Enable UUID extension (just in case)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- GROUP 1 - USER & AUTH
-- ================================================================

-- 1. admins
CREATE TABLE IF NOT EXISTS admins (
    admin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    permissions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_by_admin_id UUID REFERENCES admins(admin_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. customers
CREATE TABLE IF NOT EXISTS customers (
    customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID, -- Requested default field
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash TEXT NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    profile_picture_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. sellers
CREATE TABLE IF NOT EXISTS sellers (
    seller_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash TEXT NOT NULL,
    store_name VARCHAR(255),
    gstin VARCHAR(50),
    store_logo_url TEXT,
    store_description TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    approved_by_admin_id UUID REFERENCES admins(admin_id),
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 33. auth_sessions
CREATE TABLE IF NOT EXISTS auth_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_type VARCHAR(50) NOT NULL, -- 'admin', 'customer', 'seller'
    user_ref_id UUID NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    device_info TEXT,
    ip_address VARCHAR(45),
    is_blacklisted BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 34. otp_verifications
CREATE TABLE IF NOT EXISTS otp_verifications (
    otp_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_type VARCHAR(50),
    user_ref_id UUID,
    contact VARCHAR(64) NOT NULL,
    otp_hash VARCHAR(64) NOT NULL,
    purpose VARCHAR(50), -- 'login', 'registration', 'password_reset'
    attempts INT DEFAULT 0,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 35. audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admins(admin_id),
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- GROUP 2 - ADDRESS & LOCATION
-- ================================================================

-- 4. addresses
CREATE TABLE IF NOT EXISTS addresses (
    address_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(customer_id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    address_line_1 TEXT,
    address_line_2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    address_type VARCHAR(50), -- 'Home', 'Work'
    is_default BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 29. seller_pickup_locations
CREATE TABLE IF NOT EXISTS seller_pickup_locations (
    pickup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(seller_id) ON DELETE CASCADE,
    location_name VARCHAR(255),
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    address_line_1 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    shiprocket_location_id VARCHAR(100),
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- GROUP 3 - CATALOG
-- ================================================================

-- 5. categories
CREATE TABLE IF NOT EXISTS categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admins(admin_id), -- Fixed: FK, not PK
    parent_category_id UUID REFERENCES categories(category_id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. products
CREATE TABLE IF NOT EXISTS products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(category_id),
    seller_id UUID REFERENCES sellers(seller_id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    mrp DECIMAL(15,2),
    stock_quantity INT DEFAULT 0,
    weight DECIMAL(10,2), -- in kg
    length DECIMAL(10,2), -- in cm
    breadth DECIMAL(10,2),
    height DECIMAL(10,2),
    brand VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. product_images
CREATE TABLE IF NOT EXISTS product_images (
    image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. product_variants
CREATE TABLE IF NOT EXISTS product_variants (
    variant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    variant_name VARCHAR(100), -- e.g., 'Size', 'Color'
    variant_value VARCHAR(100), -- e.g., 'XL', 'Red'
    price DECIMAL(15,2),
    stock_quantity INT DEFAULT 0,
    weight DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- GROUP 4 - SHOPPING
-- ================================================================

-- 9. carts
CREATE TABLE IF NOT EXISTS carts (
    cart_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(customer_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. cart_items
CREATE TABLE IF NOT EXISTS cart_items (
    cart_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES carts(cart_id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(product_id),
    variant_id UUID REFERENCES product_variants(variant_id),
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(15,2), -- Price at time of adding to cart
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. wishlists
CREATE TABLE IF NOT EXISTS wishlists (
    wishlist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(customer_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. wishlist_items
CREATE TABLE IF NOT EXISTS wishlist_items (
    wishlist_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wishlist_id UUID REFERENCES wishlists(wishlist_id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(product_id),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- GROUP 5 - ORDERS & PAYMENTS
-- ================================================================

-- 13. orders
CREATE TABLE IF NOT EXISTS orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(customer_id),
    address_id UUID REFERENCES addresses(address_id),
    coupon_id UUID, -- Will link to coupons table if exist
    subtotal DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    shipping_charge DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    order_status VARCHAR(50) DEFAULT 'Pending',
    payment_status VARCHAR(50) DEFAULT 'Pending',
    cancellation_reason TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. order_items
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(product_id),
    seller_id UUID REFERENCES sellers(seller_id),
    variant_id UUID REFERENCES product_variants(variant_id),
    quantity INT NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    item_status VARCHAR(50) DEFAULT 'Confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. payments
CREATE TABLE IF NOT EXISTS payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(order_id),
    customer_id UUID REFERENCES customers(customer_id),
    seller_id UUID REFERENCES sellers(seller_id), -- For split payments/tracking
    payment_method VARCHAR(50), -- 'COD', 'Card', 'UPI'
    amount DECIMAL(15,2) NOT NULL,
    transaction_id VARCHAR(255) UNIQUE,
    payment_status VARCHAR(50),
    gateway_name VARCHAR(100),
    gateway_response_code VARCHAR(10),
    failure_reason_code VARCHAR(50),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. order_sellers
CREATE TABLE IF NOT EXISTS order_sellers (
    order_seller_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(order_id),
    seller_id UUID REFERENCES sellers(seller_id),
    seller_subtotal DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 21. order_status_history
CREATE TABLE IF NOT EXISTS order_status_history (
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(order_id),
    status VARCHAR(100) NOT NULL,
    changed_by VARCHAR(100),
    notes TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- GROUP 6 - COUPONS & RETURNS
-- ================================================================

-- 17. coupons
CREATE TABLE IF NOT EXISTS coupons (
    coupon_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admins(admin_id),
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20), -- 'PERCENT', 'FLAT'
    discount_percent DECIMAL(5,2),
    max_discount DECIMAL(15,2),
    min_order_value DECIMAL(15,2),
    used_count INT DEFAULT 0,
    max_usage INT,
    is_active BOOLEAN DEFAULT TRUE,
    valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. coupon_usage
CREATE TABLE IF NOT EXISTS coupon_usage (
    usage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES coupons(coupon_id),
    customer_id UUID REFERENCES customers(customer_id),
    order_id UUID REFERENCES orders(order_id),
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. order_coupons
CREATE TABLE IF NOT EXISTS order_coupons (
    order_coupon_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(order_id),
    coupon_id UUID REFERENCES coupons(coupon_id),
    discount_amount DECIMAL(15,2),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 22. return_requests
CREATE TABLE IF NOT EXISTS return_requests (
    return_request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID REFERENCES order_items(order_item_id),
    customer_id UUID REFERENCES customers(customer_id),
    order_id UUID REFERENCES orders(order_id),
    resolved_by_admin_id UUID REFERENCES admins(admin_id),
    reason TEXT,
    return_type VARCHAR(50), -- 'REFUND', 'REPLACEMENT'
    refund_amount DECIMAL(15,2),
    refund_status VARCHAR(50), -- 'Pending', 'Processed'
    resolution_note TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- ================================================================
-- GROUP 7 - REVIEWS & NOTIFICATIONS
-- ================================================================

-- 16. reviews
CREATE TABLE IF NOT EXISTS reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(product_id),
    customer_id UUID REFERENCES customers(customer_id),
    order_item_id UUID REFERENCES order_items(order_item_id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 32. notifications
CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(customer_id),
    seller_id UUID REFERENCES sellers(seller_id),
    order_id UUID REFERENCES orders(order_id),
    type VARCHAR(50),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- ================================================================
-- GROUP 8 - SHIPPING (SHIPROCKET)
-- ================================================================

-- 24. shiprocket_orders
CREATE TABLE IF NOT EXISTS shiprocket_orders (
    sr_order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(order_id),
    payment_id UUID REFERENCES payments(payment_id),
    channel_order_id VARCHAR(100),
    awb_code VARCHAR(100),
    shipment_id VARCHAR(100),
    courier_id VARCHAR(100),
    courier_name VARCHAR(100),
    pickup_location VARCHAR(255),
    sr_status VARCHAR(100),
    sr_status_code INT,
    sr_created_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 25. shiprocket_payload
CREATE TABLE IF NOT EXISTS shiprocket_payload (
    payload_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sr_order_id UUID REFERENCES shiprocket_orders(sr_order_id),
    product_id UUID REFERENCES products(product_id),
    order_item_id UUID REFERENCES order_items(order_item_id),
    product_name_snapshot VARCHAR(255),
    sku_snapshot VARCHAR(100),
    quantity INT,
    weight_kg DECIMAL(10,3),
    length_cm DECIMAL(10,2),
    breadth_cm DECIMAL(10,2),
    height_cm DECIMAL(10,2),
    unit_price DECIMAL(15,2),
    total_price DECIMAL(15,2),
    hsn_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 26. shiprocket_tracking
CREATE TABLE IF NOT EXISTS shiprocket_tracking (
    tracking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sr_order_id UUID REFERENCES shiprocket_orders(sr_order_id),
    awb_code VARCHAR(100),
    current_status VARCHAR(100),
    current_location VARCHAR(100),
    estimated_delivery DATE,
    activity_log JSONB,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 27. shiprocket_webhook_log
CREATE TABLE IF NOT EXISTS shiprocket_webhook_log (
    webhook_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sr_order_id UUID REFERENCES shiprocket_orders(sr_order_id),
    event_type VARCHAR(100),
    raw_payload JSONB,
    is_processed BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- 23. deliveries
CREATE TABLE IF NOT EXISTS deliveries (
    delivery_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(order_id),
    order_item_id UUID REFERENCES order_items(order_item_id),
    seller_id UUID REFERENCES sellers(seller_id),
    address_id UUID REFERENCES addresses(address_id),
    pickup_location_id UUID REFERENCES seller_pickup_locations(pickup_id),
    processed_webhook_id UUID REFERENCES shiprocket_webhook_log(webhook_id),
    shipping_address_snapshot JSONB,
    shiprocket_order_id VARCHAR(100),
    shipment_id VARCHAR(100),
    awb_code VARCHAR(100),
    courier_name VARCHAR(100),
    shipping_status VARCHAR(100),
    estimated_delivery_date DATE,
    dispatched_at TIMESTAMP,
    delivered_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 28. reverse_shipments
CREATE TABLE IF NOT EXISTS reverse_shipments (
    reverse_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_request_id UUID REFERENCES return_requests(return_request_id),
    order_item_id UUID REFERENCES order_items(order_item_id),
    seller_id UUID REFERENCES sellers(seller_id),
    customer_id UUID REFERENCES customers(customer_id),
    pickup_address_id UUID REFERENCES addresses(address_id),
    dropoff_pickup_location_id UUID REFERENCES seller_pickup_locations(pickup_id),
    shiprocket_reverse_order_id VARCHAR(100),
    reverse_awb_code VARCHAR(100),
    status VARCHAR(100),
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP
);

-- ================================================================
-- GROUP 9 - FINANCIALS
-- ================================================================

-- 30. seller_commissions
CREATE TABLE IF NOT EXISTS seller_commissions (
    commission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID REFERENCES order_items(order_item_id),
    seller_id UUID REFERENCES sellers(seller_id),
    order_id UUID REFERENCES orders(order_id),
    sale_amount DECIMAL(15,2) NOT NULL,
    commission_rate DECIMAL(5,2),
    commission_amount DECIMAL(15,2),
    seller_earnings DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'Pending', -- 'Calculated', 'Paid'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 31. seller_payouts
CREATE TABLE IF NOT EXISTS seller_payouts (
    payout_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(seller_id),
    initiated_by_admin_id UUID REFERENCES admins(admin_id),
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_ref VARCHAR(255),
    payout_period_start DATE,
    payout_period_end DATE,
    status VARCHAR(50) DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- 36. bank_account
CREATE TABLE IF NOT EXISTS bank_account (
    bank_account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL, -- UUID of Seller or Customer
    owner_type VARCHAR(50) NOT NULL, -- 'Seller', 'Customer'
    account_number VARCHAR(50) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    upi_id VARCHAR(100),
    bank_name VARCHAR(100),
    ifsc_code VARCHAR(20),
    account_type VARCHAR(50), -- 'Savings', 'Current'
    verification_status VARCHAR(50) DEFAULT 'Pending',
    verified_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_by_admin_id UUID REFERENCES admins(admin_id)
);

-- ================================================================
-- GROUP 10 - EXTENDED FINANCIALS (NEW)
-- ================================================================

-- 37. finance_transactions
CREATE TABLE IF NOT EXISTS finance_transactions (
    finance_transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_finance_id UUID, -- Will be linked later if needed
    order_id UUID REFERENCES orders(order_id),
    payment_id UUID REFERENCES payments(payment_id),
    seller_payout_id UUID REFERENCES seller_payouts(payout_id),
    transaction_type VARCHAR(50) NOT NULL, -- 'Sale', 'Refund', 'Seller Payout', 'Commission', 'Ad Revenue', 'Adjustment'
    amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 38. daily_finances
CREATE TABLE IF NOT EXISTS daily_finances (
    daily_finance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(seller_id),
    date DATE NOT NULL,
    weekly_finance_id UUID,
    monthly_finance_id UUID,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    platform_commission DECIMAL(15,2) DEFAULT 0,
    net_seller_earnings DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(seller_id, date)
);

-- 39. weekly_finances
CREATE TABLE IF NOT EXISTS weekly_finances (
    weekly_finance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_finance_id UUID REFERENCES daily_finances(daily_finance_id),
    seller_id UUID REFERENCES sellers(seller_id),
    week_number INT NOT NULL,
    year INT NOT NULL,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    platform_commission DECIMAL(15,2) DEFAULT 0,
    net_seller_earnings DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(seller_id, week_number, year)
);

-- 40. monthly_finances
CREATE TABLE IF NOT EXISTS monthly_finances (
    monthly_finance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(seller_id),
    month_number INT NOT NULL,
    year INT NOT NULL,
    quarterly_finance_id UUID,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    platform_commission DECIMAL(15,2) DEFAULT 0,
    net_seller_earnings DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(seller_id, month_number, year)
);

-- 41. quarterly_finances
CREATE TABLE IF NOT EXISTS quarterly_finances (
    quarterly_finance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monthly_finance_id UUID REFERENCES monthly_finances(monthly_finance_id),
    seller_id UUID REFERENCES sellers(seller_id),
    quarter_number INT NOT NULL,
    year INT NOT NULL,
    half_yearly_finance_id UUID,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    platform_commission DECIMAL(15,2) DEFAULT 0,
    net_seller_earnings DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(seller_id, quarter_number, year)
);

-- 42. half_yearly_finances
CREATE TABLE IF NOT EXISTS half_yearly_finances (
    half_yearly_finances_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(seller_id),
    half_number INT NOT NULL,
    year INT NOT NULL,
    annual_finance_id UUID,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    platform_commission DECIMAL(15,2) DEFAULT 0,
    net_seller_earnings DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(seller_id, half_number, year)
);

-- 43. annual_finances
CREATE TABLE IF NOT EXISTS annual_finances (
    annual_finance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    half_yearly_finance_id UUID REFERENCES half_yearly_finances(half_yearly_finances_id),
    seller_id UUID REFERENCES sellers(seller_id),
    year INT NOT NULL,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    platform_commission DECIMAL(15,2) DEFAULT 0,
    net_seller_earnings DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(seller_id, year)
);

-- Now add back-references that were skipped to avoid circularity if any
ALTER TABLE daily_finances ADD CONSTRAINT fk_daily_weekly FOREIGN KEY (weekly_finance_id) REFERENCES weekly_finances(weekly_finance_id);
ALTER TABLE daily_finances ADD CONSTRAINT fk_daily_monthly FOREIGN KEY (monthly_finance_id) REFERENCES monthly_finances(monthly_finance_id);
ALTER TABLE monthly_finances ADD CONSTRAINT fk_monthly_quarterly FOREIGN KEY (quarterly_finance_id) REFERENCES quarterly_finances(quarterly_finance_id);
ALTER TABLE quarterly_finances ADD CONSTRAINT fk_quarterly_half FOREIGN KEY (half_yearly_finance_id) REFERENCES half_yearly_finances(half_yearly_finances_id);
ALTER TABLE half_yearly_finances ADD CONSTRAINT fk_half_annual FOREIGN KEY (annual_finance_id) REFERENCES annual_finances(annual_finance_id);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- Customers
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Sellers
CREATE INDEX IF NOT EXISTS idx_sellers_email ON sellers(email);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(placed_at);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- Financials
CREATE INDEX IF NOT EXISTS idx_finance_tx_order ON finance_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_finance_tx_payment ON finance_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_finance_tx_type ON finance_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_daily_fin_date ON daily_finances(date);
CREATE INDEX IF NOT EXISTS idx_daily_fin_seller ON daily_finances(seller_id);

-- Foreign Keys (General)
CREATE INDEX IF NOT EXISTS idx_cart_customer ON carts(customer_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_customer ON notifications(customer_id);

