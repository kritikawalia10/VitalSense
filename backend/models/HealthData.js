const mongoose = require('mongoose');

const HealthDataSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: false, // Optional for simple simulation without auth
  },
  bp: {
    type: Number,
    required: true,
  },
  heartRate: {
    type: Number,
    required: true,
  },
  oxygen: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('HealthData', HealthDataSchema);
