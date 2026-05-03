const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Patient = require('./models/Patient');
const bcrypt = require('bcryptjs');

const testRegister = async () => {
  await connectDB();
  try {
    const email = 'test' + Date.now() + '@test.com';
    const name = 'Test User';
    const password = 'password123';
    const role = 'patient';
    const patientId = '112233';

    const user = new User({ name, email, password, role });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    console.log('User saved:', user._id);

    const patient = new Patient({
      userId: user._id,
      patientId,
      name,
      age: 30,
      gender: 'Male'
    });
    await patient.save();
    console.log('Patient saved:', patient.patientId);

    const check = await Patient.findOne({ patientId });
    console.log('Check findOne:', check ? 'Found' : 'Not Found');
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

testRegister();
