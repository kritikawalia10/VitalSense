const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Patient = require('../models/Patient');
require('dotenv').config();

exports.register = async (req, res) => {
  const { name, email, password, role, age, gender } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      role,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    let finalPatientId = '';
    if (role === 'patient') {
      const { patientId } = req.body;
      
      if (!patientId) {
        return res.status(400).json({ msg: 'Hospital Patient ID is required' });
      }
      
      // Validate numeric
      if (!/^\d+$/.test(patientId)) {
        return res.status(400).json({ msg: 'Patient ID must contain only numbers' });
      }
      
      // Check if patientId already exists
      const existingPatient = await Patient.findOne({ patientId });
      if (existingPatient) {
        return res.status(400).json({ msg: 'Patient ID already exists, please choose another' });
      }
      finalPatientId = patientId;

      const patient = new Patient({
        userId: user._id,
        patientId: finalPatientId,
        name,
        age,
        gender,
      });
      await patient.save();
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token, patientId: role === 'patient' ? finalPatientId : undefined });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { email, password, patientId, name } = req.body;

  try {
    let user;
    // Doctor login
    if (email && password) {
      user = await User.findOne({ email });
      if (!user || user.role !== 'doctor') {
        return res.status(400).json({ msg: 'Invalid credentials or not a doctor' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
    }
    // Patient login
    else if (patientId && name) {
      // Find patient by ID first, then check name case-insensitively
      const patients = await Patient.find({ patientId });
      const patient = patients.find(p => p.name.trim().toLowerCase() === name.trim().toLowerCase());
      
      if (!patient) {
        return res.status(400).json({ msg: 'Invalid Patient ID or Name' });
      }
      user = { id: patient.userId, role: 'patient', name: patient.name };
    } 
    else {
      return res.status(400).json({ msg: 'Please provide credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        if (user.role === 'patient') {
          res.json({ token, patientName: user.name, patientId: patientId, id: user.id, role: 'patient' });
        } else {
          res.json({ token, id: user.id, doctorName: user.name, role: 'doctor' });
        }
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    // In a real app, send an email. Here we'll just return a success message.
    res.json({ msg: 'Password reset link sent to your email' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ msg: 'Password reset successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
