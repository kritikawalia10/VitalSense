const express = require('express');
const router = express.Router();
const HealthData = require('../models/HealthData');
const { getLatestVitals } = require('../services/wearableSimulator');

// @route   GET /api/health
// @desc    Get latest vitals
router.get('/health', (req, res) => {
  try {
    const latest = getLatestVitals();
    res.json(latest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/history
// @desc    Get all health data records
router.get('/history', async (req, res) => {
  try {
    const history = await HealthData.find().sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/data
// @desc    Add new health data
router.post('/data', async (req, res) => {
  try {
    const { bp, heartRate, oxygen } = req.body;
    
    if (!bp || !heartRate || !oxygen) {
      return res.status(400).json({ message: 'Please provide bp, heartRate, and oxygen' });
    }

    const newData = new HealthData({ bp, heartRate, oxygen });
    const savedData = await newData.save();
    
    res.status(201).json(savedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
