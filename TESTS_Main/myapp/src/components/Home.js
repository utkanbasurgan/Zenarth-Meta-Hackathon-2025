import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>🏠 Home Page</h1>
      <p>This is the working home page. Everything functions normally here.</p>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Navigation:</h3>
        <Link 
          to="/secondary" 
          style={{ 
            display: 'inline-block', 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '5px',
            marginRight: '10px'
          }}
        >
          Go to Secondary Page
        </Link>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '5px' }}>
        <h4>✅ Home Page Status:</h4>
        <p>This page works perfectly! No errors here.</p>
      </div>
    </div>
  );
}

export default Home;
