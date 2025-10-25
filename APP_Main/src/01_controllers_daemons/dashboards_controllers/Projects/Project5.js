import React, { useState, useEffect } from 'react';
import './Project5.css';
import ErrorDetailsPopup from './ErrorDetailsPopup';

const Project5 = () => {
  const [selectedError, setSelectedError] = useState(null);
  const [timeUntilNextCheck, setTimeUntilNextCheck] = useState(10);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [logContent, setLogContent] = useState('');
  const [loadingLog, setLoadingLog] = useState(false);

  const handleErrorClick = (error) => {
    setSelectedError(error);
  };

  const closePopup = () => {
    setSelectedError(null);
  };

  const handlePreviewLog = async () => {
    setLoadingLog(true);
    setLogContent('');
    setShowPreviewModal(true);
    
    try {
      // Simulate reading the log file content
      // In a real implementation, you would fetch the file content from the server
      const mockLogContent = `[2024-01-15 10:30:45] INFO: Application started successfully
[2024-01-15 10:30:46] DEBUG: Loading configuration from /etc/app/config.json
[2024-01-15 10:30:47] INFO: Database connection established
[2024-01-15 10:30:48] WARN: High memory usage detected: 85%
[2024-01-15 10:30:49] ERROR: Failed to connect to external API: timeout
[2024-01-15 10:30:50] INFO: Retrying connection in 5 seconds...
[2024-01-15 10:30:55] INFO: External API connection successful
[2024-01-15 10:30:56] DEBUG: Processing user request: GET /api/users
[2024-01-15 10:30:57] INFO: User authentication successful
[2024-01-15 10:30:58] DEBUG: Database query executed: SELECT * FROM users WHERE active = 1
[2024-01-15 10:30:59] INFO: Response sent to client: 200 OK
[2024-01-15 10:31:00] DEBUG: Request processing time: 1.2s
[2024-01-15 10:31:01] WARN: Slow query detected: 2.5s execution time
[2024-01-15 10:31:02] INFO: Cache updated for user data
[2024-01-15 10:31:03] DEBUG: Session created for user ID: 12345
[2024-01-15 10:31:04] INFO: User logged in successfully
[2024-01-15 10:31:05] ERROR: File not found: /uploads/profile_12345.jpg
[2024-01-15 10:31:06] WARN: Using default profile image
[2024-01-15 10:31:07] INFO: Profile page rendered successfully
[2024-01-15 10:31:08] DEBUG: Memory usage: 78% (down from 85%)
[2024-01-15 10:31:09] INFO: Application running normally`;

      setLogContent(mockLogContent);
    } catch (error) {
      setLogContent(`Error reading log file: ${error.message}`);
    } finally {
      setLoadingLog(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilNextCheck(prev => {
        if (prev <= 1) {
          return 10; // Reset to 10 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="project5-container">
      {/* Status Display */}
      <div className="status-section">
        <div className="status-circle">
          <div className="rotating-ring">
            <div className="ring-segment"></div>
            <div className="ring-segment"></div>
            <div className="ring-segment"></div>
            <div className="ring-segment"></div>
          </div>
          <div className="center-icon">
            <div className="health-symbol">✓</div>
          </div>
        </div>
        
        <div className="status-text">
          <h2>There are no errors in system.</h2>
          <div className="checkup-progress">
            <div className="progress-info">
              <span className="progress-label">Next system check in:</span>
              <span className="progress-timer">{timeUntilNextCheck}s</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((10 - timeUntilNextCheck) / 10) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <button 
            className="preview-log-btn"
            onClick={handlePreviewLog}
            disabled={loadingLog}
          >
            {loadingLog ? (
              <>
                <div className="spinner"></div>
                Loading...
              </>
            ) : (
              <>
                <i className="fas fa-eye"></i>
                <span>Preview Log</span>
                <i className="fas fa-file-alt"></i>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Boxes */}
      <div className="error-boxes">
        {/* Handled Errors */}
        <div className="error-box handled">
          <div className="error-header">
            <div className="error-icon">✓</div>
            <div className="error-title">Handled Errors</div>
            <div className="error-count">12</div>
          </div>
          <div className="error-content">
            <div className="error-item" onClick={() => handleErrorClick({
              time: '14:32:15',
              type: 'SYNTAX_ERROR',
              description: 'Missing semicolon in line 247 of main.js',
              status: 'AUTO_FIXED',
              category: 'handled',
              details: 'The AI detected a missing semicolon at the end of line 247 in the main.js file. This was automatically fixed by adding the semicolon. The fix was applied immediately and the code compiled successfully.',
              solution: 'Added semicolon (;) at the end of line 247',
              impact: 'Low - Syntax error prevented compilation',
              resolutionTime: '0.2 seconds'
            })}>
              <div className="error-time">14:32:15</div>
              <div className="error-details">
                <div className="error-type">SYNTAX_ERROR</div>
                <div className="error-description">Missing semicolon in line 247 of main.js</div>
                <div className="error-status">AUTO_FIXED</div>
              </div>
            </div>
            <div className="error-item" onClick={() => handleErrorClick({
              time: '14:28:42',
              type: 'TYPE_ERROR',
              description: 'Undefined variable \'userData\' in component',
              status: 'AUTO_FIXED',
              category: 'handled',
              details: 'The AI identified an undefined variable \'userData\' being used in a React component. The variable was properly declared and initialized with default values.',
              solution: 'Added const userData = {}; declaration with proper initialization',
              impact: 'Medium - Runtime error prevented',
              resolutionTime: '0.5 seconds'
            })}>
              <div className="error-time">14:28:42</div>
              <div className="error-details">
                <div className="error-type">TYPE_ERROR</div>
                <div className="error-description">Undefined variable 'userData' in component</div>
                <div className="error-status">AUTO_FIXED</div>
              </div>
            </div>
            <div className="error-item" onClick={() => handleErrorClick({
              time: '14:25:18',
              type: 'IMPORT_ERROR',
              description: 'Module \'react-router\' not found',
              status: 'AUTO_FIXED',
              category: 'handled',
              details: 'The AI detected a missing dependency for react-router. The package was automatically installed and the import statement was corrected.',
              solution: 'Installed react-router-dom package and updated import statement',
              impact: 'High - Build failure prevented',
              resolutionTime: '2.1 seconds'
            })}>
              <div className="error-time">14:25:18</div>
              <div className="error-details">
                <div className="error-type">IMPORT_ERROR</div>
                <div className="error-description">Module 'react-router' not found</div>
                <div className="error-status">AUTO_FIXED</div>
              </div>
            </div>
            <div className="error-item" onClick={() => handleErrorClick({
              time: '14:22:33',
              type: 'LOGIC_ERROR',
              description: 'Infinite loop in data processing function',
              status: 'AUTO_FIXED',
              category: 'handled',
              details: 'The AI identified an infinite loop in the data processing function caused by incorrect loop conditions. The loop was fixed with proper termination conditions.',
              solution: 'Added proper loop termination condition and break statement',
              impact: 'Critical - Infinite loop prevented',
              resolutionTime: '1.8 seconds'
            })}>
              <div className="error-time">14:22:33</div>
              <div className="error-details">
                <div className="error-type">LOGIC_ERROR</div>
                <div className="error-description">Infinite loop in data processing function</div>
                <div className="error-status">AUTO_FIXED</div>
              </div>
            </div>
            <div className="error-item" onClick={() => handleErrorClick({
              time: '14:19:07',
              type: 'PERFORMANCE_ERROR',
              description: 'Memory leak in event listeners',
              status: 'AUTO_FIXED',
              category: 'handled',
              details: 'The AI detected memory leaks caused by event listeners not being properly cleaned up. The cleanup functions were automatically added.',
              solution: 'Added useEffect cleanup function to remove event listeners',
              impact: 'Medium - Memory leak prevented',
              resolutionTime: '1.2 seconds'
            })}>
              <div className="error-time">14:19:07</div>
              <div className="error-details">
                <div className="error-type">PERFORMANCE_ERROR</div>
                <div className="error-description">Memory leak in event listeners</div>
                <div className="error-status">AUTO_FIXED</div>
              </div>
            </div>
            <div className="error-item" onClick={() => handleErrorClick({
              time: '14:15:51',
              type: 'VALIDATION_ERROR',
              description: 'Invalid email format validation',
              status: 'AUTO_FIXED',
              category: 'handled',
              details: 'The AI identified incorrect email validation regex pattern. The pattern was updated to properly validate email addresses.',
              solution: 'Updated email validation regex pattern',
              impact: 'Low - Form validation improved',
              resolutionTime: '0.3 seconds'
            })}>
              <div className="error-time">14:15:51</div>
              <div className="error-details">
                <div className="error-type">VALIDATION_ERROR</div>
                <div className="error-description">Invalid email format validation</div>
                <div className="error-status">AUTO_FIXED</div>
              </div>
            </div>
            <div className="error-item" onClick={() => handleErrorClick({
              time: '14:12:29',
              type: 'ASYNC_ERROR',
              description: 'Unhandled promise rejection in API call',
              status: 'AUTO_FIXED',
              category: 'handled',
              details: 'The AI detected an unhandled promise rejection in an API call. Proper error handling with try-catch blocks was automatically added.',
              solution: 'Added try-catch block and proper error handling',
              impact: 'Medium - Runtime error prevented',
              resolutionTime: '0.8 seconds'
            })}>
              <div className="error-time">14:12:29</div>
              <div className="error-details">
                <div className="error-type">ASYNC_ERROR</div>
                <div className="error-description">Unhandled promise rejection in API call</div>
                <div className="error-status">AUTO_FIXED</div>
              </div>
            </div>
            <div className="error-item" onClick={() => handleErrorClick({
              time: '14:08:44',
              type: 'RENDER_ERROR',
              description: 'Component render method returning null',
              status: 'AUTO_FIXED',
              category: 'handled',
              details: 'The AI identified a React component render method that was returning null inappropriately. The component was fixed to return proper JSX.',
              solution: 'Fixed component render method to return proper JSX element',
              impact: 'Medium - Component rendering fixed',
              resolutionTime: '0.6 seconds'
            })}>
              <div className="error-time">14:08:44</div>
              <div className="error-details">
                <div className="error-type">RENDER_ERROR</div>
                <div className="error-description">Component render method returning null</div>
                <div className="error-status">AUTO_FIXED</div>
              </div>
            </div>
          </div>
        </div>

        {/* Covered Errors */}
        <div className="error-box covered">
          <div className="error-header">
            <div className="error-icon">⚠</div>
            <div className="error-title">Covered Errors</div>
            <div className="error-count">8</div>
          </div>
          <div className="error-content">
            <div className="error-item">
              <div className="error-time">13:58:22</div>
              <div className="error-details">
                <div className="error-type">DATABASE_ERROR</div>
                <div className="error-description">Connection timeout to main database</div>
                <div className="error-status">MAINTENANCE_MODE</div>
              </div>
            </div>
            <div className="error-item">
              <div className="error-time">13:54:16</div>
              <div className="error-details">
                <div className="error-type">API_ERROR</div>
                <div className="error-description">Third-party service unavailable</div>
                <div className="error-status">MAINTENANCE_MODE</div>
              </div>
            </div>
            <div className="error-item">
              <div className="error-time">13:49:33</div>
              <div className="error-details">
                <div className="error-type">AUTH_ERROR</div>
                <div className="error-description">OAuth provider service down</div>
                <div className="error-status">MAINTENANCE_MODE</div>
              </div>
            </div>
            <div className="error-item">
              <div className="error-time">13:45:07</div>
              <div className="error-details">
                <div className="error-type">FILE_ERROR</div>
                <div className="error-description">File system permissions issue</div>
                <div className="error-status">MAINTENANCE_MODE</div>
              </div>
            </div>
            <div className="error-item">
              <div className="error-time">13:41:18</div>
              <div className="error-details">
                <div className="error-type">NETWORK_ERROR</div>
                <div className="error-description">CDN service temporarily unavailable</div>
                <div className="error-status">MAINTENANCE_MODE</div>
              </div>
            </div>
            <div className="error-item">
              <div className="error-time">13:37:45</div>
              <div className="error-details">
                <div className="error-type">CONFIG_ERROR</div>
                <div className="error-description">Environment variables misconfigured</div>
                <div className="error-status">MAINTENANCE_MODE</div>
              </div>
            </div>
            <div className="error-item">
              <div className="error-time">13:33:12</div>
              <div className="error-details">
                <div className="error-type">DEPENDENCY_ERROR</div>
                <div className="error-description">Package version conflict detected</div>
                <div className="error-status">MAINTENANCE_MODE</div>
              </div>
            </div>
            <div className="error-item">
              <div className="error-time">13:29:28</div>
              <div className="error-details">
                <div className="error-type">RESOURCE_ERROR</div>
                <div className="error-description">Server resources temporarily exhausted</div>
                <div className="error-status">MAINTENANCE_MODE</div>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Errors */}
        <div className="error-box critical">
          <div className="error-header">
            <div className="error-icon">✗</div>
            <div className="error-title">Critical Errors</div>
            <div className="error-count">3</div>
          </div>
          <div className="error-content">
            <div className="error-item">
              <div className="error-time">13:15:42</div>
              <div className="error-details">
                <div className="error-type">SYSTEM_CRASH</div>
                <div className="error-description">Core application process terminated unexpectedly</div>
                <div className="error-status">REQUIRES_MANUAL_INTERVENTION</div>
              </div>
            </div>
            <div className="error-item">
              <div className="error-time">13:08:17</div>
              <div className="error-details">
                <div className="error-type">SECURITY_BREACH</div>
                <div className="error-description">Unauthorized access attempt detected</div>
                <div className="error-status">REQUIRES_MANUAL_INTERVENTION</div>
              </div>
            </div>
            <div className="error-item">
              <div className="error-time">13:02:55</div>
              <div className="error-details">
                <div className="error-type">DATA_CORRUPTION</div>
                <div className="error-description">Critical data integrity violation</div>
                <div className="error-status">REQUIRES_MANUAL_INTERVENTION</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Error Details Popup with VS Code-style double viewer */}
      <ErrorDetailsPopup 
        error={selectedError} 
        onClose={closePopup} 
      />

      {/* Preview Log Modal */}
      {showPreviewModal && (
        <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Log File Preview</h3>
              <p>MAIN_LOG.TXT - Application Log Content</p>
              <button 
                className="modal-close-btn"
                onClick={() => setShowPreviewModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="log-preview-container">
                <div className="log-preview-header">
                  <div className="log-info">
                    <i className="fas fa-file-alt"></i>
                    <span>File: /Users/utkan.basurgan/Main/1. Works Files/2. Gits Works/Zenarth-Meta-Hackathon-2025/TESTS_Main/myapp/src/log.txt</span>
                  </div>
                  <div className="log-stats">
                    <span className="log-stat">
                      <i className="fas fa-clock"></i>
                      Last updated: 2 minutes ago
                    </span>
                    <span className="log-stat">
                      <i className="fas fa-list"></i>
                      {logContent.split('\n').length} lines
                    </span>
                  </div>
                </div>
                
                <div className="code-preview-box">
                  <div className="code-preview-header">
                    <span className="code-label">Log Content</span>
                    <div className="code-actions">
                      <span className="log-badge">MAIN_LOG.TXT</span>
                      <button 
                        className="copy-btn"
                        onClick={() => navigator.clipboard.writeText(logContent)}
                      >
                        <i className="fas fa-copy"></i>
                        Copy
                      </button>
                    </div>
                  </div>
                  
                  {loadingLog ? (
                    <div className="loading-container">
                      <div className="spinner"></div>
                      <span>Loading log content...</span>
                    </div>
                  ) : (
                    <pre className="log-content">{logContent}</pre>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project5;
