const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
// const { authenticateUser, authorizeRoles } = require('../middleware/auth'); 
// Assuming auth middleware exists in regular structure

// Admin summarizes
router.get('/admin/summary', financeController.getAdminSummary);
router.get('/admin/summaries/:period', financeController.getAdminSummariesByPeriod);
router.get('/admin/transactions', financeController.getAllTransactions);
router.post('/admin/recalculate-summaries', financeController.reCalculateFinanceSummaries);

// Seller summarizes
router.get('/seller/summary', financeController.getSellerSummary);
router.get('/seller/summaries/:period', financeController.getSellerSummariesByPeriod);

module.exports = router;
