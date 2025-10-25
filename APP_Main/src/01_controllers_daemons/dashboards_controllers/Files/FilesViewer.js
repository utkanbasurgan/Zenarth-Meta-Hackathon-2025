import React, { useState, useEffect } from 'react';

const FilesViewer = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  

  useEffect(() => {
    // Load files from localStorage
    const storedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
    setUploadedFiles(storedFiles);
  }, []);

  const removeFile = (fileId) => {
    const updatedFiles = uploadedFiles.filter(file => file.id !== fileId);
    setUploadedFiles(updatedFiles);
    localStorage.setItem('uploadedFiles', JSON.stringify(updatedFiles));
    
    // Trigger storage event to update other components
    window.dispatchEvent(new Event('storage'));
    
    if (selectedFile && selectedFile.id === fileId) {
      setSelectedFile(null);
    }
  };


  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const runCsvSorter = async () => {
    if (!selectedFile || !csvQuery.trim()) {
      setCsvOutput('Error: Please select a file and enter a query');
      return;
    }

    setCsvLoading(true);
    setCsvOutput(''); // Clear previous output
    
    try {
      const columns = selectedFile.headers.join(', ');
      const sampleRow = selectedFile.data[0] ? selectedFile.data[0].join(', ') : '';
      
      const result = await generateCSVSorterCode({
        columns,
        sampleRow,
        query: csvQuery
      });
      
      setCsvOutput(result);
    } catch (error) {
      console.error('Error running CSV sorter:', error);
      setCsvOutput(`Error: Could not generate CSV sorting code - ${error.message}`);
    } finally {
      setCsvLoading(false);
    }
  };

  const selectFileForSorting = (file) => {
    setSelectedFile(file);
    setShowCsvSorter(true);
    setCsvOutput(''); // Clear previous output
  };

  return (
    <div className="files-viewer">
      <div className="section-header">
        <h2>Uploaded Files</h2>
        <p>Browse and manage your uploaded CSV files</p>
      </div>

      {uploadedFiles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <h3>No Files Uploaded</h3>
          <p>Upload CSV files to get started with data analysis</p>
        </div>
      ) : (
        <div className="files-container">
          <div className="files-list">
            <div className="list-header">
              <h3>All Files ({uploadedFiles.length})</h3>
              <div className="list-actions">
                <span className="total-size">
                  Total: {formatFileSize(uploadedFiles.reduce((sum, file) => sum + file.size, 0))}
                </span>
              </div>
            </div>
            
            <div className="files-grid">
              {uploadedFiles.map(file => (
                <div key={file.id} className="file-card">
                  <div className="file-header">
                    <div className="file-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                    </div>
                    <div className="file-actions">
                      <button 
                        className="action-btn sort-btn"
                        onClick={() => selectFileForSorting(file)}
                        title="Sort this file with AI"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M7 12h10M10 18h4"></path>
                        </svg>
                      </button>
                      <button 
                        className="action-btn remove-btn"
                        onClick={() => removeFile(file.id)}
                        title="Remove file"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="file-content">
                    <h4 className="file-name">{file.name}</h4>
                    <div className="file-stats">
                      <div className="stat">
                        <span className="stat-label">Rows:</span>
                        <span className="stat-value">{file.rowCount}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Columns:</span>
                        <span className="stat-value">{file.headers.length}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Size:</span>
                        <span className="stat-value">{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                    
                    <div className="file-meta">
                      <p className="upload-date">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {formatDate(file.uploadDate)}
                      </p>
                    </div>
                    
                    <div className="file-preview">
                      <div className="preview-header">
                        <span>Columns:</span>
                      </div>
                      <div className="preview-columns">
                        {file.headers.slice(0, 3).map((header, index) => (
                          <span key={index} className="column-tag">
                            {header}
                          </span>
                        ))}
                        {file.headers.length > 3 && (
                          <span className="column-tag more">
                            +{file.headers.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CSV Sorter Section */}
      {showCsvSorter && selectedFile && (
        <div className="csv-sorter-section">
          <div className="csv-sorter-header">
            <h3>AI CSV Sorter</h3>
            <p>Generate Python code to sort and filter your CSV data</p>
            <div className="selected-file-info">
              <strong>Selected File:</strong> {selectedFile.name} ({selectedFile.rowCount} rows, {selectedFile.headers.length} columns)
            </div>
          </div>
          
          <div className="csv-sorter-form">
            <div className="form-group">
              <label htmlFor="csvQuery">Your Natural Language Query:</label>
              <input
                id="csvQuery"
                type="text"
                value={csvQuery}
                onChange={(e) => setCsvQuery(e.target.value)}
                placeholder="e.g., Sort by longest name, Sort by first column, Top 5 by value"
                className="query-input"
              />
              <div className="query-examples">
                <p><strong>Example queries:</strong></p>
                <ul>
                  <li>"Sort by longest name" - sorts by string length</li>
                  <li>"Sort by first column" - sorts by first column</li>
                  <li>"Top 5 by value" - returns top 5 by value column</li>
                  <li>"Sort by date" - sorts by date column</li>
                  <li>"Filter by status active" - filters by status</li>
                </ul>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                onClick={runCsvSorter} 
                disabled={csvLoading || !csvQuery.trim()}
                className="generate-btn"
              >
                {csvLoading ? 'Generating Code...' : 'Generate Sorting Code'}
              </button>
              <button 
                onClick={() => {
                  setShowCsvSorter(false);
                  setSelectedFile(null);
                  setCsvQuery('');
                  setCsvOutput('');
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>

          {csvOutput && (
            <div className="csv-output">
              <h4>Generated Python Code:</h4>
              <pre className="code-output">{csvOutput}</pre>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .files-viewer {
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
        
        .empty-state {
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
        
        .empty-icon {
          color: #1f1e7a;
          margin-bottom: 1.5rem;
          opacity: 0.7;
        }
        
        .empty-state h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .empty-state p {
          margin: 0;
          color: #666;
          font-size: 1rem;
          max-width: 400px;
          line-height: 1.6;
        }
        
        .files-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: rgba(31, 30, 122, 0.05);
          border-bottom: 2px solid rgba(31, 30, 122, 0.1);
        }
        
        .list-header h3 {
          margin: 0;
          color: #1f1e7a;
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .total-size {
          color: #666;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .files-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          padding: 2rem;
        }
        
        .file-card {
          background: white;
          border: 1px solid #eee;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .file-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border-color: rgba(31, 30, 122, 0.2);
        }
        
        .file-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .file-icon {
          color: #1f1e7a;
          display: flex;
          align-items: center;
        }
        
        .file-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .view-btn {
          background: rgba(31, 30, 122, 0.1);
          color: #1f1e7a;
        }
        
        .view-btn:hover {
          background: rgba(31, 30, 122, 0.2);
          transform: scale(1.05);
        }
        
        .sort-btn {
          background: rgba(40, 167, 69, 0.1);
          color: #28a745;
        }
        
        .sort-btn:hover {
          background: rgba(40, 167, 69, 0.2);
          transform: scale(1.05);
        }
        
        .remove-btn {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
        }
        
        .remove-btn:hover {
          background: rgba(220, 53, 69, 0.2);
          transform: scale(1.05);
        }
        
        .file-content {
          margin-bottom: 1.5rem;
        }
        
        .file-name {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.1rem;
          font-weight: 600;
          word-break: break-word;
        }
        
        .file-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .stat {
          text-align: center;
          padding: 0.5rem;
          background: rgba(31, 30, 122, 0.05);
          border-radius: 6px;
        }
        
        .stat-label {
          display: block;
          font-size: 0.75rem;
          color: #666;
          margin-bottom: 0.25rem;
          font-weight: 500;
        }
        
        .stat-value {
          display: block;
          font-size: 0.9rem;
          color: #1f1e7a;
          font-weight: 600;
        }
        
        .file-meta {
          margin-bottom: 1rem;
        }
        
        .upload-date {
          margin: 0;
          color: #999;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .file-preview {
          background: rgba(31, 30, 122, 0.02);
          border-radius: 8px;
          padding: 0.75rem;
        }
        
        .preview-header {
          margin-bottom: 0.5rem;
        }
        
        .preview-header span {
          font-size: 0.8rem;
          color: #666;
          font-weight: 500;
        }
        
        .preview-columns {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .column-tag {
          background: rgba(31, 30, 122, 0.1);
          color: #1f1e7a;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .column-tag.more {
          background: rgba(31, 30, 122, 0.05);
          color: #666;
          font-style: italic;
        }
        
        .file-footer {
          border-top: 1px solid #eee;
          padding-top: 1rem;
        }
        
        .primary-btn {
          width: 100%;
          padding: 0.75rem 1rem;
          background: #1f1e7a;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .primary-btn:hover {
          background: #16155a;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(31, 30, 122, 0.3);
        }
        
        /* CSV Sorter Styles */
        .csv-sorter-section {
          margin-top: 2rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        
        .csv-sorter-header {
          padding: 2rem;
          background: rgba(31, 30, 122, 0.05);
          border-bottom: 2px solid rgba(31, 30, 122, 0.1);
        }
        
        .csv-sorter-header h3 {
          margin: 0 0 0.5rem 0;
          color: #1f1e7a;
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .csv-sorter-header p {
          margin: 0 0 1rem 0;
          color: #666;
          font-size: 1rem;
        }
        
        .selected-file-info {
          padding: 0.75rem 1rem;
          background: rgba(31, 30, 122, 0.1);
          border-radius: 8px;
          color: #1f1e7a;
          font-size: 0.9rem;
        }
        
        .csv-sorter-form {
          padding: 2rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 600;
          font-size: 1rem;
        }
        
        .query-input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        
        .query-input:focus {
          outline: none;
          border-color: #1f1e7a;
          box-shadow: 0 0 0 3px rgba(31, 30, 122, 0.1);
        }
        
        .query-examples {
          margin-top: 0.75rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e1e5e9;
        }
        
        .query-examples p {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .query-examples ul {
          margin: 0;
          padding-left: 1.25rem;
          color: #666;
          font-size: 0.85rem;
          line-height: 1.5;
        }
        
        .query-examples li {
          margin-bottom: 0.25rem;
        }
        
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-start;
        }
        
        .generate-btn {
          padding: 0.875rem 2rem;
          background: #1f1e7a;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .generate-btn:hover:not(:disabled) {
          background: #16155a;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(31, 30, 122, 0.3);
        }
        
        .generate-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }
        
        .cancel-btn {
          padding: 0.875rem 2rem;
          background: transparent;
          color: #666;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .cancel-btn:hover {
          background: #f8f9fa;
          border-color: #ccc;
        }
        
        .csv-output {
          margin-top: 1.5rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e1e5e9;
        }
        
        .csv-output h4 {
          margin: 0 0 1rem 0;
          color: #1f1e7a;
          font-size: 1.1rem;
          font-weight: 600;
        }
        
        .code-output {
          background: #2d3748;
          color: #e2e8f0;
          padding: 1.5rem;
          border-radius: 8px;
          overflow-x: auto;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.9rem;
          line-height: 1.5;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        
        @media (max-width: 768px) {
          .files-grid {
            grid-template-columns: 1fr;
            padding: 1rem;
          }
          
          .file-stats {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .generate-btn, .cancel-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default FilesViewer;
