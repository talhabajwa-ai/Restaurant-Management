const express = require('express');
const router = express.Router();
const {
  getAllTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus
} = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllTables);
router.get('/:id', getTable);
router.post('/', protect, authorize('admin', 'manager'), createTable);
router.put('/:id', protect, authorize('admin', 'manager'), updateTable);
router.delete('/:id', protect, authorize('admin', 'manager'), deleteTable);
router.patch('/:id/status', protect, updateTableStatus);

module.exports = router;