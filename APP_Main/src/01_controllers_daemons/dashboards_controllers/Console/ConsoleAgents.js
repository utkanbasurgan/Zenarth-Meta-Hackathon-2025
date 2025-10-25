import React, { useState, useEffect, useRef } from 'react';

const ConsoleAgents = () => {
  const [consoleLog, setConsoleLog] = useState([]);
  const [isProcessRunning, setIsProcessRunning] = useState(false);
  const [processPid, setProcessPid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const logContainerRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  // Console log file path
  const consoleLogPath = '/Users/utkan.basurgan/Main/1. Works Files/2. Gits Works/Zenarth-Meta-Hackathon-2025/APP_Backend/console.log';
  const pythonScriptPath = '/Users/utkan.basurgan/Main/1. Works Files/2. Gits Works/Zenarth-Meta-Hackathon-2025/APP_Backend/MainRunner.py';

  // Load console log content
  const loadConsoleLog = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/console-log?path=${encodeURIComponent(consoleLogPath)}`);
      if (response.ok) {
        const data = await response.json();
        setConsoleLog(data.lines || []);
        setError('');
      } else {
        setError('Failed to load console log: ' + response.statusText);
      }
    } catch (err) {
      if (err.message.includes('fetch')) {
        setError('Console API server is not running. Please start it with: npm run console-api');
      } else {
        setError('Error loading console log: ' + err.message);
      }
    }
  };

  // Check if process is running
  const checkProcessStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/process-status');
      if (response.ok) {
        const data = await response.json();
        setIsProcessRunning(data.isRunning);
        setProcessPid(data.pid);
      }
    } catch (err) {
      console.error('Error checking process status:', err);
    }
  };

  // Start Python process
  const startProcess = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:3001/api/start-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scriptPath: pythonScriptPath
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsProcessRunning(true);
        setProcessPid(data.pid);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to start process');
      }
    } catch (err) {
      setError('Error starting process: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Stop Python process
  const stopProcess = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:3001/api/stop-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pid: processPid
        })
      });

      if (response.ok) {
        setIsProcessRunning(false);
        setProcessPid(null);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to stop process');
      }
    } catch (err) {
      setError('Error stopping process: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  };

  // Initialize
  useEffect(() => {
    loadConsoleLog();
    checkProcessStatus();
  }, []);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadConsoleLog();
        checkProcessStatus();
      }, 2000); // Refresh every 2 seconds
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh]);

  // Auto-scroll when new logs arrive
  useEffect(() => {
    scrollToBottom();
  }, [consoleLog]);

  const formatLogLine = (line, index) => {
    // Parse timestamp and message
    const timestampMatch = line.match(/^\[([^\]]+)\]/);
    const message = timestampMatch ? line.substring(timestampMatch[0].length).trim() : line;
    const timestamp = timestampMatch ? timestampMatch[1] : '';

    return (
      <div key={index} className="log-line">
        {timestamp && (
          <span className="log-timestamp">[{timestamp}]</span>
        )}
        <span className="log-message">{message}</span>
      </div>
    );
  };

  return (
    <div className="console-agents">
      <div className="console-header">
        <div className="header-left">
          <h2>
            <i className="fas fa-terminal"></i>
            Console Agents
          </h2>
          <p>Monitor and control backend processes</p>
        </div>
        <div className="header-right">
          <div className="process-status">
            <div className={`status-indicator ${isProcessRunning ? 'running' : 'stopped'}`}>
              <div className="status-dot"></div>
              <span>{isProcessRunning ? 'Running' : 'Stopped'}</span>
              {processPid && <span className="pid">PID: {processPid}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="console-controls">
        <div className="controls-left">
          <button
            className={`control-btn ${isProcessRunning ? 'stop' : 'start'}`}
            onClick={isProcessRunning ? stopProcess : startProcess}
            disabled={isLoading}
          >
            <i className={`fas ${isProcessRunning ? 'fa-stop' : 'fa-play'}`}></i>
            {isLoading ? 'Processing...' : (isProcessRunning ? 'Stop Process' : 'Start Process')}
          </button>
          
          <button
            className="control-btn refresh"
            onClick={loadConsoleLog}
          >
            <i className="fas fa-sync-alt"></i>
            Refresh Log
          </button>
        </div>

        <div className="controls-right">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div className="console-content">
        <div className="log-header">
          <h3>
            <i className="fas fa-file-alt"></i>
            Console Log
          </h3>
          <div className="log-info">
            <span className="log-count">{consoleLog.length} entries</span>
            <span className="log-path">{consoleLogPath}</span>
          </div>
        </div>

        <div className="log-container" ref={logContainerRef}>
          {consoleLog.length === 0 ? (
            <div className="no-logs">
              <i className="fas fa-file-alt"></i>
              <p>No log entries found</p>
            </div>
          ) : (
            consoleLog.map((line, index) => formatLogLine(line, index))
          )}
        </div>
      </div>

      <style jsx>{`
        .console-agents {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
        }

        .console-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .header-left h2 {
          margin: 0 0 0.5rem 0;
          color: #1f1e7a;
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-left p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .process-status {
          display: flex;
          align-items: center;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .status-indicator.running {
          background: #dcfce7;
          color: #166534;
        }

        .status-indicator.stopped {
          background: #fee2e2;
          color: #dc2626;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 2s infinite;
        }

        .status-indicator.running .status-dot {
          background: #22c55e;
        }

        .status-indicator.stopped .status-dot {
          background: #dc2626;
          animation: none;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .pid {
          margin-left: 0.5rem;
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .console-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: white;
          border-bottom: 1px solid #e2e8f0;
        }

        .controls-left {
          display: flex;
          gap: 0.75rem;
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .control-btn.start {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .control-btn.start:hover:not(:disabled) {
          background: #bbf7d0;
          transform: translateY(-1px);
        }

        .control-btn.stop {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .control-btn.stop:hover:not(:disabled) {
          background: #fecaca;
          transform: translateY(-1px);
        }

        .control-btn.refresh {
          background: #f1f5f9;
          color: #1f1e7a;
          border: 1px solid #e2e8f0;
        }

        .control-btn.refresh:hover:not(:disabled) {
          background: #e2e8f0;
          transform: translateY(-1px);
        }

        .control-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .controls-right {
          display: flex;
          align-items: center;
        }

        .auto-refresh-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.9rem;
          color: #666;
        }

        .auto-refresh-toggle input {
          margin: 0;
        }

        .error-message {
          margin: 1rem 2rem;
          padding: 0.75rem 1rem;
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .console-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin: 1.5rem 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .log-header h3 {
          margin: 0;
          color: #1f1e7a;
          font-size: 1.1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .log-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .log-count {
          font-size: 0.85rem;
          color: #666;
          font-weight: 500;
        }

        .log-path {
          font-size: 0.75rem;
          color: #999;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }

        .log-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          background: #1e1e1e;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .log-line {
          margin-bottom: 0.25rem;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .log-timestamp {
          color: #94a3b8;
          font-weight: 500;
          flex-shrink: 0;
        }

        .log-message {
          color: #d1d5db;
          flex: 1;
        }

        .no-logs {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #6b7280;
          text-align: center;
        }

        .no-logs i {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .no-logs p {
          margin: 0;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .console-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .console-controls {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .controls-left {
            justify-content: center;
          }

          .controls-right {
            justify-content: center;
          }

          .log-header {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }

          .log-info {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default ConsoleAgents;
