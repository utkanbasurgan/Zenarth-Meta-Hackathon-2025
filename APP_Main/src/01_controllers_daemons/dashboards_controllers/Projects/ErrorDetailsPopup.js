import React, { useState } from 'react';

const ErrorDetailsPopup = ({ error, onClose }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [selectedLine, setSelectedLine] = useState(null);

  // Dummy code for left panel (Before/Original)
  const originalCode = `import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(\`/api/users/\${userId}\`);
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleUpdate = async (userData) => {
    try {
      const response = await fetch(\`/api/users/\${userId}\`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Update failed');
      }
      
      const updatedUser = await response.json();
      setUser(updatedUser);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <button onClick={() => handleUpdate({...user, name: 'New Name'})}>
        Update Profile
      </button>
    </div>
  );
};

export default UserProfile;`;

  // Dummy code for right panel (After/Fixed)
  const fixedCode = `import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(\`/api/users/\${userId}\`);
      if (!response.ok) {
        throw new Error(\`Failed to fetch user: \${response.status}\`);
      }
      const userData = await response.json();
      
      // Only update state if component is still mounted
      if (isMounted) {
        setUser(userData);
        setError(null);
      }
    } catch (err) {
      if (isMounted) {
        setError(err.message);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [userId, isMounted]);

  useEffect(() => {
    fetchUser();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      setIsMounted(false);
    };
  }, [fetchUser]);

  const handleUpdate = useCallback(async (userData) => {
    if (!isMounted) return;
    
    try {
      const response = await fetch(\`/api/users/\${userId}\`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error(\`Update failed: \${response.status}\`);
      }
      
      const updatedUser = await response.json();
      
      if (isMounted) {
        setUser(updatedUser);
        setError(null);
      }
    } catch (err) {
      if (isMounted) {
        setError(err.message);
      }
    }
  }, [userId, isMounted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  if (loading) return <div className="loading">Loading user profile...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!user) return <div className="not-found">User not found</div>;

  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <button 
        onClick={() => handleUpdate({...user, name: 'New Name'})}
        disabled={!isMounted}
      >
        Update Profile
      </button>
    </div>
  );
};

export default UserProfile;`;

  const renderCodeViewer = (code, title, isLeft = true) => {
    const lines = code.split('\n');
    
    return (
      <div className={`code-panel ${isLeft ? 'left-panel' : 'right-panel'}`}>
        <div className="code-header">
          <div className="file-info">
            <span className="file-icon">📄</span>
            <span className="file-name">{title}</span>
          </div>
          <div className="code-actions">
            <button className="action-btn" title="Copy">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
            <button className="action-btn" title="Format">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </button>
          </div>
        </div>
        <div className="code-content">
          <div className="line-numbers">
            {lines.map((_, index) => (
              <div key={index} className="line-number">
                {index + 1}
              </div>
            ))}
          </div>
          <div className="code-lines">
            {lines.map((line, index) => (
              <div 
                key={index} 
                className={`code-line ${selectedLine === index ? 'selected' : ''}`}
                onClick={() => setSelectedLine(selectedLine === index ? null : index)}
              >
                <span className="line-content">{line || ' '}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!error) return null;

  return (
    <div className="error-popup-overlay" onClick={onClose}>
      <div className="error-popup-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="popup-header">
          <div className="header-left">
            <div className="error-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <div className="error-title">
              <h3>Error Details</h3>
              <span className="error-type">{error.type}</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="popup-tabs">
          <button 
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            Details
          </button>
          <button 
            className={`tab ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            Code Comparison
          </button>
        </div>

        {/* Content */}
        <div className="popup-content">
          {activeTab === 'details' && (
            <div className="details-content">
              <div className="error-info-grid">
                <div className="info-item">
                  <span className="label">Time:</span>
                  <span className="value">{error.time}</span>
                </div>
                <div className="info-item">
                  <span className="label">Type:</span>
                  <span className="value">{error.type}</span>
                </div>
                <div className="info-item">
                  <span className="label">Status:</span>
                  <span className={`value status-${error.category}`}>{error.status}</span>
                </div>
                <div className="info-item">
                  <span className="label">Impact:</span>
                  <span className="value">{error.impact}</span>
                </div>
                <div className="info-item">
                  <span className="label">Resolution Time:</span>
                  <span className="value">{error.resolutionTime}</span>
                </div>
                <div className="info-item">
                  <span className="label">File:</span>
                  <span className="value">UserProfile.js</span>
                </div>
              </div>
              
              <div className="error-description">
                <h4>Description</h4>
                <p>{error.description}</p>
              </div>
              
              <div className="error-details">
                <h4>Technical Details</h4>
                <p>{error.details}</p>
              </div>
              
              <div className="error-solution">
                <h4>Solution Applied</h4>
                <p>{error.solution}</p>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="code-comparison">
              <div className="comparison-header">
                <div className="comparison-title">
                  <h4>Code Comparison</h4>
                  <p>Before vs After the fix</p>
                </div>
                <div className="comparison-actions">
                  <button className="action-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Export
                  </button>
                </div>
              </div>
              
              <div className="code-viewer-container">
                {renderCodeViewer(originalCode, "UserProfile.js (Before)", true)}
                {renderCodeViewer(fixedCode, "UserProfile.js (After)", false)}
              </div>
              
              <div className="comparison-summary">
                <h5>Key Changes:</h5>
                <ul>
                  <li>Added <code>isMounted</code> state to prevent memory leaks</li>
                  <li>Used <code>useCallback</code> for memoized functions</li>
                  <li>Added proper cleanup in <code>useEffect</code></li>
                  <li>Improved error handling with status codes</li>
                  <li>Added loading states and disabled buttons</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .error-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(4px);
        }

        .error-popup-container {
          background: #1e1e1e;
          border-radius: 12px;
          width: 95vw;
          height: 90vh;
          max-width: 1400px;
          max-height: 900px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          border: 1px solid #333;
        }

        .popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: #2d2d2d;
          border-bottom: 1px solid #444;
          border-radius: 12px 12px 0 0;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .error-icon {
          color: #ff6b6b;
          display: flex;
          align-items: center;
        }

        .error-title h3 {
          margin: 0;
          color: #fff;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .error-type {
          color: #888;
          font-size: 0.9rem;
          margin-left: 0.5rem;
        }

        .close-btn {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #444;
          color: #fff;
        }

        .popup-tabs {
          display: flex;
          background: #252526;
          border-bottom: 1px solid #444;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
          border-bottom: 2px solid transparent;
        }

        .tab:hover {
          color: #fff;
          background: #2d2d2d;
        }

        .tab.active {
          color: #007acc;
          border-bottom-color: #007acc;
          background: #1e1e1e;
        }

        .popup-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .details-content {
          padding: 2rem;
          overflow-y: auto;
          color: #fff;
        }

        .error-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-item .label {
          color: #888;
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-item .value {
          color: #fff;
          font-size: 1rem;
          font-weight: 500;
        }

        .status-critical {
          color: #ff6b6b;
        }

        .status-warning {
          color: #ffa726;
        }

        .status-info {
          color: #42a5f5;
        }

        .error-description,
        .error-details,
        .error-solution {
          margin-bottom: 1.5rem;
        }

        .error-description h4,
        .error-details h4,
        .error-solution h4 {
          color: #fff;
          margin: 0 0 0.75rem 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .error-description p,
        .error-details p,
        .error-solution p {
          color: #ccc;
          line-height: 1.6;
          margin: 0;
        }

        .code-comparison {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .comparison-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: #2d2d2d;
          border-bottom: 1px solid #444;
        }

        .comparison-title h4 {
          margin: 0;
          color: #fff;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .comparison-title p {
          margin: 0.25rem 0 0 0;
          color: #888;
          font-size: 0.9rem;
        }

        .comparison-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #007acc;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: #005a9e;
        }

        .code-viewer-container {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .code-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #444;
        }

        .code-panel:last-child {
          border-right: none;
        }

        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: #2d2d2d;
          border-bottom: 1px solid #444;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .file-name {
          color: #fff;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .code-actions {
          display: flex;
          gap: 0.25rem;
        }

        .code-actions .action-btn {
          padding: 0.25rem;
          background: none;
          color: #888;
          border: none;
          cursor: pointer;
          border-radius: 4px;
        }

        .code-actions .action-btn:hover {
          background: #444;
          color: #fff;
        }

        .code-content {
          flex: 1;
          display: flex;
          overflow: hidden;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .line-numbers {
          background: #1e1e1e;
          color: #888;
          padding: 1rem 0.5rem;
          text-align: right;
          user-select: none;
          min-width: 3rem;
          border-right: 1px solid #444;
        }

        .line-number {
          padding: 0 0.5rem;
          height: 1.4em;
          display: flex;
          align-items: center;
        }

        .code-lines {
          flex: 1;
          background: #1e1e1e;
          overflow-y: auto;
          padding: 1rem 0;
        }

        .code-line {
          padding: 0 1rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
          display: flex;
          align-items: center;
          min-height: 1.4em;
        }

        .code-line:hover {
          background: #2d2d2d;
        }

        .code-line.selected {
          background: #264f78;
        }

        .line-content {
          color: #d4d4d4;
          white-space: pre;
        }

        .comparison-summary {
          padding: 1.5rem 2rem;
          background: #2d2d2d;
          border-top: 1px solid #444;
        }

        .comparison-summary h5 {
          margin: 0 0 1rem 0;
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
        }

        .comparison-summary ul {
          margin: 0;
          padding-left: 1.5rem;
          color: #ccc;
        }

        .comparison-summary li {
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }

        .comparison-summary code {
          background: #1e1e1e;
          color: #d4d4d4;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.8rem;
        }

        /* Syntax highlighting for better readability */
        .line-content {
          color: #d4d4d4;
        }

        /* Scrollbar styling */
        .code-lines::-webkit-scrollbar,
        .details-content::-webkit-scrollbar {
          width: 8px;
        }

        .code-lines::-webkit-scrollbar-track,
        .details-content::-webkit-scrollbar-track {
          background: #1e1e1e;
        }

        .code-lines::-webkit-scrollbar-thumb,
        .details-content::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 4px;
        }

        .code-lines::-webkit-scrollbar-thumb:hover,
        .details-content::-webkit-scrollbar-thumb:hover {
          background: #666;
        }
      `}</style>
    </div>
  );
};

export default ErrorDetailsPopup;
