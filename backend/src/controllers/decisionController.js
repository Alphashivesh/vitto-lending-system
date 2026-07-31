const pool = require('../config/pg');
const AuditLog = require('../models/AuditLog');

// Triggers the background job
const evaluateLoanAsync = async(req, res) => {
    try {
        const { loanId } = req.params;

        // 1. Verify loan exists in PostgreSQL
        const loanCheck = await pool.query('SELECT * FROM loan_applications WHERE id = $1', [loanId]);
        if (loanCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Loan application not found.' });
        }

        // 2. Immediately tell the frontend: "Accepted, checking now..."
        res.status(202).json({ message: 'Evaluation started in background.', loanId });

        // 3. Simulate background engine processing
        setTimeout(async() => {
            try {
                const score = Math.floor(Math.random() * (900 - 300 + 1)) + 300;
                const status = score >= 600 ? 'Approved' : 'Rejected';
                const reasons = score < 600 ? ['Low credit score', 'High risk sector'] : ['Good credit history', 'Healthy revenue'];

                const updateQuery = `
                    UPDATE loan_applications
                    SET decision_status = $1, credit_score = $2, reason_codes = $3
                    WHERE id = $4
                    RETURNING *;
                `;
                const updateValues = [status, score, reasons, loanId];
                const updatedResult = await pool.query(updateQuery, updateValues);
                const finalDecision = updatedResult.rows[0];

                if (AuditLog && typeof AuditLog.create === 'function') {
                    await AuditLog.create({
                        action: 'LOAN_EVALUATION_COMPLETED',
                        request_payload: { loanId },
                        response_payload: finalDecision
                    }).catch(err => console.error('MongoDB Audit Error:', err.message));
                }
            } catch (bgError) {
                console.error('Background evaluation error:', bgError);
            }
        }, 5000);

    } catch (error) {
        console.error('Error starting evaluation:', error);
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

// Endpoint for frontend to poll for the result
const getLoanStatus = async(req, res) => {
    try {
        const { loanId } = req.params;
        const query = 'SELECT decision_status, credit_score, reason_codes FROM loan_applications WHERE id = $1';
        const result = await pool.query(query, [loanId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Loan application not found.' });
        }

        return res.status(200).json({ decision: result.rows[0] });
    } catch (error) {
        console.error('Error fetching loan status:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// 👇 THIS IS THE CRITICAL LINE THAT PREVENTS THE CRASH 👇
module.exports = { evaluateLoanAsync, getLoanStatus };