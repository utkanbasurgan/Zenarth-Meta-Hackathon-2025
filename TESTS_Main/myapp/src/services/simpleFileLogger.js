// Simple File Logger - Writes to src/logs/log.txt
class SimpleFileLogger {
  constructor() {
    this.logs = [];
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', {
        reason: event.reason,
        type: 'PROMISE_REJECTION'
      });
    });

    window.addEventListener('error', (event) => {
      this.logError('JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
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

    this.logs.push(logEntry);
    console.error(`[${title}]`, logEntry);
    
    // Write to file
    this.writeToFile(logEntry);
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('app_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('app_session_id', sessionId);
    }
    return sessionId;
  }

  writeToFile(logEntry) {
    const logText = this.formatLogEntry(logEntry);
    
    // Create blob and download
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'log.txt';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('📝 Log file downloaded - save it to src/logs/log.txt');
  }

  formatLogEntry(logEntry) {
    return `========================================
ERROR #${this.logs.length}
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

========================================
`;
  }

  getAllLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    console.log('🗑️ Logs cleared');
  }
}

const simpleFileLogger = new SimpleFileLogger();

export const logError = (title, errorData) => simpleFileLogger.logError(title, errorData);
export const logApiError = (error, endpoint) => {
  simpleFileLogger.logError('API Error', {
    message: error.message,
    stack: error.stack,
    endpoint,
    type: 'API_ERROR'
  });
};

export default simpleFileLogger;
