const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.sendOtp = async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) return res.status(400).json({ success: false, message: "Mobile number is required" });

  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await db.query(
      "INSERT INTO otp_verifications (contact, otp_hash, purpose, expires_at) VALUES ($1, $2, $3, $4)",
      [mobile, otpHash, 'registration', expiresAt]
    );

    // In dev mode, we return the OTP to the frontend for the on-screen alert
    res.json({ success: true, message: "OTP sent successfully", otp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error sending OTP" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) return res.status(400).json({ success: false, message: "Mobile and OTP are required" });

  try {
    const result = await db.query(
      "SELECT * FROM otp_verifications WHERE contact = $1 AND is_used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [mobile]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const { otp_hash, otp_id } = result.rows[0];
    const isMatch = await bcrypt.compare(otp.toString(), otp_hash);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    await db.query("UPDATE otp_verifications SET is_used = TRUE WHERE otp_id = $1", [otp_id]);

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error verifying OTP" });
  }
};
