import { useState } from 'react';
import { submitBusinessProfile, submitLoanApplication, evaluateLoan, checkLoanStatus } from '../services/api';
import ResultView from '../components/ResultView';

const ApplicationForm = () => {
    const [formData, setFormData] = useState({
        owner_name: '',
        pan: '',
        business_type: 'Retail',
        monthly_revenue: '',
        requested_amount: '',
        tenure_months: '',
        purpose: ''
    });

    const [status, setStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [decision, setDecision] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const pollStatus = async (loanId) => {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const res = await checkLoanStatus(loanId);
                    const currentStatus = res.decision.decision_status;

                    // Stop polling if the decision is final
                    if (currentStatus === 'Approved' || currentStatus === 'Rejected') {
                        clearInterval(interval);
                        resolve(res.decision);
                    }
                } catch (error) {
                    clearInterval(interval);
                    reject(error);
                }
            }, 2000); // Checks the backend every 2 seconds
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            const businessPayload = {
                owner_name: formData.owner_name,
                pan: formData.pan,
                business_type: formData.business_type,
                monthly_revenue: Number(formData.monthly_revenue)
            };
            
            // 1. Submit Business
            const businessRes = await submitBusinessProfile(businessPayload);

            // 🔥 THE FIX: Stop everything if the backend rejected the request (e.g., duplicate PAN)
            if (!businessRes || !businessRes.data) {
                throw new Error("Business profile could not be created. Is this PAN already in use?");
            }

            // Safely extract business ID
            const businessId = businessRes.data.id || businessRes.data.business_id || businessRes.data.business?.id;

            const loanPayload = {
                business_id: businessId,
                requested_amount: Number(formData.requested_amount),
                tenure_months: Number(formData.tenure_months),
                purpose: formData.purpose
            };

            // 2. Submit Loan
            const loanRes = await submitLoanApplication(loanPayload);

            // 🔥 THE FIX: Stop everything if the loan request failed
            if (!loanRes || !loanRes.data) {
                throw new Error("Loan application could not be saved.");
            }

            const loanId = loanRes.data.id || loanRes.data.loan_id || loanRes.data.loan?.id;
            
            // 3. Trigger the background evaluation
            setStatus('evaluating'); 
            await evaluateLoan(loanId);
            
            // 4. Poll the backend until the job finishes
            const finalDecision = await pollStatus(loanId);
            
            // 5. Update the UI with the final result
            setDecision({
                status: finalDecision.decision_status,
                credit_score: finalDecision.credit_score,
                reason_codes: finalDecision.reason_codes
            });
            setStatus('success');

        } catch (error) {
            console.error('Submission Error:', error);
            setStatus('error');
            // Safely display the error message on the screen so the user knows what happened
            setErrorMessage(error.message || error.response?.data?.error || 'An unexpected network error occurred.');
        }
    };

    if (status === 'success' && decision) {
        return (
            <div className="card">
                <ResultView decision={decision} />
            </div>
        );
    }

    return (
        <div className="card">
            <form onSubmit={handleSubmit}>
                <h3 className="section-title">Business Profile</h3>

                <div className="form-group">
                    <label>Owner Name</label>
                    <input type="text" className="input-field" name="owner_name" required value={formData.owner_name} onChange={handleChange} placeholder="Enter full name" />
                </div>

                <div className="form-group">
                    <label>PAN Number</label>
                    <input type="text" className="input-field" name="pan" required value={formData.pan} onChange={handleChange} placeholder="ABCDE1234F" />
                </div>

                <div className="form-group">
                    <label>Business Type</label>
                    <select className="input-field" name="business_type" value={formData.business_type} onChange={handleChange}>
                        <option value="Retail">Retail</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Services">Services</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Monthly Revenue (₹)</label>
                    <input type="number" className="input-field" name="monthly_revenue" required min="0" value={formData.monthly_revenue} onChange={handleChange} placeholder="0.00" />
                </div>

                <h3 className="section-title" style={{ marginTop: '30px' }}>Loan Details</h3>

                <div className="form-group">
                    <label>Requested Loan Amount (₹)</label>
                    <input type="number" className="input-field" name="requested_amount" required min="1" value={formData.requested_amount} onChange={handleChange} placeholder="0.00" />
                </div>

                <div className="form-group">
                    <label>Tenure (in months)</label>
                    <input type="number" className="input-field" name="tenure_months" required min="1" value={formData.tenure_months} onChange={handleChange} placeholder="e.g. 12" />
                </div>

                <div className="form-group">
                    <label>Purpose of Loan</label>
                    <textarea className="input-field" name="purpose" rows="3" required value={formData.purpose} onChange={handleChange} placeholder="Briefly describe what the funds are for..." />
                </div>

                {status === 'error' && (
                    <div className="error-message">
                        <strong>Error:</strong> {errorMessage}
                    </div>
                )}

                <button type="submit" className="btn-primary" disabled={status === 'loading' || status === 'evaluating'}>
                    {status === 'loading' && 'Submitting Data...'}
                    {status === 'evaluating' && 'Simulating Background Check (Please Wait)...'}
                    {status === 'idle' && status !== 'error' && 'Submit Application'}
                    {status === 'error' && 'Try Again'}
                </button>
            </form>
        </div>
    );
};

export default ApplicationForm;