import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ApplicationForm from './pages/ApplicationForm';
import './index.css'; // Import the new styles!

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="header">
          <h2>Vitto MSME Lending</h2>
          <p>Fast, secure credit decisions for your business</p>
        </header>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ApplicationForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;