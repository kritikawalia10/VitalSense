const Alert = require('../models/Alert');
const Vitals = require('../models/Vitals');

const ALERT_COOLDOWN = 3600 * 1000; // 1 hour

async function createAlert(patientId, type, severity, message) {
  const lastAlert = await Alert.findOne({
    patientId,
    message,
  }).sort({ createdAt: -1 });

  if (lastAlert && (new Date() - lastAlert.createdAt < ALERT_COOLDOWN)) {
    console.log(`Alert cooldown for: ${message}`);
    return;
  }

  const newAlert = new Alert({
    patientId,
    type,
    severity,
    message,
  });
  await newAlert.save();
  console.log(`Alert created: ${message}`);
}

exports.checkVitalsForAlerts = async (vitals) => {
  const { patientId, heartRate, spo2, systolicBP, diastolicBP } = vitals;

  // Instant Alerts
  if (spo2 < 85) {
    await createAlert(patientId, 'instant', 'critical', 'SpO2 level is critically low!');
  }
  if (heartRate < 40 || heartRate > 150) {
    await createAlert(patientId, 'instant', 'critical', 'Heart rate is at a critical level!');
  }

  // Trend Alerts (Example: consistently high BP)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 3600 * 1000);
  const recentVitals = await Vitals.find({
    patientId,
    timestamp: { $gte: twentyFourHoursAgo },
  }).sort({ timestamp: 'desc' });

  if (recentVitals.length >= 24) {
    const highBPSamples = recentVitals.filter(v => v.systolicBP > 140 || v.diastolicBP > 90);
    if (highBPSamples.length / recentVitals.length >= 0.8) { // 80% of readings are high
      await createAlert(patientId, 'trend', 'warning', 'Blood pressure has been consistently high.');
    }
  }
};
