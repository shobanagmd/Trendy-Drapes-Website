const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, orderController.createOrder);
router.get('/my-orders', authenticateToken, orderController.getCustomerOrders);
router.put('/:id/status', authenticateToken, orderController.updateOrderStatus);

module.exports = router;
