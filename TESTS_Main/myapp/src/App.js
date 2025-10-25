import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Secondary from './components/Secondary';

function App() {
  return (
    <Router>
      <div className="App">
        <nav style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '10px 20px', 
          borderBottom: '1px solid #dee2e6',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#495057' }}>Multi-Page App</h2>
        </nav>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/secondary" element={<Secondary />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
