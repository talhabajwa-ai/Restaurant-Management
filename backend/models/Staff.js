const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: String,
    unique: true,
    required: true
  },
  department: {
    type: String,
    enum: ['Kitchen', 'Service', 'Management', 'Cashier', 'Cleaning'],
    required: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  salary: {
    type: Number,
    required: true
  },
  shift: {
    type: String,
    enum: ['Morning', 'Evening', 'Night', 'Full Day'],
    default: 'Full Day'
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  documents: [{
    name: String,
    url: String
  }],
  performance: [{
    date: Date,
    rating: Number,
    comments: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Staff', staffSchema);