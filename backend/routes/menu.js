const express = require('express');
const router = express.Router();
const {
  getAllMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCategories
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllMenuItems);
router.get('/categories', getCategories);
router.get('/:id', getMenuItem);
router.post('/', protect, authorize('admin', 'manager'), createMenuItem);
router.put('/:id', protect, authorize('admin', 'manager'), updateMenuItem);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteMenuItem);

module.exports = router;