const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getSalesReport,
  getTopSellingItems,
  getOrderStatusStats,
  getRevenueByCategory
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardStats);
router.get('/sales', protect, authorize('admin', 'manager'), getSalesReport);
router.get('/top-items', protect, authorize('admin', 'manager'), getTopSellingItems);
router.get('/order-status', protect, authorize('admin', 'manager'), getOrderStatusStats);
router.get('/revenue-by-category', protect, authorize('admin', 'manager'), getRevenueByCategory);

module.exports = router;