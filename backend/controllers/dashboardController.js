const Patient = require('../models/Patient');
const Vitals = require('../models/Vitals');
const Alert = require('../models/Alert');
const ActivityLog = require('../models/ActivityLog');
const DietLog = require('../models/DietLog');

exports.getMyData = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ msg: 'Patient data not found for this user' });
    }

    const vitals = await Vitals.find({ patientId: patient._id }).sort({ timestamp: -1 });
    const activityLogs = await ActivityLog.find({ patientId: patient._id }).sort({ timestamp: -1 });
    const dietLogs = await DietLog.find({ patientId: patient._id }).sort({ timestamp: -1 });

    res.json({ patient, vitals, activityLogs, dietLogs });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getMyAlerts = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ msg: 'Patient data not found for this user' });
    }
    const alerts = await Alert.find({ patientId: patient._id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Returns a dashboard summary tailored for the logged-in patient
exports.getDashboardSummary = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id }).populate('userId', ['name', 'email']);
    if (!patient) {
      return res.status(404).json({ msg: 'Patient data not found for this user' });
    }

    // Recent vitals (last 24 or fewer)
    const vitals = await Vitals.find({ patientId: patient._id }).sort({ timestamp: -1 }).limit(24);

    // Recent alerts
    const alerts = await Alert.find({ patientId: patient._id }).sort({ createdAt: -1 }).limit(10);

    // Simple AI health score heuristic (normalized)
    let aiScore = 90;
    if (vitals.length) {
      const avgHR = vitals.reduce((s, v) => s + (v.heartRate || 0), 0) / vitals.length;
      const avgSystolic = vitals.reduce((s, v) => s + (v.systolicBP || 0), 0) / vitals.length;
      // degrade score for extremes
      if (avgHR > 100 || avgSystolic > 140) aiScore -= 20;
      if (avgHR < 50 || avgSystolic < 90) aiScore -= 10;
    }

    // Next recommended check: prefer stored patient.nextCheck, otherwise heuristic 4 hours
    const nextCheck = patient.nextCheck || new Date(Date.now() + 4 * 3600 * 1000);

    // Assigned doctor fallback: pick any doctor if the patient doesn't have explicit assignment
    const doctorUser = await require('../models/User').findOne({ role: 'doctor' }).select('name email');
    const assignedDoctor = doctorUser ? { name: doctorUser.name, email: doctorUser.email } : { name: 'On-call Doctor', email: '' };

    res.json({ patient, vitals, alerts, aiScore, nextCheck, assignedDoctor });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Manual intervene action by clinician/patient — creates an instant critical alert
exports.intervene = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) return res.status(404).json({ msg: 'Patient not found' });

    const message = req.body.message || 'Manual intervention requested';
    const newAlert = new Alert({ patientId: patient._id, type: 'instant', severity: 'critical', message });
    await newAlert.save();

    res.json({ alert: newAlert });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Schedule next check for patient
exports.scheduleNextCheck = async (req, res) => {
  try {
    const { nextCheck } = req.body; // ISO string or timestamp
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) return res.status(404).json({ msg: 'Patient not found' });

    patient.nextCheck = nextCheck ? new Date(nextCheck) : new Date(Date.now() + 4 * 3600 * 1000);
    await patient.save();

    res.json({ nextCheck: patient.nextCheck });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
