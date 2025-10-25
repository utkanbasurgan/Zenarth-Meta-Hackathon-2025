import React from 'react';

const FilesPage = () => {
  return (
    <div className="files-page">
      <div className="section-header">
        <h2>Files Management</h2>
        <p>Upload and manage your CSV files</p>
      </div>

      <div className="files-grid">
        <div className="file-card">
          <div className="file-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h3>Upload CSV Files</h3>
          <p>Upload CSV files to analyze and visualize your data</p>
          <button className="action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload Files
          </button>
        </div>

        <div className="file-card">
          <div className="file-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h3>View Uploaded Files</h3>
          <p>Browse and manage your uploaded CSV files</p>
          <button className="action-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            View Files
          </button>
        </div>
      </div>

      <style jsx>{`
        .files-page {
          padding: 2rem;
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
        
        .files-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .file-card {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          text-align: center;
          transition: transform 0.3s ease;
        }
        
        .file-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }
        
        .file-icon {
          color: #1f1e7a;
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: center;
        }
        
        .file-card h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .file-card p {
          margin: 0 0 2rem 0;
          color: #666;
          font-size: 0.95rem;
          line-height: 1.6;
        }
        
        .action-btn {
          padding: 0.875rem 2rem;
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
        
        .action-btn:hover {
          background: #16155a;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(31, 30, 122, 0.4);
        }
        
        .action-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default FilesPage;
