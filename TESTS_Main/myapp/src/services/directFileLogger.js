// Direct File Logger - Writes directly to src/logs/log.txt
import fs from 'fs';
import path from 'path';

class DirectFileLogger {
  constructor() {
    this.logFilePath = path.join(process.cwd(), 'src', 'logs', 'log.txt');
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

    console.error(`[${title}]`, logEntry);
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
    try {
      // Read existing content
      let existingContent = '';
      try {
        existingContent = fs.readFileSync(this.logFilePath, 'utf8');
      } catch (error) {
        // File doesn't exist, create initial content
        existingContent = this.getInitialContent();
      }

      // Count existing errors
      const errorCount = (existingContent.match(/ERROR #\d+/g) || []).length;
      const newErrorNumber = errorCount + 1;

      // Format new log entry
      const newLogEntry = this.formatLogEntry(logEntry, newErrorNumber);
      
      // Append to existing content
      const updatedContent = existingContent + newLogEntry;
      
      // Update header with new count
      const finalContent = updatedContent.replace(
        /Total Errors: \d+/,
        `Total Errors: ${newErrorNumber}`
      ).replace(
        /Last Updated: [^\n]+/,
        `Last Updated: ${new Date().toISOString()}`
      );

      // Write to file
      fs.writeFileSync(this.logFilePath, finalContent, 'utf8');
      
      console.log(`📝 Log written directly to: ${this.logFilePath}`);
      console.log(`📊 Total errors logged: ${newErrorNumber}`);
      
    } catch (error) {
      console.error('Failed to write to log file:', error);
      // Fallback: write to console
      console.log('📝 Fallback - Log entry:', this.formatLogEntry(logEntry, 1));
    }
  }

  formatLogEntry(logEntry, errorNumber) {
    return `
========================================
ERROR #${errorNumber}
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

  getInitialContent() {
    return `# Error Logs
# This file will be automatically updated when errors occur
# Generated: ${new Date().toISOString()}

========================================
ERROR LOGS - Application Error Tracking
========================================
Total Errors: 0
Last Updated: ${new Date().toISOString()}

Instructions:
1. Trigger an error by clicking "❌ Test Failed API" on the home page
2. This file will be automatically updated with error details
3. Check this file after each error to see the logged information

========================================
`;
  }

  // Get all logs from file
  getAllLogs() {
    try {
      const content = fs.readFileSync(this.logFilePath, 'utf8');
      return this.parseLogsFromContent(content);
    } catch (error) {
      console.error('Failed to read logs from file:', error);
      return [];
    }
  }

  parseLogsFromContent(content) {
    const logs = [];
    const errorBlocks = content.split('========================================');
    
    errorBlocks.forEach(block => {
      if (block.includes('ERROR #')) {
        const lines = block.trim().split('\n');
        const log = {};
        
        lines.forEach(line => {
          if (line.startsWith('Timestamp:')) {
            log.timestamp = line.split('Timestamp: ')[1];
          } else if (line.startsWith('Title:')) {
            log.title = line.split('Title: ')[1];
          } else if (line.startsWith('Type:')) {
            log.type = line.split('Type: ')[1];
          } else if (line.startsWith('Session ID:')) {
            log.sessionId = line.split('Session ID: ')[1];
          } else if (line.startsWith('URL:')) {
            log.url = line.split('URL: ')[1];
          }
        });
        
        if (log.timestamp) {
          logs.push(log);
        }
      }
    });
    
    return logs;
  }

  // Clear all logs
  clearLogs() {
    try {
      const initialContent = this.getInitialContent();
      fs.writeFileSync(this.logFilePath, initialContent, 'utf8');
      console.log('🗑️ Log file cleared');
    } catch (error) {
      console.error('Failed to clear log file:', error);
    }
  }

  // Show current log file content
  showLogFile() {
    try {
      const content = fs.readFileSync(this.logFilePath, 'utf8');
      console.log('📄 Current log file content:');
      console.log(content);
      return content;
    } catch (error) {
      console.error('Failed to read log file:', error);
      return null;
    }
  }
}

// Create global logger instance
const directFileLogger = new DirectFileLogger();

// Export logger functions
export const logError = (title, errorData) => directFileLogger.logError(title, errorData);
export const logApiError = (error, endpoint) => {
  directFileLogger.logError('API Error', {
    message: error.message,
    stack: error.stack,
    endpoint,
    type: 'API_ERROR'
  });
};
export const logReactError = (error, errorInfo) => {
  directFileLogger.logError('React Component Error', {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    type: 'REACT_COMPONENT_ERROR'
  });
};

export default directFileLogger;
