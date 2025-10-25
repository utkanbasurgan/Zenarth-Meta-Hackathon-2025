import React from 'react';
import { callAI } from '../../../02_softwares_daemons/aiService';

const Project4 = () => {
  const [errorFixed, setErrorFixed] = React.useState(false);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiFixedCommand, setAiFixedCommand] = React.useState('');
  const [aiExplanation, setAiExplanation] = React.useState('');
  const [showAiFix, setShowAiFix] = React.useState(false);
  const [originalOutput, setOriginalOutput] = React.useState('');
  const [fixedOutput, setFixedOutput] = React.useState('');
  const [runningOriginal, setRunningOriginal] = React.useState(false);
  const [runningFixed, setRunningFixed] = React.useState(false);
  const [showHandledErrorsModal, setShowHandledErrorsModal] = React.useState(false);

  const errorLog = `Error: Minified React error #31; visit https://reactjs.org/docs/error-decoder.html?invariant=31
    at Object.invariant (react-dom.production.min.js:140:15)
    at Object.findDOMNode (react-dom.production.min.js:57:15)
    at MyComponent.componentDidMount (MyComponent.js:23:12)
    at commitLifeCycles (react-dom.production.min.js:206:15)
    at commitAllLifeCycles (react-dom.production.min.js:225:15)
    at HTMLUnknownElement.callCallback (react-dom.production.min.js:149:15)
    at Object.invokeGuardedCallbackDev (react-dom.production.min.js:149:15)
    at invokeGuardedCallback (react-dom.production.min.js:149:15)
    at commitRoot (react-dom.production.min.js:225:15)
    at performWorkOnRoot (react-dom.production.min.js:225:15)
    at performWork (react-dom.production.min.js:225:15)
    at performSyncWork (react-dom.production.min.js:225:15)
    at requestWork (react-dom.production.min.js:225:15)
    at scheduleWork (react-dom.production.min.js:225:15)
    at Object.enqueueSetState (react-dom.production.min.js:149:15)
    at MyComponent.setState (MyComponent.js:45:8)

Console Error:
Uncaught TypeError: Cannot read property 'map' of undefined
    at UserList.render (UserList.js:12:15)
    at ReactDOM.render (react-dom.development.js:18849:15)
    at Object.<anonymous> (index.js:7:5)

Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application.
    at UserProfile (UserProfile.js:34:8)
    at div
    at App (App.js:15:8)

Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.
    at createFiberFromTypeAndProps (react-dom.development.js:25058:15)
    at createFiberFromElement (react-dom.development.js:25058:15)
    at App (App.js:8:8)`;

  const handleQuickFix = async () => {
    setAiLoading(true);
    setShowAiFix(false);
    
    try {
      const prompt = `You are a React development expert and Linux system administrator. I have a React application error log with common React errors. Please analyze the error log and create a find command that will locate all log files containing similar React errors.

Error Log:
${errorLog}

Create a find command that will:
1. Search in common log directories (/var/log, /opt/logs, /home/*/logs, /var/www/*/logs)
2. Find all .log files
3. Search for files containing "React error", "TypeError", "Cannot read property", or "Element type is invalid" text
4. Limit results to first 10 files

Return ONLY the find command. Do not include any explanations, comments, or additional text. Just the command.`;

      const aiResponse = await callAI(prompt);
      
      const fixedCommand = aiResponse.trim();
      const explanation = 'AI has analyzed the React application error log and created a find command to locate all log files containing React errors like "TypeError", "Cannot read property", and "Element type is invalid".';
      
      setAiFixedCommand(fixedCommand);
      setAiExplanation(explanation);
      setShowAiFix(true);
      setErrorFixed(true);
    } catch (error) {
      console.error('AI fix failed:', error);
      // Fallback to simple fix
      setAiFixedCommand(`find /var/log /opt/logs /home/*/logs /var/www/*/logs -name "*.log" -exec grep -l "React error\\|TypeError\\|Cannot read property\\|Element type is invalid" {} \\; | head -10`);
      setAiExplanation('AI created a find command to search for React errors in log files across common system directories.');
      setShowAiFix(true);
      setErrorFixed(true);
    } finally {
      setAiLoading(false);
    }
  };

  const runOriginalCommand = () => {
    setRunningOriginal(true);
    setOriginalOutput('');
    
    try {
      // Simulate showing the error log analysis
      setOriginalOutput(`Error Log Analysis:
- React minified error #31 (findDOMNode issue)
- TypeError: Cannot read property 'map' of undefined
- Memory leak warning: state update on unmounted component
- Element type is invalid (import/export issue)
- Need to locate all log files with similar React errors`);
    } catch (error) {
      setOriginalOutput(`Error: ${error.message}`);
    } finally {
      setRunningOriginal(false);
    }
  };

  const runFixedCommand = () => {
    setRunningFixed(true);
    setFixedOutput('');
    
    try {
      // Simulate successful command execution
      setFixedOutput(`/var/log/nginx/error.log
/opt/logs/react-app.log
/home/user/logs/frontend.log
/var/www/myapp/logs/error.log
/opt/logs/webapp.log
/home/user/logs/component.log
/var/log/apache2/error.log
/opt/logs/ui.log
/home/user/logs/state.log
/var/www/react-app/logs/debug.log

Command executed successfully - found 10 log files containing React errors`);
    } catch (error) {
      setFixedOutput(`Error: ${error.message}`);
    } finally {
      setRunningFixed(false);
    }
  };


  return (
    <div className="projects-completed">
      <div className="section-header">
        <h2>React Error Log Analysis Challenge</h2>
        <p>Analyze the React error log, use AI to create a find command, then test the generated command</p>
      </div>

      <div className="handled-errors-section">
        <button 
          className="handled-errors-btn"
          onClick={() => setShowHandledErrorsModal(true)}
        >
          <i className="fas fa-code-compare"></i>
          <span>Handled Errors</span>
          <i className="fas fa-external-link-alt"></i>
        </button>
      </div>

      <div className="error-container">
        <div className="error-header">
          <i className="fas fa-exclamation-triangle"></i>
          <span>React Error Log</span>
        </div>
        <pre className="error-log">{errorLog}</pre>
      </div>

      <div className="action-container">
        <button 
          className={`quick-fix-btn ${errorFixed ? 'fixed' : ''} ${aiLoading ? 'loading' : ''}`}
          onClick={handleQuickFix}
          disabled={errorFixed || aiLoading}
        >
          {aiLoading ? (
            <>
              <div className="spinner"></div>
              AI Analyzing...
            </>
          ) : errorFixed ? (
            <>
              <i className="fas fa-check-circle"></i>
              AI Fixed!
            </>
          ) : (
            <>
              <i className="fas fa-robot"></i>
              AI Quick Fix
            </>
          )}
        </button>
        
        {showAiFix && aiFixedCommand && (
          <div className="ai-fix-container">
            <div className="ai-fix-header">
              <i className="fas fa-robot"></i>
              <span>AI-Generated Fix</span>
            </div>
            <div className="ai-fixed-code-container">
              <div className="code-header">
                <span className="code-label">Generated Command</span>
                <div className="code-actions">
                  <span className="ai-badge">AI Generated</span>
                  <button 
                    className="run-btn fixed-run-btn"
                    onClick={runFixedCommand}
                    disabled={runningFixed}
                  >
                    {runningFixed ? (
                      <>
                        <div className="spinner"></div>
                        Running...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-play"></i>
                        Run Generated Command
                      </>
                    )}
                  </button>
                </div>
              </div>
              <pre className="code-block ai-fixed-code">{aiFixedCommand}</pre>
              {fixedOutput && (
                <div className="output-container fixed-output">
                  <div className="output-header">
                    <i className="fas fa-check-circle"></i>
                    <span>Generated Command Output</span>
                  </div>
                  <pre className="output-text">{fixedOutput}</pre>
                </div>
              )}
            </div>
            <div className="ai-explanation">
              <strong>AI Explanation:</strong> {aiExplanation}
            </div>
          </div>
        )}
      </div>

      {/* Handled Errors Modal */}
      {showHandledErrorsModal && (
        <div className="modal-overlay" onClick={() => setShowHandledErrorsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Handled Errors</h3>
              <p>Compare original error log with AI-generated fix</p>
              <button 
                className="modal-close-btn"
                onClick={() => setShowHandledErrorsModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              {/* Error Details Section */}
              <div className="error-details-section">
                <div className="error-details-header">
                  <h4>Error Analysis</h4>
                  <div className="error-stats">
                    <div className="error-stat">
                      <span className="stat-label">Errors Found:</span>
                      <span className="stat-value">4</span>
                    </div>
                    <div className="error-stat">
                      <span className="stat-label">Severity:</span>
                      <span className="stat-value high">High</span>
                    </div>
                    <div className="error-stat">
                      <span className="stat-label">Status:</span>
                      <span className="stat-value">Active</span>
                    </div>
                  </div>
                </div>
                
                <div className="error-summary">
                  <div className="error-item">
                    <i className="fas fa-exclamation-triangle error-icon"></i>
                    <div className="error-info">
                      <strong>React Error #31</strong>
                      <p>findDOMNode issue in component lifecycle</p>
                    </div>
                  </div>
                  <div className="error-item">
                    <i className="fas fa-bug error-icon"></i>
                    <div className="error-info">
                      <strong>TypeError: Cannot read property 'map'</strong>
                      <p>Undefined array access in UserList component</p>
                    </div>
                  </div>
                  <div className="error-item">
                    <i className="fas fa-memory error-icon"></i>
                    <div className="error-info">
                      <strong>Memory Leak Warning</strong>
                      <p>State update on unmounted component</p>
                    </div>
                  </div>
                  <div className="error-item">
                    <i className="fas fa-code error-icon"></i>
                    <div className="error-info">
                      <strong>Element type is invalid</strong>
                      <p>Import/export issue with component definition</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dual Code Viewers Section */}
              <div className="dual-code-viewer">
                <div className="code-viewer-left">
                  <div className="code-header">
                    <span className="code-label">Original Error Log</span>
                    <div className="code-actions">
                      <span className="error-badge">React Errors</span>
                      <button 
                        className="run-btn"
                        onClick={runOriginalCommand}
                        disabled={runningOriginal}
                      >
                        {runningOriginal ? (
                          <>
                            <div className="spinner"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-play"></i>
                            Analyze Log
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <pre className="code-block">{errorLog}</pre>
                  {originalOutput && (
                    <div className="output-container">
                      <div className="output-header">
                        <i className="fas fa-terminal"></i>
                        <span>Analysis Output</span>
                      </div>
                      <pre className="output-text">{originalOutput}</pre>
                    </div>
                  )}
                </div>

                <div className="code-viewer-right">
                  <div className="code-header">
                    <span className="code-label">AI-Generated Fix</span>
                    <div className="code-actions">
                      <span className="ai-badge">AI Generated</span>
                      {aiFixedCommand && (
                        <button 
                          className="run-btn fixed-run-btn"
                          onClick={runFixedCommand}
                          disabled={runningFixed}
                        >
                          {runningFixed ? (
                            <>
                              <div className="spinner"></div>
                              Running...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-play"></i>
                              Run Fix
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  {aiFixedCommand ? (
                    <pre className="code-block ai-fixed-code">{aiFixedCommand}</pre>
                  ) : (
                    <div className="placeholder-code">
                      <div className="placeholder-content">
                        <i className="fas fa-robot"></i>
                        <p>AI fix will appear here after clicking "AI Quick Fix"</p>
                      </div>
                    </div>
                  )}
                  {fixedOutput && (
                    <div className="output-container fixed-output">
                      <div className="output-header">
                        <i className="fas fa-check-circle"></i>
                        <span>Fix Output</span>
                      </div>
                      <pre className="output-text">{fixedOutput}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      <style jsx>{`
        .projects-completed {
          padding: 2rem;
          max-width: 1000px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .section-header {
          margin-bottom: 2rem;
        }

        .section-header h2 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.75rem;
          font-weight: 700;
        }

        .section-header p {
          margin: 0;
          color: #666;
          font-size: 1rem;
        }

        .handled-errors-section {
          margin-bottom: 2rem;
          display: flex;
          justify-content: center;
        }

        .handled-errors-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #1f1e7a 0%, #3b82f6 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(31, 30, 122, 0.3);
        }

        .handled-errors-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(31, 30, 122, 0.4);
        }

        .handled-errors-btn i:first-child {
          font-size: 1.25rem;
        }

        .handled-errors-btn i:last-child {
          font-size: 0.875rem;
          opacity: 0.8;
        }


        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 95vw;
          max-height: 95vh;
          width: 100%;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }

        .modal-header {
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #1f1e7a 0%, #3b82f6 100%);
          color: white;
          position: relative;
        }

        .modal-header h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .modal-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 0.875rem;
        }

        .modal-close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .error-details-section {
          padding: 2rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .error-details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .error-details-header h4 {
          margin: 0;
          color: #1f1e7a;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .error-stats {
          display: flex;
          gap: 2rem;
        }

        .error-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #666;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f1e7a;
        }

        .stat-value.high {
          color: #dc2626;
        }

        .error-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .error-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }

        .error-item:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .error-icon {
          font-size: 1.25rem;
          color: #dc2626;
          margin-top: 0.25rem;
        }

        .error-info strong {
          display: block;
          color: #1f1e7a;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .error-info p {
          margin: 0;
          color: #666;
          font-size: 0.8rem;
          line-height: 1.4;
        }

        .dual-code-viewer {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          padding: 2rem;
          background: white;
          min-height: 500px;
        }

        .code-viewer-left,
        .code-viewer-right {
          background: #1e1e1e;
          border-radius: 8px;
          overflow: hidden;
          min-height: 400px;
          display: flex;
          flex-direction: column;
        }

        .code-viewer-left .code-block,
        .code-viewer-right .code-block {
          flex: 1;
          overflow-y: auto;
        }

        .code-container {
          margin-bottom: 1.5rem;
          background: #1e1e1e;
          border-radius: 8px;
          overflow: hidden;
        }

        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: #2d2d2d;
          border-bottom: 1px solid #3d3d3d;
        }

        .code-label {
          color: #fff;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .error-badge {
          background: #ff4444;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .code-block {
          margin: 0;
          padding: 1.5rem;
          color: #d4d4d4;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 0.875rem;
          line-height: 1.6;
          overflow-x: auto;
        }

        .error-container {
          margin-bottom: 1.5rem;
          background: #fff5f5;
          border: 2px solid #ff4444;
          border-radius: 8px;
          overflow: hidden;
        }

        .error-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #ffe5e5;
          color: #c00;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .error-log {
          margin: 0;
          padding: 1.5rem;
          color: #c00;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 0.875rem;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .action-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .quick-fix-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 2rem;
          background: #1f1e7a;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .quick-fix-btn:hover:not(:disabled) {
          background: #16155a;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(31, 30, 122, 0.3);
        }

        .quick-fix-btn:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .quick-fix-btn.fixed {
          background: #22c55e;
        }

        .quick-fix-btn.loading {
          background: #6b7280;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .ai-fix-container {
          margin-top: 2rem;
          background: #f8fafc;
          border: 2px solid #1f1e7a;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(31, 30, 122, 0.1);
          width: 100%;
          max-width: 100%;
        }

        .ai-fix-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #1f1e7a 0%, #3b82f6 100%);
          color: white;
          font-weight: 600;
          font-size: 1rem;
        }

        .ai-fixed-code-container {
          background: #1e1e1e;
          border-radius: 0;
          overflow: hidden;
          width: 100%;
          max-width: 100%;
        }

        .ai-badge {
          background: linear-gradient(135deg, #1f1e7a 0%, #3b82f6 100%);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .ai-fixed-code {
          margin: 0;
          padding: 1.5rem;
          color: #d4d4d4;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 0.875rem;
          line-height: 1.6;
          overflow-x: auto;
          background: #1e1e1e;
          white-space: pre-wrap;
          word-wrap: break-word;
          max-width: 100%;
        }

        .ai-explanation {
          padding: 1.5rem;
          background: #f0f9ff;
          border-top: 1px solid #e0f2fe;
          color: #0c4a6e;
          line-height: 1.6;
        }

        .ai-explanation strong {
          color: #1f1e7a;
          font-weight: 600;
        }

        .code-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .run-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #22c55e;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .run-btn:hover:not(:disabled) {
          background: #16a34a;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }

        .run-btn:disabled {
          cursor: not-allowed;
          opacity: 0.7;
          background: #6b7280;
        }

        .fixed-run-btn {
          background: #3b82f6;
        }

        .fixed-run-btn:hover:not(:disabled) {
          background: #2563eb;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .output-container {
          margin-top: 1rem;
          background: #1e1e1e;
          border-radius: 0 0 8px 8px;
          overflow: hidden;
        }

        .output-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #2d2d2d;
          color: #fff;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .output-text {
          margin: 0;
          padding: 1rem 1.5rem;
          color: #d4d4d4;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 0.875rem;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .fixed-output {
          background: #f0f9ff;
          border: 1px solid #e0f2fe;
        }

        .fixed-output .output-header {
          background: #0ea5e9;
          color: white;
        }

        .fixed-output .output-text {
          color: #0c4a6e;
          background: #f0f9ff;
        }

        .placeholder-code {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          background: #2d2d2d;
        }

        .placeholder-content {
          text-align: center;
          color: #888;
        }

        .placeholder-content i {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #1f1e7a;
        }

        .placeholder-content p {
          margin: 0;
          font-size: 0.875rem;
          line-height: 1.4;
        }


        @media (max-width: 768px) {
          .projects-completed {
            padding: 1rem;
          }
          
          .modal-overlay {
            padding: 1rem;
          }
          
          .modal-content {
            max-width: 100vw;
            max-height: 100vh;
            border-radius: 8px;
          }
          
          .modal-header {
            padding: 1rem 1.5rem;
          }
          
          .modal-header h3 {
            font-size: 1.25rem;
          }
          
          .error-details-section {
            padding: 1rem;
          }
          
          .error-details-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .error-stats {
            gap: 1rem;
          }
          
          .error-summary {
            grid-template-columns: 1fr;
          }
          
          .dual-code-viewer {
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 1rem;
          }
          
          .code-viewer-left,
          .code-viewer-right {
            min-height: 300px;
          }
          
          .ai-fix-container {
            margin-top: 1rem;
          }
          
          .ai-fixed-code {
            font-size: 0.75rem;
            padding: 1rem;
          }
          
          .code-actions {
            flex-direction: column;
            gap: 0.5rem;
            align-items: stretch;
          }
          
          .run-btn {
            width: 100%;
            justify-content: center;
          }
          
        }
      `}</style>
    </div>
  );
};

export default Project4;
