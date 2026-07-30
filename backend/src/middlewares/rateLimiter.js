const rateLimit = require('express-rate-limit');

// Limit each IP to 5 decision requests per 15-minute window
const decisionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many loan evaluation requests from this IP. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { decisionLimiter };