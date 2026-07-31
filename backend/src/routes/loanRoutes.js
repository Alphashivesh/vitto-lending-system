const express = require('express');
const router = express.Router();
const { applyLoan } = require('../controllers/loanController');
const { validateBody } = require('../middlewares/validate');
const { loanSchema } = require('../middlewares/validationSchemas');

router.post('/apply', validateBody(loanSchema), applyLoan);

module.exports = router;