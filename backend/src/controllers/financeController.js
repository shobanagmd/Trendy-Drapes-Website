const db = require('../config/db');

/**
 * Helper to update all finance summary tables (38-43)
 * This is called incrementally for each transaction or during recalculation.
 */
const updateSummaries = async (transaction) => {
    const { finance_transaction_id, order_id, transaction_type, amount, seller_id: provided_seller_id, created_at } = transaction;
    
    let seller_id = provided_seller_id;
    const date = new Date(created_at || new Date());
    const dateStr = date.toISOString().split('T')[0];
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const week = getWeekNumber(date);
    const quarter = Math.floor((date.getMonth() + 3) / 3);
    const half = date.getMonth() < 6 ? 1 : 2;

    // If seller_id is not provided, try to find it from the order
    if (!seller_id && order_id) {
        const orderRes = await db.query("SELECT seller_id FROM order_items WHERE order_id = $1 LIMIT 1", [order_id]);
        if (orderRes.rows.length > 0) seller_id = orderRes.rows[0].seller_id;
    }

    if (!seller_id) return; // Cannot update charts without a seller (e.g. platform only adjustment?)

    // Adjust values based on transaction type
    let rev = 0, comm = 0, earn = 0;
    if (transaction_type === 'Sale') {
        rev = parseFloat(amount);
        comm = rev * 0.15; // 15% Platform commission
        earn = rev - comm;
    } else if (transaction_type === 'Refund') {
        rev = -parseFloat(amount);
        comm = rev * 0.15;
        earn = rev - comm;
    } else if (transaction_type === 'Commission') {
        comm = parseFloat(amount);
        earn = -comm;
    }
    // 'Seller Payout' doesn't affect 'Earnings' since earnings are recorded at Sale time.
    // Payout affects 'Pending Payout' which is handled in the summary GET calls or a separate field.

    try {
        // 1. Daily Finances
        const daily = await db.query(
            `INSERT INTO daily_finances (seller_id, date, total_revenue, platform_commission, net_seller_earnings)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (seller_id, date) DO UPDATE SET 
             total_revenue = daily_finances.total_revenue + EXCLUDED.total_revenue,
             platform_commission = daily_finances.platform_commission + EXCLUDED.platform_commission,
             net_seller_earnings = daily_finances.net_seller_earnings + EXCLUDED.net_seller_earnings
             RETURNING *`,
            [seller_id, dateStr, rev, comm, earn]
        );
        const dailyId = daily.rows[0].daily_finance_id;

        // 2. Weekly Finances
        const weekly = await db.query(
            `INSERT INTO weekly_finances (seller_id, week_number, year, total_revenue, platform_commission, net_seller_earnings)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (seller_id, week_number, year) DO UPDATE SET 
             total_revenue = weekly_finances.total_revenue + EXCLUDED.total_revenue,
             platform_commission = weekly_finances.platform_commission + EXCLUDED.platform_commission,
             net_seller_earnings = weekly_finances.net_seller_earnings + EXCLUDED.net_seller_earnings
             RETURNING *`,
            [seller_id, week, year, rev, comm, earn]
        );
        const weeklyId = weekly.rows[0].weekly_finance_id;

        // 3. Monthly Finances
        const monthly = await db.query(
            `INSERT INTO monthly_finances (seller_id, month_number, year, total_revenue, platform_commission, net_seller_earnings)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (seller_id, month_number, year) DO UPDATE SET 
             total_revenue = monthly_finances.total_revenue + EXCLUDED.total_revenue,
             platform_commission = monthly_finances.platform_commission + EXCLUDED.platform_commission,
             net_seller_earnings = monthly_finances.net_seller_earnings + EXCLUDED.net_seller_earnings
             RETURNING *`,
            [seller_id, month, year, rev, comm, earn]
        );
        const monthlyId = monthly.rows[0].monthly_finance_id;

        // 4. Quarterly Finances
        const quarterly = await db.query(
            `INSERT INTO quarterly_finances (seller_id, quarter_number, year, total_revenue, platform_commission, net_seller_earnings)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (seller_id, quarter_number, year) DO UPDATE SET 
             total_revenue = quarterly_finances.total_revenue + EXCLUDED.total_revenue,
             platform_commission = quarterly_finances.platform_commission + EXCLUDED.platform_commission,
             net_seller_earnings = quarterly_finances.net_seller_earnings + EXCLUDED.net_seller_earnings
             RETURNING *`,
            [seller_id, quarter, year, rev, comm, earn]
        );
        const quarterlyId = quarterly.rows[0].quarterly_finance_id;

        // 5. Half Yearly Finances
        const halfYearly = await db.query(
            `INSERT INTO half_yearly_finances (seller_id, half_number, year, total_revenue, platform_commission, net_seller_earnings)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (seller_id, half_number, year) DO UPDATE SET 
             total_revenue = half_yearly_finances.total_revenue + EXCLUDED.total_revenue,
             platform_commission = half_yearly_finances.platform_commission + EXCLUDED.platform_commission,
             net_seller_earnings = half_yearly_finances.net_seller_earnings + EXCLUDED.net_seller_earnings
             RETURNING *`,
            [seller_id, half, year, rev, comm, earn]
        );
        const halfId = halfYearly.rows[0].half_yearly_finances_id;

        // 6. Annual Finances
        await db.query(
            `INSERT INTO annual_finances (seller_id, year, total_revenue, platform_commission, net_seller_earnings)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (seller_id, year) DO UPDATE SET 
             total_revenue = annual_finances.total_revenue + EXCLUDED.total_revenue,
             platform_commission = annual_finances.platform_commission + EXCLUDED.platform_commission,
             net_seller_earnings = annual_finances.net_seller_earnings + EXCLUDED.net_seller_earnings`,
            [seller_id, year, rev, comm, earn]
        );

        // Update back references (optional but good for schema integrity)
        await db.query("UPDATE daily_finances SET weekly_finance_id = $1, monthly_finance_id = $2 WHERE daily_finance_id = $3", [weeklyId, monthlyId, dailyId]);
        await db.query("UPDATE monthly_finances SET quarterly_finance_id = $1 WHERE monthly_finance_id = $2", [quarterlyId, monthlyId]);
        await db.query("UPDATE quarterly_finances SET half_yearly_finance_id = $1 WHERE quarterly_finance_id = $2", [halfId, quarterlyId]);

    } catch (err) {
        console.error("Error updating finance summaries:", err);
    }
};

