const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getCurrentUser = async (req, res) => {
  try {
    const { id, role } = req.user;
    let tableName = role === 'admin' ? 'admins' : (role === 'seller' ? 'sellers' : 'customers');
    let idCol = role === 'admin' ? 'admin_id' : (role === 'seller' ? 'seller_id' : 'customer_id');
    
    const result = await db.query(`SELECT * FROM ${tableName} WHERE ${idCol} = $1`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });
    
    res.json({ success: true, user: { ...result.rows[0], role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    const { name, full_name, phone, date_of_birth, gender } = req.body;
    
    if (role === 'customer') {
      await db.query(
        `UPDATE customers SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone), 
         date_of_birth = COALESCE($3, date_of_birth), gender = COALESCE($4, gender), updated_at = NOW() 
         WHERE customer_id = $5`,
        [name || full_name, phone, date_of_birth, gender, id]
      );
    } else if (role === 'seller') {
      await db.query(
        `UPDATE sellers SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone), updated_at = NOW() 
         WHERE seller_id = $3`,
        [name || full_name, phone, id]
      );
    }
    
    res.json({ success: true, message: "Profile updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { id, role } = req.user;
    const { currentPassword, newPassword } = req.body;
    
    let tableName = role === 'admin' ? 'admins' : (role === 'seller' ? 'sellers' : 'customers');
    let idCol = role === 'admin' ? 'admin_id' : (role === 'seller' ? 'seller_id' : 'customer_id');

    const userRes = await db.query(`SELECT password_hash FROM ${tableName} WHERE ${idCol} = $1`, [id]);
    const isMatch = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
    if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect current password" });

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query(`UPDATE ${tableName} SET password_hash = $1, updated_at = NOW() WHERE ${idCol} = $2`, [newHash, id]);

    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
