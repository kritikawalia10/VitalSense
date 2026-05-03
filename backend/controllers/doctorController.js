const Patient = require('../models/Patient');
const Vitals = require('../models/Vitals');
const Alert = require('../models/Alert');

exports.getAllPatients = async (req, res) => {
    try {
      const patients = await Patient.find().populate('userId', ['name', 'email']);
      res.json(patients);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };
  
  exports.getPatientData = async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id).populate('userId', ['name', 'email']);
      if (!patient) {
        return res.status(404).json({ msg: 'Patient not found' });
      }
  
      const vitals = await Vitals.find({ patientId: req.params.id }).sort({ timestamp: -1 });
      const alerts = await Alert.find({ patientId: req.params.id }).sort({ createdAt: -1 });
  
      res.json({ patient, vitals, alerts });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };
  
  exports.getAllAlerts = async (req, res) => {
    try {
      const alerts = await Alert.find().populate('patientId', ['name']).sort({ createdAt: -1 });
      res.json(alerts);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };
