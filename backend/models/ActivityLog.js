const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  activityType: {
    type: String,
    enum: ['Running', 'Walking', 'Workout'],
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
