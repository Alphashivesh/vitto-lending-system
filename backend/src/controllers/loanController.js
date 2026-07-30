const db = require('../config/pg');
const AuditLog = require('../models/AuditLog');

const submitLoanApplication = async(req, res) => {
    try {
        const { business_id, requested_amount, tenure_months, purpose } = req.body;

        // 1. Log the incoming request to MongoDB
        await AuditLog.create({
            action: 'SUBMIT_LOAN_APPLICATION',
            request_payload: req.body
        });

        // 2. Basic Validation 
        if (!business_id || !requested_amount || !tenure_months || !purpose) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        if (requested_amount <= 0 || tenure_months <= 0) {
            return res.status(400).json({ error: 'Amount and tenure must be positive values.' });
        }

        // 3. Insert into PostgreSQL (Defaults to 'Pending' status)
        const query = `
            INSERT INTO loan_applications (business_id, requested_amount, tenure_months, purpose)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [business_id, requested_amount, tenure_months, purpose];

        const result = await db.query(query, values);

        // 4. Send Success Response
        res.status(201).json({
            message: 'Loan application submitted successfully.',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error submitting loan application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { submitLoanApplication };