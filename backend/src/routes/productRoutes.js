const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/:productId/reviews', reviewController.getProductReviews);
router.post('/', authenticateToken, authorizeRole(['seller', 'admin']), productController.createProduct);

module.exports = router;
