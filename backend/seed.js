const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Vitals = require('./models/Vitals');
require('dotenv').config();
const connectDB = require('./config/db');

const seedData = async () => {
  await connectDB();

  try {
    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Vitals.deleteMany({});

    // --- Create Doctor ---
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const doctor = new User({
      name: 'Dr. Smith',
      email: 'doctor@test.com',
      password: hashedPassword,
      role: 'doctor',
    });
    await doctor.save();
    console.log('Doctor created...');

    // --- Fictional Patient Data ---
    const patientsData = [
      { patientId: '12345', name: 'John Doe', age: 45, gender: 'Male' },
      { patientId: '23456', name: 'Jane Smith', age: 68, gender: 'Female' },
      { patientId: '34567', name: 'Robert Brown', age: 55, gender: 'Male' },
      { patientId: '45678', name: 'Emily White', age: 72, gender: 'Female' },
    ];

    // --- Create Patients and their Vitals ---
    for (const patientData of patientsData) {
      // Create user for the patient so userId exists
      const patientUser = new User({
        name: patientData.name,
        email: `patient${patientData.patientId}@test.com`,
        password: hashedPassword,
        role: 'patient'
      });
      await patientUser.save();

      const patient = new Patient({
        ...patientData,
        userId: patientUser._id
      });
      await patient.save();

      const vitals = [];
      for (let i = 0; i < 50; i++) {
        vitals.push({
          patientId: patient._id,
          heartRate: 70 + Math.floor(Math.random() * 20) - 10,
          spo2: 95 + Math.floor(Math.random() * 5) - 2,
          systolicBP: 120 + Math.floor(Math.random() * 30) - 15,
          diastolicBP: 80 + Math.floor(Math.random() * 15) - 7,
          timestamp: new Date(Date.now() - i * 3600 * 1000),
        });
      }
      await Vitals.insertMany(vitals);
      console.log(`Patient ${patient.name} and their vitals have been seeded.`);
    }

    console.log('\nData seeding completed successfully!');
    process.exit();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

seedData();

