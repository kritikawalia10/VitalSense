const Alert = require('../models/Alert');

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().populate('patientId', ['name']).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getAlertsByPatient = async (req, res) => {
    try {
      const alerts = await Alert.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
      res.json(alerts);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };
