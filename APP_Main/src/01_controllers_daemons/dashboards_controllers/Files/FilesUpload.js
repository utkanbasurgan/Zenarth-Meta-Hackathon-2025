import React, { useState } from 'react';
import Papa from 'papaparse';
import dataService from '../../../03_datas_daemons/dataService';

const FilesUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    
    files.forEach(file => {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        Papa.parse(file, {
          complete: (result) => {
            if (result.data && result.data.length > 0) {
              const fileData = {
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                uploadDate: new Date().toISOString(),
                headers: result.data[0].map(header => header.trim()),
                data: result.data.slice(1).filter(row => row.some(cell => cell)),
                rowCount: result.data.length - 1,
                fileType: 'csv'
              };
              
              setUploadedFiles(prev => [...prev, fileData]);
              
              // Store in JSON file via data service
              dataService.addUploadedFile(fileData);
            }
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
          },
          skipEmptyLines: true
        });
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.log')) {
        // Handle log files
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          const lines = content.split('\n').filter(line => line.trim());
          
          if (lines.length > 0) {
            // Parse log entries - assuming format like [timestamp] message
            const parsedLines = lines.map(line => {
              const timestampMatch = line.match(/^\[([^\]]+)\]/);
              if (timestampMatch) {
                return [timestampMatch[1], line.replace(/^\[[^\]]+\]\s*/, '')];
              } else {
                return ['', line];
              }
            });
            
            const fileData = {
              id: Date.now() + Math.random(),
              name: file.name,
              size: file.size,
              uploadDate: new Date().toISOString(),
              headers: ['Timestamp', 'Message'],
              data: parsedLines,
              rowCount: parsedLines.length,
              fileType: 'log'
            };
            
            setUploadedFiles(prev => [...prev, fileData]);
            
            // Store in JSON file via data service
            dataService.addUploadedFile(fileData);
          }
        };
        reader.readAsText(file);
      }
    });
    
    setIsUploading(false);
    event.target.value = ''; // Reset file input
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    
    // Remove from JSON file via data service
    dataService.removeUploadedFile(fileId);
  };


  // Load files from data service on component mount
  React.useEffect(() => {
    const storedFiles = dataService.getUploadedFiles();
    setUploadedFiles(storedFiles);
  }, []);

  return (
    <div className="files-upload">
      <div className="section-header">
        <h2>Upload Data Files</h2>
        <p>Upload CSV files and log files to analyze and visualize your data</p>
      </div>

      <div className="upload-section">
        <div className="upload-area">
          <div className="upload-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <h3>Upload Data Files</h3>
          <p>Drag and drop your CSV or log files here or click to browse</p>
          <label htmlFor="csv-upload" className="upload-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            {isUploading ? 'Uploading...' : 'Choose Data Files'}
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv,.txt,.log"
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h3>Uploaded Files ({uploadedFiles.length})</h3>
          <div className="files-list">
            {uploadedFiles.map(file => (
              <div key={file.id} className="file-item">
                <div className="file-info">
                  <div className="file-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </div>
                  <div className="file-details">
                    <h4>{file.name}</h4>
                    <p>{file.rowCount} rows • {file.headers.length} columns • {(file.size / 1024).toFixed(1)} KB</p>
                    <p className="upload-date">Uploaded: {new Date(file.uploadDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="file-actions">
                  <button 
                    className="remove-btn"
                    onClick={() => removeFile(file.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .files-upload {
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
        
        .upload-section {
          margin-bottom: 3rem;
        }
        
        .upload-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          background: white;
          border-radius: 16px;
          border: 2px dashed rgba(31, 30, 122, 0.2);
          text-align: center;
          padding: 3rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }
        
        .upload-area:hover {
          border-color: #1f1e7a;
          background: rgba(31, 30, 122, 0.02);
        }
        
        .upload-icon {
          color: #1f1e7a;
          margin-bottom: 1.5rem;
          opacity: 0.7;
        }
        
        .upload-area h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .upload-area p {
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
        
        .uploaded-files {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        
        .uploaded-files h3 {
          margin: 0;
          padding: 1.5rem 2rem;
          background: rgba(31, 30, 122, 0.05);
          color: #1f1e7a;
          font-size: 1.25rem;
          font-weight: 600;
          border-bottom: 2px solid rgba(31, 30, 122, 0.1);
        }
        
        .files-list {
          padding: 1rem 0;
        }
        
        .file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #eee;
          transition: background 0.2s ease;
        }
        
        .file-item:hover {
          background: rgba(31, 30, 122, 0.02);
        }
        
        .file-item:last-child {
          border-bottom: none;
        }
        
        .file-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }
        
        .file-icon {
          color: #1f1e7a;
          display: flex;
          align-items: center;
        }
        
        .file-details h4 {
          margin: 0 0 0.25rem 0;
          color: #333;
          font-size: 1rem;
          font-weight: 600;
        }
        
        .file-details p {
          margin: 0;
          color: #666;
          font-size: 0.85rem;
        }
        
        .upload-date {
          color: #999 !important;
          font-size: 0.8rem !important;
        }
        
        .file-actions {
          display: flex;
          gap: 0.75rem;
        }
        
        .view-btn, .remove-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .view-btn {
          background: rgba(31, 30, 122, 0.1);
          color: #1f1e7a;
          border: 1px solid rgba(31, 30, 122, 0.2);
        }
        
        .view-btn:hover {
          background: rgba(31, 30, 122, 0.2);
          transform: translateY(-1px);
        }
        
        .remove-btn {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
          border: 1px solid rgba(220, 53, 69, 0.2);
        }
        
        .remove-btn:hover {
          background: rgba(220, 53, 69, 0.2);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default FilesUpload;
