// Enhanced file logger that saves logs to project directory and shows them in browser

class FileLogger {
  constructor() {
    this.logs = [];
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise,
        type: 'PROMISE_REJECTION'
      });
    });

    // Capture general JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError('JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        type: 'JAVASCRIPT_ERROR'
      });
    });
  }

  logError(title, errorData) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      title,
      ...errorData,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.getSessionId()
    };

    // Add to in-memory logs
    this.logs.push(logEntry);

    // Log to console for debugging
    console.error(`[${title}]`, logEntry);

    // Save to local storage for persistence
    this.saveToLocalStorage(logEntry);

    // Show in browser console with clear formatting
    this.displayInConsole(logEntry);
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('app_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('app_session_id', sessionId);
    }
    return sessionId;
  }

  saveToLocalStorage(logEntry) {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('app_error_logs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('app_error_logs', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  displayInConsole(logEntry) {
    console.group(`🚨 ${logEntry.title} - ${new Date(logEntry.timestamp).toLocaleString()}`);
    console.log('📅 Timestamp:', logEntry.timestamp);
    console.log('🆔 Session ID:', logEntry.sessionId);
    console.log('🌐 URL:', logEntry.url);
    console.log('💻 User Agent:', logEntry.userAgent);
    console.log('📝 Error Message:', logEntry.message || logEntry.error?.message);
    console.log('📊 Error Type:', logEntry.type);
    if (logEntry.stack) {
      console.log('📚 Stack Trace:', logEntry.stack);
    }
    if (logEntry.endpoint) {
      console.log('🔗 Failed Endpoint:', logEntry.endpoint);
    }
    console.groupEnd();
  }

  // Get all logs from localStorage
  getAllLogs() {
    try {
      return JSON.parse(localStorage.getItem('app_error_logs') || '[]');
    } catch (error) {
      console.error('Failed to get logs from localStorage:', error);
      return [];
    }
  }

  // Clear all logs
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('app_error_logs');
    console.log('🗑️ All logs cleared');
  }

  // Export logs as downloadable file
  exportLogs() {
    const allLogs = this.getAllLogs();
    if (allLogs.length === 0) {
      alert('No logs found. Try triggering an error first.');
      return;
    }

    const logText = this.formatAllLogs(allLogs);
    this.downloadFile(logText, `error_logs_${new Date().toISOString().split('T')[0]}.txt`);
  }

  // Format all logs for file output
  formatAllLogs(logs) {
    let output = `========================================
ERROR LOGS - ${new Date().toLocaleString()}
Total Errors: ${logs.length}
========================================

`;

    logs.forEach((log, index) => {
      output += this.formatLogEntry(log, index + 1);
    });

    return output;
  }

  // Format single log entry
  formatLogEntry(logEntry, index) {
    return `
========================================
ERROR #${index}
========================================
Timestamp: ${logEntry.timestamp}
Title: ${logEntry.title}
Type: ${logEntry.type}
Session ID: ${logEntry.sessionId}
URL: ${logEntry.url}
User Agent: ${logEntry.userAgent}

Error Details:
${JSON.stringify(logEntry, null, 2)}

Stack Trace:
${logEntry.stack || 'No stack trace available'}

Component Stack (React):
${logEntry.componentStack || 'Not a React component error'}

========================================
`;
  }

  // Download file utility
  downloadFile(content, filename) {
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`📄 Logs file downloaded: ${filename}`);
    } catch (error) {
      console.error('Failed to download logs file:', error);
      alert('Failed to download logs file. Check browser console for details.');
    }
  }

  // Show logs in browser (for debugging)
  showLogsInBrowser() {
    const allLogs = this.getAllLogs();
    if (allLogs.length === 0) {
      alert('No logs found. Try triggering an error first.');
      return;
    }

    // Create a new window to display logs
    const logWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
    logWindow.document.write(`
      <html>
        <head>
          <title>Error Logs - ${allLogs.length} entries</title>
          <style>
            body { font-family: monospace; margin: 20px; background: #1a1a1a; color: #fff; }
            .log-entry { background: #2a2a2a; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #ff6b6b; }
            .log-header { color: #ff6b6b; font-weight: bold; margin-bottom: 10px; }
            .log-details { color: #ccc; }
            pre { background: #333; padding: 10px; border-radius: 3px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <h1>🚨 Error Logs (${allLogs.length} entries)</h1>
          ${allLogs.map((log, index) => `
            <div class="log-entry">
              <div class="log-header">Error #${index + 1}: ${log.title}</div>
              <div class="log-details">
                <strong>Time:</strong> ${new Date(log.timestamp).toLocaleString()}<br>
                <strong>Type:</strong> ${log.type}<br>
                <strong>Message:</strong> ${log.message || log.error?.message || 'No message'}<br>
                ${log.endpoint ? `<strong>Endpoint:</strong> ${log.endpoint}<br>` : ''}
                ${log.stack ? `<pre>${log.stack}</pre>` : ''}
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `);
  }
}

// Create global logger instance
const fileLogger = new FileLogger();

// Export logger functions
export const logError = (title, errorData) => fileLogger.logError(title, errorData);
export const logApiError = (error, endpoint) => {
  fileLogger.logError('API Error', {
    message: error.message,
    stack: error.stack,
    endpoint,
    type: 'API_ERROR'
  });
};
export const logReactError = (error, errorInfo) => {
  fileLogger.logError('React Component Error', {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    type: 'REACT_COMPONENT_ERROR'
  });
};

export default fileLogger;
