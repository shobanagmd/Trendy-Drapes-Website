const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, cartController.getCart);
router.post('/', authenticateToken, cartController.addToCart);
router.put('/:product_id', authenticateToken, cartController.updateQuantity);
router.delete('/:product_id', authenticateToken, cartController.removeFromCart);

module.exports = router;
