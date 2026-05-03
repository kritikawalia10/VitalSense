const express = require('express');
const router = express.Router();
const { addActivityLog, addDietLog, getLogsByPatient } = require('../controllers/logController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.post('/activity', [auth, role(['patient'])], addActivityLog);
router.post('/diet', [auth, role(['patient'])], addDietLog);
router.get('/:patientId', [auth, role(['doctor', 'patient'])], getLogsByPatient);

module.exports = router;
