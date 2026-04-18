const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.get('/', authenticateToken, authorizeRole(['admin', 'seller']), couponController.getAllCoupons);
router.post('/', authenticateToken, authorizeRole(['admin', 'seller']), couponController.createCoupon);
router.post('/validate', authenticateToken, couponController.validateCoupon);
router.delete('/:id', authenticateToken, authorizeRole(['admin', 'seller']), couponController.deleteCoupon);

module.exports = router;
