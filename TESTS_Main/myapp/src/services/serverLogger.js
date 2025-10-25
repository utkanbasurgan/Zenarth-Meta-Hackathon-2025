// Server Logger - Sends logs to backend server which writes to src/logs/log.txt
class ServerLogger {
  constructor() {
    this.serverUrl = 'http://localhost:3001';
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

  async logError(title, errorData) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      title,
      ...errorData,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.getSessionId()
    };

    console.error(`[${title}]`, logEntry);

    try {
      const response = await fetch(`${this.serverUrl}/api/log-error`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': logEntry.sessionId
        },
        body: JSON.stringify({
          title,
          errorData: logEntry
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`📝 Log written to src/logs/log.txt (Error #${result.errorCount})`);
      } else {
        console.error('Failed to log error to server');
      }
    } catch (error) {
      console.error('Failed to send log to server:', error);
      console.log('📝 Fallback - Log entry:', logEntry);
    }
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('app_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('app_session_id', sessionId);
    }
    return sessionId;
  }

  async getAllLogs() {
    try {
      const response = await fetch(`${this.serverUrl}/api/logs`);
      if (response.ok) {
        const data = await response.json();
        return this.parseLogsFromContent(data.content);
      }
    } catch (error) {
      console.error('Failed to get logs from server:', error);
    }
    return [];
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

  async clearLogs() {
    try {
      const response = await fetch(`${this.serverUrl}/api/logs`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        console.log('🗑️ Log file cleared');
        return true;
      }
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
    return false;
  }

  async showLogFile() {
    try {
      const response = await fetch(`${this.serverUrl}/api/logs`);
      if (response.ok) {
        const data = await response.json();
        console.log('📄 Current log file content:');
        console.log(data.content);
        return data.content;
      }
    } catch (error) {
      console.error('Failed to get log file:', error);
    }
    return null;
  }
}

// Create global logger instance
const serverLogger = new ServerLogger();

// Export logger functions
export const logError = (title, errorData) => serverLogger.logError(title, errorData);
export const logApiError = (error, endpoint) => {
  serverLogger.logError('API Error', {
    message: error.message,
    stack: error.stack,
    endpoint,
    type: 'API_ERROR'
  });
};
export const logReactError = (error, errorInfo) => {
  serverLogger.logError('React Component Error', {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    type: 'REACT_COMPONENT_ERROR'
  });
};

export default serverLogger;
