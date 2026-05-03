const mongoose = require('mongoose');

const VitalsSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  heartRate: {
    type: Number,
    required: true,
  },
  spo2: {
    type: Number,
    required: true,
  },
  systolicBP: {
    type: Number,
    required: true,
  },
  diastolicBP: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Vitals', VitalsSchema);
