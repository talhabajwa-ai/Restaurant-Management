const express = require('express');
const router = express.Router();
const {
  getAllStaff,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  addPerformance
} = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getAllStaff);
router.get('/:id', protect, getStaff);
router.post('/', protect, authorize('admin', 'manager'), createStaff);
router.put('/:id', protect, authorize('admin', 'manager'), updateStaff);
router.delete('/:id', protect, authorize('admin'), deleteStaff);
router.post('/:id/performance', protect, authorize('admin', 'manager'), addPerformance);

module.exports = router;