const express = require('express');
const router = express.Router();
const { createBusinessProfile } = require('../controllers/businessController');
const { validateBody } = require('../middlewares/validate');
const { businessSchema } = require('../middlewares/validationSchemas');

router.post('/profile', validateBody(businessSchema), createBusinessProfile);

module.exports = router;