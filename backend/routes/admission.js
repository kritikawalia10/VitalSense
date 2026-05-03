const express = require('express');
const router = express.Router();
const { createAdmission, getAdmissions } = require('../controllers/admissionController');

router.post('/admissions', createAdmission);
router.get('/admissions', getAdmissions);

module.exports = router;
