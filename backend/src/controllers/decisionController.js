const db = require('../config/pg');
const AuditLog = require('../models/AuditLog');

const evaluateLoan = async(req, res) => {
    try {
        const { loanId } = req.params;

        // 1. Fetch the Loan and associated Business Profile
        const query = `
            SELECT l.*, b.monthly_revenue, b.business_type 
            FROM loan_applications l
            JOIN businesses b ON l.business_id = b.id
            WHERE l.id = $1;
        `;
        const result = await db.query(query, [loanId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Loan application not found.' });
        }

        const loan = result.rows[0];
        const requestedAmount = parseFloat(loan.requested_amount);
        const monthlyRevenue = parseFloat(loan.monthly_revenue);
        const tenure = parseInt(loan.tenure_months);

        // 2. The Mathematical Decision Engine
        let creditScore = 900;
        let reasonCodes = [];

        const emi = requestedAmount / tenure;
        const emiRatio = emi / monthlyRevenue;
        const loanMultiple = requestedAmount / monthlyRevenue;

        // Fraud / Sanity Check
        if (loanMultiple > 50) {
            creditScore = 0;
            reasonCodes.push('DATA_INCONSISTENCY');
        } else {
            // Standard Risk Deductions
            if (emiRatio > 0.4) {
                creditScore -= 150;
                reasonCodes.push('HIGH_EMI_BURDEN');
            }
            if (loanMultiple > 12) {
                creditScore -= 100;
                reasonCodes.push('LOAN_TOO_LARGE');
            }
            if (tenure < 6 || tenure > 60) {
                creditScore -= 50;
                reasonCodes.push('RISKY_TENURE');
            }
        }

        // Determine Final Status
        const decisionStatus = creditScore >= 650 ? 'Approved' : 'Rejected';

        // 3. Update PostgreSQL with the final decision
        const updateQuery = `
            UPDATE loan_applications
            SET decision_status = $1, credit_score = $2, reason_codes = $3
            WHERE id = $4
            RETURNING *;
        `;
        const updateValues = [decisionStatus, creditScore, reasonCodes, loanId];
        const updatedLoan = await db.query(updateQuery, updateValues);

        // 4. Log the output payload to MongoDB Audit Trail
        await AuditLog.create({
            action: 'EVALUATE_LOAN',
            request_payload: { loanId },
            response_payload: updatedLoan.rows[0],
            status_code: 200
        });

        // 5. Send Final Response
        res.status(200).json({
            message: 'Loan evaluated successfully.',
            decision: {
                status: decisionStatus,
                credit_score: creditScore,
                reason_codes: reasonCodes
            }
        });

    } catch (error) {
        console.error('Error evaluating loan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { evaluateLoan };