const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();
const { startSimulation } = require('./services/wearableSimulator');

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => res.send('API is running...'));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/vitals', require('./routes/vitals'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/doctor', require('./routes/doctor'));
app.use('/api/patient', require('./routes/patientDashboard'));

// New VitalSense routes
app.use('/api', require('./routes/health'));
app.use('/api', require('./routes/admission'));
app.use('/api/maps', require('./routes/maps'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  // Start the simulated wearable data generation
  startSimulation();
  console.log('Wearable simulation started.');
});
