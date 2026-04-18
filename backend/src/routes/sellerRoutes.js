const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.get('/onboarding-status', authenticateToken, authorizeRole(['seller']), sellerController.getOnboardingStatus);
router.post('/complete-onboarding', authenticateToken, authorizeRole(['seller']), sellerController.completeOnboarding);
router.get('/analytics/top-products', authenticateToken, authorizeRole(['seller']), sellerController.getAnalytics);
router.get('/', authenticateToken, authorizeRole(['admin']), sellerController.getAllSellers);

module.exports = router;
