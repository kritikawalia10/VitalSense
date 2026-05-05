const express = require('express');
const router = express.Router();
const { getAllPatients, getPatientData, getAllAlerts } = require('../controllers/doctorController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const User = require('../models/User');
const Message = require('../models/Message');

router.get('/patients', [auth, role(['doctor'])], getAllPatients);
router.get('/patients/:id', [auth, role(['doctor'])], getPatientData);
router.get('/alerts', [auth, role(['doctor'])], getAllAlerts);

// @route   GET /api/doctor/list
// @desc    Get all doctors
router.get('/list', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/doctor/messages
// @desc    Get all messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/doctor/messages
// @desc    Send a message
router.post('/messages', async (req, res) => {
  try {
    const { content, senderId, receiverId } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const newMessage = new Message({ content, senderId, receiverId });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// @route   PUT /api/doctor/messages/read/:senderId
// @desc    Mark messages as read
router.put('/messages/read/:senderId', auth, async (req, res) => {
  try {
    await Message.updateMany(
      { senderId: req.params.senderId, receiverId: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
