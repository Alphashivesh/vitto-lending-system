const pool = require('../config/pg');
const AuditLog = require('../models/AuditLog');

const applyLoan = async(req, res) => {
    try {
        const { business_id, requested_amount, tenure_months, purpose } = req.body;

        // Verify business exists in PostgreSQL
        const businessCheck = await pool.query('SELECT * FROM businesses WHERE id = $1', [business_id]);
        if (businessCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Business profile not found.' });
        }

        // Insert loan application
        const query = `
            INSERT INTO loan_applications (business_id, requested_amount, tenure_months, purpose, decision_status)
            VALUES ($1, $2, $3, $4, 'Pending')
            RETURNING *;
        `;
        const values = [business_id, requested_amount, tenure_months, purpose];
        const result = await pool.query(query, values);
        const newLoan = result.rows[0];

        // Silent audit log to MongoDB
        // FIXED: Using "request_payload" to match the MongoDB Schema rules!
        await AuditLog.create({
            action: 'LOAN_APPLICATION_SUBMITTED',
            request_payload: req.body,
            response_payload: newLoan
        });

        return res.status(201).json(newLoan);
    } catch (error) {
        console.error('Error applying for loan:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { applyLoan };