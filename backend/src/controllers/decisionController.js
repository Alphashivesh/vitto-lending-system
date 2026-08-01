const pool = require('../config/pg');
const AuditLog = require('../models/AuditLog');

const evaluateLoanAsync = async(req, res) => {
    try {
        const { loanId } = req.params;

        // 1. Fetch loan AND business details together using a JOIN
        const query = `
            SELECT l.id, l.requested_amount, l.tenure_months, l.purpose,
                   b.monthly_revenue, b.business_type
            FROM loan_applications l
            JOIN businesses b ON l.business_id = b.id
            WHERE l.id = $1
        `;
        const loanCheck = await pool.query(query, [loanId]);

        if (loanCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Loan application not found.' });
        }

        const applicationData = loanCheck.rows[0];

        // 2. Immediately tell frontend: "Accepted, checking now..."
        res.status(202).json({ message: 'Evaluation started in background.', loanId });

        // 3. REALISTIC FINANCIAL DECISION ENGINE
        setTimeout(async() => {
            try {
                const { requested_amount, tenure_months, monthly_revenue } = applicationData;

                let score = 600; // Starting Base Score
                let reasons = [];

                // Calculate estimated Monthly EMI (Assuming roughly 1.5% monthly interest)
                const estimated_emi = (requested_amount / tenure_months) + (requested_amount * 0.015);

                // Calculate Debt-to-Income (DTI) ratio
                const dti_ratio = estimated_emi / monthly_revenue;

                // Rule 1: DTI Ratio Check
                if (dti_ratio > 0.5) {
                    // If EMI takes up more than 50% of their revenue, it's highly risky!
                    score -= 150;
                    reasons.push('High risk: Estimated EMI exceeds 50% of monthly revenue.');
                } else if (dti_ratio < 0.2) {
                    // If EMI is less than 20% of revenue, it's very safe!
                    score += 250;
                    reasons.push('Excellent debt-to-income ratio.');
                } else {
                    score += 50;
                    reasons.push('Healthy revenue to EMI ratio.');
                }

                // Rule 2: Loan Amount vs Annual Revenue Check
                if (requested_amount > (monthly_revenue * 12)) {
                    score -= 100;
                    reasons.push('Requested amount exceeds yearly revenue capacity.');
                }

                // Rule 3: Tenure Stability
                if (tenure_months < 6 && requested_amount > 500000) {
                    score -= 50;
                    reasons.push('Tenure is too short for such a high loan amount.');
                } else if (tenure_months >= 12) {
                    score += 50;
                    reasons.push('Stable, long-term repayment tenure selected.');
                }

                // Ensure score stays within the standard 300 to 900 range
                score = Math.max(300, Math.min(900, Math.floor(score)));

                // Final Decision
                const status = score >= 600 ? 'Approved' : 'Rejected';

                // Update PostgreSQL with the calculated result
                const updateQuery = `
                    UPDATE loan_applications
                    SET decision_status = $1, credit_score = $2, reason_codes = $3
                    WHERE id = $4
                    RETURNING *;
                `;
                const updateValues = [status, score, reasons, loanId];
                const updatedResult = await pool.query(updateQuery, updateValues);
                const finalDecision = updatedResult.rows[0];

                // Audit Log to MongoDB
                if (AuditLog && typeof AuditLog.create === 'function') {
                    await AuditLog.create({
                        action: 'LOAN_EVALUATION_COMPLETED',
                        request_payload: applicationData,
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

module.exports = { evaluateLoanAsync, getLoanStatus };