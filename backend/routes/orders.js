const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrder,
  updateOrderStatus,
  processPayment,
  deleteOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAllOrders);
router.get('/:id', protect, getOrder);
router.post('/', protect, createOrder);
router.put('/:id', protect, updateOrder);
router.patch('/:id/status', protect, updateOrderStatus);
router.patch('/:id/payment', protect, authorize('admin', 'manager', 'cashier'), processPayment);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteOrder);

module.exports = router;