const express = require('express');
const router = express.Router();
const { createBusinessProfile } = require('../controllers/businessController');
const { validateBusinessProfile } = require('../middlewares/validate');

// POST /api/business/profile
router.post('/profile', validateBusinessProfile, createBusinessProfile);

module.exports = router;