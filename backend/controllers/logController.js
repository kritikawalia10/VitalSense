const ActivityLog = require('../models/ActivityLog');
const DietLog = require('../models/DietLog');

exports.addActivityLog = async (req, res) => {
  const { patientId, activityType, duration } = req.body;
  try {
    const newLog = new ActivityLog({ patientId, activityType, duration });
    await newLog.save();
    res.json(newLog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.addDietLog = async (req, res) => {
  const { patientId, mealType, foodType } = req.body;
  try {
    const newLog = new DietLog({ patientId, mealType, foodType });
    await newLog.save();
    res.json(newLog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getLogsByPatient = async (req, res) => {
  try {
    const activityLogs = await ActivityLog.find({ patientId: req.params.patientId }).sort({ timestamp: -1 });
    const dietLogs = await DietLog.find({ patientId: req.params.patientId }).sort({ timestamp: -1 });
    res.json({ activityLogs, dietLogs });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