/**
 * Get week number for a date
 */
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

/**
 * Record a financial transaction
 */
exports.recordTransaction = async (data) => {
    const { order_id, payment_id, seller_payout_id, transaction_type, amount } = data;
    try {
        const result = await db.query(
            `INSERT INTO finance_transactions (order_id, payment_id, seller_payout_id, transaction_type, amount) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [order_id, payment_id, seller_payout_id, transaction_type, amount]
        );
        
        // Populate aggregate tables
        await updateSummaries(result.rows[0]);
    } catch (err) {
        console.error("Error recording transaction:", err);
    }
};

/**
 * Get Admin Financial Summary (Overall Stats)
 */
exports.getAdminSummary = async (req, res) => {
    try {
        const grossRes = await db.query("SELECT COALESCE(SUM(total_revenue), 0) as total FROM annual_finances");
        const commRes = await db.query("SELECT COALESCE(SUM(platform_commission), 0) as total FROM annual_finances");
        const earnRes = await db.query("SELECT COALESCE(SUM(net_seller_earnings), 0) as total FROM annual_finances");
        
        const payoutRes = await db.query(
            "SELECT COALESCE(SUM(amount), 0) as total FROM finance_transactions WHERE transaction_type = 'Seller Payout'"
        );
        
        const refundRes = await db.query(
            "SELECT COALESCE(SUM(amount), 0) as total FROM finance_transactions WHERE transaction_type = 'Refund'"
        );
        
        const gross = parseFloat(grossRes.rows[0].total);
        const commission = parseFloat(commRes.rows[0].total);
        const payouts = parseFloat(payoutRes.rows[0].total);
        const refunds = parseFloat(refundRes.rows[0].total);

        // Net Profit for platform = Commissions received + any other ad revenue (not implemented yet)
        const netProfit = commission; 

        // Recently recorded transactions
        const recentTxns = await db.query(
            "SELECT ft.*, s.store_name as seller FROM finance_transactions ft " +
            "LEFT JOIN orders o ON ft.order_id = o.order_id " +
            "LEFT JOIN sellers s ON o.seller_id = s.seller_id " +
            "ORDER BY ft.created_at DESC LIMIT 10"
        );

        res.json({
            success: true,
            summary: {
                grossRevenue: gross,
                sellerPayouts: payouts,
                refunds: refunds,
                netProfit: netProfit,
                profitMargin: gross > 0 ? ((netProfit / gross) * 100).toFixed(2) : 0
            },
            recentTransactions: recentTxns.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error fetching admin summary" });
    }
};

/**
 * Get Admin Detailed Summaries for specific period
 */
exports.getAdminSummariesByPeriod = async (req, res) => {
    const { period } = req.params;
    let table = '';
    let orderBy = '';

    switch(period) {
        case 'daily': table = 'daily_finances'; orderBy = 'date DESC'; break;
        case 'weekly': table = 'weekly_finances'; orderBy = 'year DESC, week_number DESC'; break;
        case 'monthly': table = 'monthly_finances'; orderBy = 'year DESC, month_number DESC'; break;
        case 'quarterly': table = 'quarterly_finances'; orderBy = 'year DESC, quarter_number DESC'; break;
        case 'half-yearly': table = 'half_yearly_finances'; orderBy = 'year DESC, half_number DESC'; break;
        case 'annual': table = 'annual_finances'; orderBy = 'year DESC'; break;
        default: return res.status(400).json({ success: false, message: "Invalid period" });
    }

    try {
        const result = await db.query(`SELECT * FROM ${table} ORDER BY ${orderBy} LIMIT 30`);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error fetching summaries" });
    }
};

/**
 * Get Seller Financial Summary
 */
exports.getSellerSummary = async (req, res) => {
    const seller_id = req.user.id;
    try {
        const result = await db.query(`
            SELECT 
                COALESCE(SUM(total_revenue), 0) as total_sales,
                COALESCE(SUM(platform_commission), 0) as total_commission,
                COALESCE(SUM(net_seller_earnings), 0) as total_earnings
            FROM annual_finances 
            WHERE seller_id = $1
        `, [seller_id]);

        const payoutRes = await db.query(`
            SELECT COALESCE(SUM(amount), 0) as total 
            FROM finance_transactions 
            WHERE (transaction_type = 'Seller Payout' OR transaction_type = 'Payout')
            AND (seller_payout_id IN (SELECT payout_id FROM seller_payouts WHERE seller_id = $1))
        `, [seller_id]);

        const sales = parseFloat(result.rows[0].total_sales);
        const earnings = parseFloat(result.rows[0].total_earnings);
        const payouts = parseFloat(payoutRes.rows[0].total);

        res.json({
            success: true,
            summary: {
                totalStoreRevenue: sales,
                totalEarnings: earnings,
                pendingPayout: earnings - payouts
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error fetching seller summary" });
    }
};

/**
 * Get Seller Detailed Summaries for specific period
 */
exports.getSellerSummariesByPeriod = async (req, res) => {
    const seller_id = req.user.id;
    const { period } = req.params;
    let table = '';
    let orderBy = '';

    switch(period) {
        case 'daily': table = 'daily_finances'; orderBy = 'date DESC'; break;
        case 'weekly': table = 'weekly_finances'; orderBy = 'year DESC, week_number DESC'; break;
        case 'monthly': table = 'monthly_finances'; orderBy = 'year DESC, month_number DESC'; break;
        case 'quarterly': table = 'quarterly_finances'; orderBy = 'year DESC, quarter_number DESC'; break;
        case 'half-yearly': table = 'half_yearly_finances'; orderBy = 'year DESC, half_number DESC'; break;
        case 'annual': table = 'annual_finances'; orderBy = 'year DESC'; break;
        default: return res.status(400).json({ success: false, message: "Invalid period" });
    }

    try {
        const result = await db.query(`SELECT * FROM ${table} WHERE seller_id = $1 ORDER BY ${orderBy} LIMIT 30`, [seller_id]);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error fetching seller summaries" });
    }
};

/**
 * Recalculate Finance Summaries from Transactions (Admin Only)
 */
exports.reCalculateFinanceSummaries = async (req, res) => {
    try {
        await db.query('BEGIN');
        
        // 1. Clear existing summaries
        await db.query('TRUNCATE daily_finances, weekly_finances, monthly_finances, quarterly_finances, half_yearly_finances, annual_finances CASCADE');
        
        // 2. Fetch all transactions in chronological order
        const txns = await db.query('SELECT ft.*, o.seller_id as order_seller_id FROM finance_transactions ft LEFT JOIN orders o ON ft.order_id = o.order_id ORDER BY created_at ASC');
        
        // 3. Update summaries for each
        for (const txn of txns.rows) {
            // Ensure seller_id is present
            if (!txn.seller_id) txn.seller_id = txn.order_seller_id;
            await updateSummaries(txn);
        }

        await db.query('COMMIT');
        res.json({ success: true, message: `Successfully recalculated summaries for ${txns.rows.length} transactions.` });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ success: false, message: "Error recalculating finance summaries" });
    }
};

/**
 * Get All Transactions (Admin)
 */
exports.getAllTransactions = async (req, res) => {
    try {
        const result = await db.query(
            "SELECT ft.*, o.order_status, s.store_name FROM finance_transactions ft " +
            "LEFT JOIN orders o ON ft.order_id = o.order_id " +
            "LEFT JOIN order_items oi ON o.order_id = oi.order_id " +
            "LEFT JOIN sellers s ON oi.seller_id = s.seller_id " +
            "ORDER BY ft.created_at DESC"
        );
        res.json({ success: true, transactions: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error fetching transactions" });
    }
};
