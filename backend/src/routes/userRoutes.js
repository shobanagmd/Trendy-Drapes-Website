const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

router.get('/me', authenticateToken, userController.getCurrentUser);
router.put('/profile', authenticateToken, userController.updateProfile);
router.post('/change-password', authenticateToken, userController.changePassword);

// Address Management
router.get('/addresses', authenticateToken, userController.getUserAddresses);
router.post('/addresses', authenticateToken, userController.addUserAddress);
router.put('/addresses/:address_id', authenticateToken, userController.updateUserAddress);
router.delete('/addresses/:address_id', authenticateToken, userController.deleteUserAddress);

module.exports = router;
