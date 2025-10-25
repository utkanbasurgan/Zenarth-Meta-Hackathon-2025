const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Log file path
const logFilePath = path.join(__dirname, 'src', 'logs', 'log.txt');

// Ensure logs directory exists
const logsDir = path.dirname(logFilePath);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Initialize log file if it doesn't exist
if (!fs.existsSync(logFilePath)) {
  const initialContent = `# Error Logs
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
  fs.writeFileSync(logFilePath, initialContent, 'utf8');
}

// API endpoint to log errors
app.post('/api/log-error', (req, res) => {
  try {
    const { title, errorData } = req.body;
    
    // Read existing content
    let existingContent = '';
    try {
      existingContent = fs.readFileSync(logFilePath, 'utf8');
    } catch (error) {
      existingContent = '';
    }

    // Count existing errors
    const errorCount = (existingContent.match(/ERROR #\d+/g) || []).length;
    const newErrorNumber = errorCount + 1;

    // Format new log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      title,
      ...errorData,
      userAgent: req.headers['user-agent'],
      url: req.headers.referer || 'Unknown',
      sessionId: req.headers['x-session-id'] || 'unknown'
    };

    const newLogEntry = formatLogEntry(logEntry, newErrorNumber);
    
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
    fs.writeFileSync(logFilePath, finalContent, 'utf8');
    
    console.log(`📝 Log written to: ${logFilePath}`);
    console.log(`📊 Total errors logged: ${newErrorNumber}`);
    
    res.json({ success: true, errorCount: newErrorNumber });
    
  } catch (error) {
    console.error('Failed to write log:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to get logs
app.get('/api/logs', (req, res) => {
  try {
    const content = fs.readFileSync(logFilePath, 'utf8');
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to clear logs
app.delete('/api/logs', (req, res) => {
  try {
    const initialContent = `# Error Logs
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
    fs.writeFileSync(logFilePath, initialContent, 'utf8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function formatLogEntry(logEntry, errorNumber) {
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

app.listen(PORT, () => {
  console.log(`🚀 Log server running on http://localhost:${PORT}`);
  console.log(`📝 Log file location: ${logFilePath}`);
});
