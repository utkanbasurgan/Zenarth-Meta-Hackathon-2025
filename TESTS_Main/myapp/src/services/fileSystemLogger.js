// File System Logger - Writes logs directly to src/logs/log.txt
import fs from 'fs';
import path from 'path';

class FileSystemLogger {
  constructor() {
    this.logFilePath = path.join(process.cwd(), 'src', 'logs', 'log.txt');
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

    // Log to console for debugging
    console.error(`[${title}]`, logEntry);

    // Write to file system
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
      // Format the log entry
      const logText = this.formatLogEntry(logEntry);
      
      // Read existing file content
      let existingContent = '';
      try {
        existingContent = fs.readFileSync(this.logFilePath, 'utf8');
      } catch (error) {
        // File doesn't exist, start fresh
        existingContent = this.getInitialContent();
      }

      // Update the total count
      const errorCount = (existingContent.match(/ERROR #\d+/g) || []).length + 1;
      
      // Append new log entry
      const newContent = existingContent + logText;
      
      // Update the header with new count and timestamp
      const updatedContent = newContent.replace(
        /Total Errors: \d+/,
        `Total Errors: ${errorCount}`
      ).replace(
        /Last Updated: [^\n]+/,
        `Last Updated: ${new Date().toISOString()}`
      );

      // Write to file
      fs.writeFileSync(this.logFilePath, updatedContent, 'utf8');
      
      console.log(`📝 Log written to: ${this.logFilePath}`);
      
    } catch (error) {
      console.error('Failed to write to log file:', error);
      // Fallback: try to write to a different location
      this.writeToFallbackFile(logEntry);
    }
  }

  writeToFallbackFile(logEntry) {
    try {
      // Try to write to public directory as fallback
      const fallbackPath = path.join(process.cwd(), 'public', 'error-log.txt');
      const logText = this.formatLogEntry(logEntry);
      fs.writeFileSync(fallbackPath, logText, { flag: 'a' });
      console.log(`📝 Fallback log written to: ${fallbackPath}`);
    } catch (fallbackError) {
      console.error('Failed to write to fallback file:', fallbackError);
    }
  }

  formatLogEntry(logEntry) {
    return `
========================================
ERROR #${this.getNextErrorNumber()}
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

  getNextErrorNumber() {
    try {
      const content = fs.readFileSync(this.logFilePath, 'utf8');
      const matches = content.match(/ERROR #(\d+)/g);
      return matches ? matches.length + 1 : 1;
    } catch (error) {
      return 1;
    }
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
const fileSystemLogger = new FileSystemLogger();

// Export logger functions
export const logError = (title, errorData) => fileSystemLogger.logError(title, errorData);
export const logApiError = (error, endpoint) => {
  fileSystemLogger.logError('API Error', {
    message: error.message,
    stack: error.stack,
    endpoint,
    type: 'API_ERROR'
  });
};
export const logReactError = (error, errorInfo) => {
  fileSystemLogger.logError('React Component Error', {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    type: 'REACT_COMPONENT_ERROR'
  });
};

export default fileSystemLogger;
