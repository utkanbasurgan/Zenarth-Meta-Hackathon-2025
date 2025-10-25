import React, { useState } from 'react';
import Papa from 'papaparse';

const Project2 = () => 
{
  const [csvData, setCsvData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [sortedData, setSortedData] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleFileUpload = (event) => 
  {
    const file = event.target.files[0];
    if (file) 
    {
      setFileName(file.name);
      Papa.parse(file, 
      {
        complete: (result) => 
        {
          if (result.data && result.data.length > 0) 
          {
            const cleanHeaders = result.data[0].map(header => header.trim());
            setHeaders(cleanHeaders);
            setCsvData(result.data.slice(1).filter(row => row.some(cell => cell)));
          }
        },
        error: (error) => 
        {
          console.error('Error parsing CSV:', error);
        },
        skipEmptyLines: true
      });
    }
  };

  const handleSortCSV = () => {
    if (!csvData || csvData.length === 0) return;
    
    // Sort by first column in descending order
    const sorted = [...csvData].sort((a, b) => {
      const firstColA = a[0];
      const firstColB = b[0];
      
      // Try to parse as numbers first, then compare as strings
      const numA = parseFloat(firstColA);
      const numB = parseFloat(firstColB);
      
      if (!isNaN(numA) && !isNaN(numB)) {
        return numB - numA; // Descending order for numbers
      }
      
      // String comparison for non-numeric values
      return firstColB.localeCompare(firstColA);
    });
    
    setSortedData(sorted);
    setIsPreviewMode(true);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (chatInput.trim().toLowerCase() === 'send' && csvData) {
      handleSortCSV();
      setChatInput('');
    }
  };

  return (
    <div className="projects-active">
      <div className="section-header">
        <h2>Active Projects</h2>
        <p>Currently ongoing projects that are in progress</p>
      </div>

      {!csvData ? (
        <div className="content-placeholder">
          <div className="placeholder-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h3>Upload CSV File</h3>
          <p>Upload a CSV file to display your active projects data</p>
          <label htmlFor="csv-upload" className="upload-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Choose CSV File
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="table-container">
          <div className="table-header">
            <h3>{fileName}</h3>
            <button onClick={() => { setCsvData(null); setFileName(''); }} className="clear-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Clear
            </button>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {headers.map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(isPreviewMode && sortedData ? sortedData : csvData).map((row, rowIndex) => (
                  <tr key={rowIndex} className={isPreviewMode ? 'preview-row' : ''}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating Chat Input */}
      <div className="floating-chat-container">
        <div className="floating-chat">
          <div className="chat-header">
            <div className="chat-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              CSV Sorter
            </div>
            {isPreviewMode && (
              <div className="preview-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"></path>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
                Preview Mode
              </div>
            )}
          </div>
          <form onSubmit={handleChatSubmit} className="chat-form">
            <div className="chat-input-container">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type 'send' to sort CSV by first column (descending)"
                className="chat-input"
                disabled={!csvData}
              />
              <button 
                type="submit" 
                className="chat-send-button"
                disabled={!csvData || chatInput.trim().toLowerCase() !== 'send'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
            {!csvData && (
              <div className="chat-hint">
                Upload a CSV file to enable sorting
              </div>
            )}
          </form>
        </div>
      </div>

      <style jsx>{`
        .projects-active {
          padding: 2rem;
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          position: relative;
        }
        
        .section-header {
          margin-bottom: 2rem;
        }
        
        .section-header h2 {
          margin: 0 0 0.5rem 0;
          color: #1f1e7a;
          font-size: 2rem;
          font-weight: 700;
        }
        
        .section-header p {
          margin: 0;
          color: #666;
          font-size: 1rem;
        }
        
        .content-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          background: white;
          border-radius: 16px;
          border: 2px dashed rgba(31, 30, 122, 0.2);
          text-align: center;
          padding: 3rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        
        .placeholder-icon {
          color: #1f1e7a;
          margin-bottom: 1.5rem;
          opacity: 0.7;
        }
        
        .content-placeholder h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .content-placeholder p {
          margin: 0 0 2rem 0;
          color: #666;
          font-size: 1rem;
          max-width: 400px;
          line-height: 1.6;
        }
        
        .upload-button {
          padding: 0.875rem 2.5rem;
          background: #1f1e7a;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.625rem;
          box-shadow: 0 4px 12px rgba(31, 30, 122, 0.3);
        }
        
        .upload-button:hover {
          background: #16155a;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(31, 30, 122, 0.4);
        }
        
        .upload-button:active {
          transform: translateY(0);
        }
        
        .table-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: rgba(31, 30, 122, 0.05);
          border-bottom: 2px solid rgba(31, 30, 122, 0.1);
        }
        
        .table-header h3 {
          margin: 0;
          color: #1f1e7a;
          font-size: 1.25rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .clear-button {
          padding: 0.625rem 1.25rem;
          background: white;
          color: #666;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .clear-button:hover {
          background: #f5f5f5;
          border-color: #999;
          color: #333;
          transform: translateY(-1px);
        }
        
        .clear-button:active {
          transform: translateY(0);
        }
        
        .table-wrapper {
          overflow-x: auto;
          max-height: 600px;
          overflow-y: auto;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
        }
        
        .data-table thead {
          background: #1f1e7a;
          color: white;
          position: sticky;
          top: 0;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .data-table th {
          padding: 1rem 1.5rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.95rem;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .data-table tbody tr {
          border-bottom: 1px solid #eee;
          transition: all 0.2s ease;
        }
        
        .data-table tbody tr:hover {
          background: rgba(31, 30, 122, 0.04);
          transform: scale(1.001);
        }
        
        .data-table tbody tr:last-child {
          border-bottom: none;
        }
        
        .data-table td {
          padding: 1rem 1.5rem;
          color: #333;
          font-size: 0.95rem;
          white-space: nowrap;
        }
        
        .table-wrapper::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .table-wrapper::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        .table-wrapper::-webkit-scrollbar-thumb {
          background: #1f1e7a;
          border-radius: 4px;
        }
        
        .table-wrapper::-webkit-scrollbar-thumb:hover {
          background: #16155a;
        }

        /* Floating Chat Styles */
        .floating-chat-container {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
          width: 100%;
          max-width: 400px;
          padding: 0;
        }

        .floating-chat {
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          border: 1px solid rgba(31, 30, 122, 0.1);
          backdrop-filter: blur(10px);
          overflow: hidden;
          transition: all 0.3s ease;
          width: 100%;
          max-width: 100%;
        }

        .floating-chat:hover {
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #1f1e7a 0%, #2a2885 100%);
          color: white;
        }

        .chat-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .preview-badge {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }

        .chat-form {
          padding: 1.5rem;
        }

        .chat-input-container {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .chat-input {
          flex: 1;
          padding: 0.875rem 1.25rem;
          border: 2px solid #e1e5e9;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          background: #fafbfc;
        }

        .chat-input:focus {
          outline: none;
          border-color: #1f1e7a;
          background: white;
          box-shadow: 0 0 0 3px rgba(31, 30, 122, 0.1);
        }

        .chat-input:disabled {
          background: #f5f5f5;
          color: #999;
          cursor: not-allowed;
        }

        .chat-send-button {
          padding: 0.875rem;
          background: #1f1e7a;
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 48px;
          height: 48px;
        }

        .chat-send-button:hover:not(:disabled) {
          background: #16155a;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(31, 30, 122, 0.3);
        }

        .chat-send-button:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .chat-hint {
          margin-top: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(31, 30, 122, 0.05);
          border-radius: 8px;
          color: #666;
          font-size: 0.85rem;
          text-align: center;
          border: 1px dashed rgba(31, 30, 122, 0.2);
        }

        /* Preview Mode Styles */
        .preview-row {
          background: linear-gradient(90deg, rgba(31, 30, 122, 0.05) 0%, rgba(31, 30, 122, 0.02) 100%);
          border-left: 3px solid #1f1e7a;
        }

        .preview-row:hover {
          background: linear-gradient(90deg, rgba(31, 30, 122, 0.08) 0%, rgba(31, 30, 122, 0.04) 100%);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .floating-chat-container {
            bottom: 1rem;
            padding: 0 0.5rem;
          }
          
          .chat-header {
            padding: 0.75rem 1rem;
          }
          
          .chat-form {
            padding: 1rem;
          }
          
          .chat-input {
            font-size: 0.9rem;
            padding: 0.75rem 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Project2;