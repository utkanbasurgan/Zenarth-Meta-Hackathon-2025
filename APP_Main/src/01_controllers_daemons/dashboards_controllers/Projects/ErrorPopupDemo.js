import React, { useState } from 'react';
import ErrorDetailsPopup from './ErrorDetailsPopup';

const ErrorPopupDemo = () => {
  const [selectedError, setSelectedError] = useState(null);

  const sampleErrors = [
    {
      time: '14:32:15',
      type: 'SYNTAX_ERROR',
      description: 'Missing semicolon in line 247 of main.js',
      status: 'AUTO_FIXED',
      category: 'handled',
      details: 'The AI detected a missing semicolon at the end of line 247 in the main.js file. This was automatically fixed by adding the semicolon. The fix was applied immediately and the code compiled successfully.',
      solution: 'Added semicolon (;) at the end of line 247',
      impact: 'Low - Syntax error prevented compilation',
      resolutionTime: '0.2 seconds'
    },
    {
      time: '14:28:42',
      type: 'TYPE_ERROR',
      description: 'Undefined variable \'userData\' in component',
      status: 'AUTO_FIXED',
      category: 'handled',
      details: 'The AI identified an undefined variable \'userData\' being used in a React component. The variable was properly declared and initialized with default values.',
      solution: 'Added const userData = {}; declaration with proper initialization',
      impact: 'Medium - Runtime error prevented',
      resolutionTime: '0.5 seconds'
    },
    {
      time: '14:25:18',
      type: 'IMPORT_ERROR',
      description: 'Module \'react-router\' not found',
      status: 'AUTO_FIXED',
      category: 'handled',
      details: 'The AI detected a missing dependency for react-router. The package was automatically installed and the import statement was corrected.',
      solution: 'Installed react-router-dom package and updated import statement',
      impact: 'High - Build failure prevented',
      resolutionTime: '2.1 seconds'
    }
  ];

  const handleErrorClick = (error) => {
    setSelectedError(error);
  };

  const closePopup = () => {
    setSelectedError(null);
  };

  return (
    <div style={{ padding: '2rem', background: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', marginBottom: '2rem' }}>Error Details Popup Demo</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Click on any error below to see the enhanced popup with VS Code-style double viewer:
      </p>
      
      <div style={{ display: 'grid', gap: '1rem', maxWidth: '800px' }}>
        {sampleErrors.map((error, index) => (
          <div
            key={index}
            onClick={() => handleErrorClick(error)}
            style={{
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 'bold', color: '#333' }}>{error.type}</span>
              <span style={{ color: '#666', fontSize: '0.9rem' }}>{error.time}</span>
            </div>
            <div style={{ color: '#666', marginBottom: '0.5rem' }}>
              {error.description}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ 
                background: error.category === 'handled' ? '#4CAF50' : '#FF9800',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: '500'
              }}>
                {error.status}
              </span>
              <span style={{ color: '#999', fontSize: '0.8rem' }}>
                Click to view details →
              </span>
            </div>
          </div>
        ))}
      </div>

      <ErrorDetailsPopup 
        error={selectedError} 
        onClose={closePopup} 
      />
    </div>
  );
};

export default ErrorPopupDemo;
