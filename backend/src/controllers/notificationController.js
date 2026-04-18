const db = require('../config/db');

/**
 * Internal utility to create a notification
 * @param {Object} params - { customer_id, seller_id, order_id, type, message }
 */
exports.createNotification = async (params) => {
  const { customer_id, seller_id, order_id, type, message } = params;
  try {
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 30); // Expires in 30 days

    const res = await db.query(
      `INSERT INTO notifications (customer_id, seller_id, order_id, type, message, expires_at) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [customer_id || null, seller_id || null, order_id || null, type, message, expires_at]
    );
    return res.rows[0];
  } catch (err) {
    console.error("NOTIFICATION ERROR:", err);
    return null;
  }
};

exports.getNotifications = async (req, res) => {
  const user_id = req.user.id;
  const role = req.user.role;

  try {
    let query = `SELECT * FROM notifications WHERE `;
    let params = [user_id];

    if (role === 'customer') {
      query += `customer_id = $1 `;
    } else if (role === 'seller') {
      query += `seller_id = $1 `;
    } else if (role === 'admin') {
      // Admins might want to see all? Or maybe just internal ones?
      // For now, let's say admins see notifications where they are the recipient if applicable
      query += `customer_id = $1 OR seller_id = $1 `;
    }

    query += `ORDER BY created_at DESC LIMIT 50`;

    const result = await db.query(query, params);
    res.json({ success: true, notifications: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching notifications" });
  }
};

exports.markAsRead = async (req, res) => {
  const { notification_id } = req.params;
  const user_id = req.user.id;

  try {
    await db.query(
      `UPDATE notifications SET is_read = TRUE 
       WHERE notification_id = $1 AND (customer_id = $2 OR seller_id = $2)`,
      [notification_id, user_id]
    );
    res.json({ success: true, message: "Notification marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating notification" });
  }
};

exports.markAllAsRead = async (req, res) => {
  const user_id = req.user.id;

  try {
    await db.query(
      `UPDATE notifications SET is_read = TRUE 
       WHERE (customer_id = $1 OR seller_id = $1) AND is_read = FALSE`,
      [user_id]
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating notifications" });
  }
};
