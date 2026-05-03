const express = require('express');
const router = express.Router();
const { getMyData, getMyAlerts } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const Patient = require('../models/Patient');

router.get('/my-data', [auth, role(['patient'])], getMyData);
router.get('/my-alerts', [auth, role(['patient'])], getMyAlerts);

// @route   POST /api/patient/reports
// @desc    Upload a report (Simulated by saving filename)
router.post('/reports', [auth, role(['patient'])], async (req, res) => {
  try {
    const { fileName, fileData } = req.body;
    
    // Find the patient document for the logged-in user
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (!patient.reports) {
      patient.reports = [];
    }

    patient.reports.push({ fileName, fileData });
    await patient.save();

    res.status(201).json({ message: 'Report uploaded successfully', reports: patient.reports });
  } catch (err) {
    console.error('Error uploading report:', err);
    res.status(500).json({ message: 'Server error while uploading report' });
  }
});

module.exports = router;
