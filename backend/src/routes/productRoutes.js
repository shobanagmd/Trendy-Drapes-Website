const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/:productId/reviews', reviewController.getProductReviews);
router.post('/', authenticateToken, authorizeRole(['seller', 'admin']), upload.array('images', 10), productController.createProduct);

module.exports = router;
