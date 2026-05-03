const express = require('express');
const router = express.Router();
const { getAllPatients, getPatientById } = require('../controllers/patientController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', [auth, role(['doctor'])], getAllPatients);
router.get('/:id', [auth, role(['doctor'])], getPatientById);

module.exports = router;
