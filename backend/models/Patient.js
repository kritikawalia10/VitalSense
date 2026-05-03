const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  patientId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
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
  reports: [
    {
      fileName: { type: String, required: true },
      uploadDate: { type: Date, default: Date.now },
      fileData: { type: String } // Base64 or URL
    }
  ]
});

module.exports = mongoose.model('Patient', PatientSchema);
