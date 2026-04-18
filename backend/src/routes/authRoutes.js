const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/debug', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
