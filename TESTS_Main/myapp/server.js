const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
ss
const app = express();
const PORT = 3004;

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint to append to log file
app.post('/api/write-log', (req, res) => {
  try {
    const { message } = req.body;
    const logPath = path.join(__dirname, 'src', 'log.txt');
    
    // Append the message to the log file with timestamp
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${message}\n`;
    
    fs.appendFileSync(logPath, logEntry, 'utf8');
    
    console.log(`Successfully appended "${message}" to log.txt`);
    res.json({ 
      success: true, 
      message: `Successfully appended "${message}" to log.txt`,
      timestamp: timestamp
    });
  } catch (error) {
    console.error('Error appending to log file:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to append to log file',
      details: error.message 
    });
  }
});

// API endpoint to read the log file
app.get('/api/read-log', (req, res) => {
  try {
    const logPath = path.join(__dirname, 'src', 'log.txt');
    const logContent = fs.readFileSync(logPath, 'utf8');
    
    res.json({ 
      success: true, 
      content: logContent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error reading log file:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to read log file',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('API endpoints:');
  console.log('  POST /api/write-log - Write to log file');
  console.log('  GET /api/read-log - Read log file');
});
