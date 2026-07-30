import axios from 'axios';

// Point this to your local backend server
const API = axios.create({
    baseURL: 'https://vitto-lending-system-81ee.onrender.com',
});

// 1. Submit Business Profile
export const submitBusinessProfile = async(profileData) => {
    const response = await API.post('/business/profile', profileData);
    return response.data;
};

// 2. Submit Loan Application
export const submitLoanApplication = async(loanData) => {
    const response = await API.post('/loan/apply', loanData);
    return response.data;
};

// 3. Evaluate Loan (Decision Engine)
export const evaluateLoan = async(loanId) => {
    const response = await API.post(`/decision/${loanId}/evaluate`);
    return response.data;
};

// 4. Poll Loan Status
export const checkLoanStatus = async(loanId) => {
    const response = await API.get(`/decision/${loanId}/status`);
    return response.data;
};