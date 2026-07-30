const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    action: {
        type: String,
        required: true // e.g., 'SUBMIT_PROFILE', 'EVALUATE_LOAN'
    },
    request_payload: {
        type: Object,
        required: true // Stores the raw incoming request body
    },
    response_payload: {
        type: Object // Stores the decision output
    },
    status_code: {
        type: Number // e.g., 200, 400, 500
    }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);