const mongoose = require('mongoose');

const AdmissionSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  contactInfo: {
    type: String,
    required: true,
  },
  admissionDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['admitted', 'discharged'],
    default: 'admitted',
  }
});

module.exports = mongoose.model('Admission', AdmissionSchema);
