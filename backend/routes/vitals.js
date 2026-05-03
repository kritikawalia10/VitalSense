const express = require('express');
const router = express.Router();
const { addVitals, getVitalsByPatient } = require('../controllers/vitalsController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.post('/', [auth, role(['doctor', 'patient'])], addVitals);
router.get('/:patientId', [auth, role(['doctor', 'patient'])], getVitalsByPatient);

module.exports = router;
