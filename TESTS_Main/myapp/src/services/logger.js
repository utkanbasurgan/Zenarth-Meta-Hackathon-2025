// Logger service to capture React errors and write to logs.txt

class Logger {
  constructor() {
    this.logs = [];
    this.setupErrorHandling();
  }

  // Setup global error handling for React errors
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

    // Capture React error boundaries (if implemented)
    this.setupReactErrorBoundary();
  }

  // Setup React error boundary logging
  setupReactErrorBoundary() {
    // This will be called by React error boundaries
    window.reactErrorHandler = (error, errorInfo) => {
      this.logError('React Error Boundary', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        type: 'REACT_ERROR_BOUNDARY'
      });
    };
  }

  // Log error with detailed information
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

    // Write to logs.txt (in browser environment, this will download the file)
    this.writeToFile(logEntry);
  }

  // Generate session ID for tracking
  getSessionId() {
    let sessionId = sessionStorage.getItem('app_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('app_session_id', sessionId);
    }
    return sessionId;
  }

  // Write log entry to file
  writeToFile(logEntry) {
    try {
      // Create formatted log entry
      const logText = this.formatLogEntry(logEntry);
      
      // Create blob with the log entry
      const blob = new Blob([logText], { type: 'text/plain' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `logs_${new Date().toISOString().split('T')[0]}.txt`;
      
      // Trigger download (this will append to existing file if user chooses)
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to write log to file:', error);
    }
  }

  // Format log entry for file output
  formatLogEntry(logEntry) {
    return `
========================================
ERROR LOG ENTRY
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

  // Get all logs (for debugging)
  getAllLogs() {
    return this.logs;
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Export logs as JSON
  exportLogs() {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error_logs_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Create global logger instance
const logger = new Logger();

// Export logger functions
export const logError = (title, errorData) => logger.logError(title, errorData);
export const logApiError = (error, endpoint) => {
  logger.logError('API Error', {
    message: error.message,
    stack: error.stack,
    endpoint,
    type: 'API_ERROR'
  });
};
export const logReactError = (error, errorInfo) => {
  logger.logError('React Component Error', {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    type: 'REACT_COMPONENT_ERROR'
  });
};

export default logger;
