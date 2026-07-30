const ResultView = ({ decision }) => {
    const isApproved = decision.status === 'Approved';

    return (
        <div style={{
            padding: '20px',
            border: `2px solid ${isApproved ? '#28a745' : '#dc3545'}`,
            borderRadius: '8px',
            backgroundColor: isApproved ? '#e6ffe6' : '#ffe6e6',
            marginTop: '20px'
        }}>
            <h2 style={{ color: isApproved ? '#28a745' : '#dc3545', marginTop: 0 }}>
                Application {decision.status}!
            </h2>
            
            <div style={{ fontSize: '1.2rem', marginBottom: '15px' }}>
                <strong>Credit Score: </strong> 
                <span>{decision.credit_score}</span>
            </div>

            {decision.reason_codes && decision.reason_codes.length > 0 && (
                <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
                    <strong>Flagged Reasons:</strong>
                    <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px', color: '#dc3545' }}>
                        {decision.reason_codes.map((code, index) => (
                            <li key={index}><code>{code}</code></li>
                        ))}
                    </ul>
                </div>
            )}

            <button 
                onClick={() => window.location.reload()} 
                style={{ 
                    marginTop: '20px', 
                    padding: '10px 15px', 
                    backgroundColor: '#6c757d', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer' 
                }}
            >
                Start New Application
            </button>
        </div>
    );
};

export default ResultView;