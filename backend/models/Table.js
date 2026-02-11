const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: [true, 'Please provide table number'],
    unique: true
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide capacity'],
    min: [1, 'Capacity must be at least 1']
  },
  status: {
    type: String,
    enum: ['Available', 'Reserved', 'Occupied', 'Cleaning'],
    default: 'Available'
  },
  location: {
    type: String,
    enum: ['Indoor', 'Outdoor', 'Balcony', 'Private Room'],
    default: 'Indoor'
  },
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Table', tableSchema);