const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET || "SECRET_KEY";

exports.register = async (req, res) => {
  const { name, email, password, role, phone_no, date_of_birth, gender } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let tableName = "customers";
    let roleName = "customer";

    if (role === "seller") {
      tableName = "sellers";
      roleName = "seller";
    } else if (role === "admin") {
      tableName = "admins";
      roleName = "admin";
    }

    // Check if user exists
    const existing = await db.query(`SELECT email FROM ${tableName} WHERE email = $1`, [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    let result;
    if (roleName === "customer") {
      result = await db.query(
        `INSERT INTO customers (full_name, email, password_hash, phone, date_of_birth, gender) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING customer_id`,
        [name, email, hashedPassword, phone_no, date_of_birth || null, gender || null]
      );
    } else if (roleName === "seller") {
      result = await db.query(
        `INSERT INTO sellers (full_name, email, password_hash, phone) 
         VALUES ($1, $2, $3, $4) RETURNING seller_id`,
        [name, email, hashedPassword, phone_no]
      );
    } else {
      result = await db.query(
        `INSERT INTO admins (name, email, password_hash) 
         VALUES ($1, $2, $3) RETURNING admin_id`,
        [name, email, hashedPassword]
      );
    }

    res.json({ success: true, message: "Registered successfully", id: result.rows[0][Object.keys(result.rows[0])[0]] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const roles = [
      { table: 'admins', role: 'admin', id_col: 'admin_id', name_col: 'name' },
      { table: 'sellers', role: 'seller', id_col: 'seller_id', name_col: 'full_name' },
      { table: 'customers', role: 'customer', id_col: 'customer_id', name_col: 'full_name' }
    ];

    for (const r of roles) {
      const result = await db.query(`SELECT * FROM ${r.table} WHERE email = $1`, [email]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ success: false, message: "Wrong password" });

        const token = jwt.sign(
          { id: user[r.id_col], email: user.email, role: r.role },
          SECRET_KEY,
          { expiresIn: "1d" }
        );

        return res.json({
          success: true,
          role: r.role === 'customer' ? 'user' : r.role,
          token,
          user: { name: user[r.name_col], email: user.email },
          onboardingCompleted: r.role === 'seller' ? user.is_verified : true
        });
      }
    }

    res.status(404).json({ success: false, message: "User not found" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
