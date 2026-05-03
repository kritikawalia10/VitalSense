const Vitals = require('../models/Vitals');
const alertService = require('../services/alertService');

exports.addVitals = async (req, res) => {
  const { patientId, heartRate, spo2, systolicBP, diastolicBP } = req.body;

  try {
    const vitals = new Vitals({
      patientId,
      heartRate,
      spo2,
      systolicBP,
      diastolicBP,
    });

    await vitals.save();

    // Check for alerts
    await alertService.checkVitalsForAlerts(vitals);

    res.json(vitals);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getVitalsByPatient = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    // First, find the patient by their string ID to get their ObjectId
    const Patient = require('../models/Patient');
    const patientDoc = await Patient.findOne({ patientId: req.params.patientId });
    
    if (!patientDoc) {
      return res.status(404).json({ msg: 'Patient not found' });
    }

    const query = { patientId: patientDoc._id };

    if (from && to) {
      query.timestamp = { $gte: new Date(from), $lte: new Date(to) };
    }

    const vitals = await Vitals.find(query).sort({ timestamp: -1 });
    res.json(vitals);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
