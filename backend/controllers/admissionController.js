const Admission = require('../models/Admission');

exports.createAdmission = async (req, res) => {
  const { patientName, age, gender, department, reason, contactInfo } = req.body;
  try {
    const admission = new Admission({
      patientName,
      age,
      gender,
      department,
      reason,
      contactInfo
    });
    await admission.save();
    res.json({ msg: 'Patient admitted successfully', admission });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ admissionDate: -1 });
    res.json(admissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
