const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getCurrentUser = async (req, res) => {
  try {
    const { id, role } = req.user;
    let tableName = role === 'admin' ? 'admins' : (role === 'seller' ? 'sellers' : 'customers');
    let idCol = role === 'admin' ? 'admin_id' : (role === 'seller' ? 'seller_id' : 'customer_id');
    
    const result = await db.query(`SELECT * FROM ${tableName} WHERE ${idCol} = $1`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });
    
    const user = result.rows[0];
    const name = role === 'admin' ? user.name : user.full_name;
    
    res.json({ success: true, user: { ...user, name, role } });
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

exports.getUserAddresses = async (req, res) => {
  try {
    const { id } = req.user;
    const result = await db.query(`SELECT * FROM addresses WHERE customer_id = $1 AND deleted_at IS NULL ORDER BY is_default DESC, created_at DESC`, [id]);
    res.json({ success: true, addresses: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.addUserAddress = async (req, res) => {
  try {
    const { id } = req.user;
    const { full_name, phone, address_line_1, address_line_2, city, state, pincode, country, address_type, is_default } = req.body;
    
    // If is_default is true, unset other defaults
    if (is_default) {
      await db.query(`UPDATE addresses SET is_default = FALSE WHERE customer_id = $1`, [id]);
    }

    const result = await db.query(
      `INSERT INTO addresses (customer_id, full_name, phone, address_line_1, address_line_2, city, state, pincode, country, address_type, is_default) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [id, full_name, phone, address_line_1, address_line_2, city, state, pincode, country || 'India', address_type || 'Home', is_default || false]
    );
    
    res.json({ success: true, address: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateUserAddress = async (req, res) => {
  try {
    const { id } = req.user;
    const { address_id } = req.params;
    const { full_name, phone, address_line_1, address_line_2, city, state, pincode, country, address_type, is_default } = req.body;

    if (is_default) {
      await db.query(`UPDATE addresses SET is_default = FALSE WHERE customer_id = $1`, [id]);
    }

    const result = await db.query(
      `UPDATE addresses SET 
       full_name = COALESCE($1, full_name), 
       phone = COALESCE($2, phone), 
       address_line_1 = COALESCE($3, address_line_1), 
       address_line_2 = COALESCE($4, address_line_2), 
       city = COALESCE($5, city), 
       state = COALESCE($6, state), 
       pincode = COALESCE($7, pincode), 
       country = COALESCE($8, country), 
       address_type = COALESCE($9, address_type), 
       is_default = COALESCE($10, is_default),
       updated_at = NOW()
       WHERE address_id = $11 AND customer_id = $12 RETURNING *`,
      [full_name, phone, address_line_1, address_line_2, city, state, pincode, country, address_type, is_default, address_id, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Address not found" });
    
    res.json({ success: true, address: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteUserAddress = async (req, res) => {
  try {
    const { id } = req.user;
    const { address_id } = req.params;
    
    const result = await db.query(
      `UPDATE addresses SET deleted_at = NOW() WHERE address_id = $1 AND customer_id = $2 RETURNING *`,
      [address_id, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Address not found" });
    
    res.json({ success: true, message: "Address deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
