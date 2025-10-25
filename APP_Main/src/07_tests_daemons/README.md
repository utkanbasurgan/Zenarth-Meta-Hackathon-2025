# Test Website - Localhost:3000 Test

A simple test website that connects to `http://localhost:3000/test` and logs all activities and console errors.

## 📁 Files Structure

```
07_tests_daemons/
├── index.html          # Main test website interface
├── test.js            # JavaScript that connects to localhost:3000/test
├── main_log.txt       # Logs all test activities
├── live_log.txt       # Logs console errors from user side
├── server.js          # Simple server to serve the test website
└── README.md          # This file
```

## 🚀 How to Run

### Option 1: Using the included server
```bash
cd 07_tests_daemons
node server.js
```
Then open: http://localhost:3001

### Option 2: Using any web server
Serve the files using any web server (Apache, Nginx, Python's http.server, etc.)

## 🔧 Features

### JavaScript (test.js)
- **Auto-connection**: Automatically tries to connect to `http://localhost:3000/test`
- **Retry Logic**: Attempts connection 5 times with exponential backoff
- **Health Checks**: Periodic health checks every 30 seconds
- **Error Handling**: Catches and logs all console errors
- **Manual Testing**: Button to trigger manual tests
- **Log Download**: Download logs as text files

### Logging System
- **Main Log**: Records all test activities, connection attempts, and responses
- **Live Log**: Records console errors, network errors, and JavaScript errors
- **Real-time Display**: Logs are displayed in the web interface
- **Persistent Storage**: Logs are stored in localStorage and can be downloaded

### Web Interface
- **Status Indicator**: Shows connection status with visual indicator
- **Control Buttons**: 
  - Run Manual Test
  - Download Main Log
  - Download Live Log
  - Clear All Logs
- **Live Log Display**: Real-time log viewing with color coding
- **Responsive Design**: Works on desktop and mobile

## 📊 Test Endpoints

The test website expects these endpoints to be available:

### GET /test
Returns test data:
```json
{
  "status": "success",
  "message": "Test endpoint is working",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "data": {
    "server": "Test Server",
    "version": "1.0.0",
    "uptime": 123.456
  }
}
```

### POST /test
Accepts test data and returns confirmation:
```json
{
  "status": "success",
  "message": "Test data received",
  "received": { /* your data */ },
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### GET /test/health
Returns health check data:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "checks": {
    "database": "connected",
    "memory": { /* memory usage */ },
    "uptime": 123.456
  }
}
```

## 🎯 Usage

1. **Start the test website server**:
   ```bash
   node server.js
   ```

2. **Open the test website**: http://localhost:3001

3. **Start your target server** on port 3000 with the `/test` endpoint

4. **Monitor the logs**: The website will automatically:
   - Try to connect to `http://localhost:3000/test`
   - Log all connection attempts and responses
   - Log any console errors
   - Perform periodic health checks

5. **Download logs**: Use the download buttons to get log files

## 🔍 What Gets Logged

### Main Log (main_log.txt)
- Test website initialization
- Connection attempts and results
- Successful connections and responses
- Manual test triggers
- Health check results
- Network status changes

### Live Log (live_log.txt)
- Console errors (JavaScript errors)
- Network errors (connection failures)
- Unhandled promise rejections
- Health check failures
- Manual test errors

## 🛠️ Customization

### Change Target Endpoint
Edit `test.js` and modify:
```javascript
this.testEndpoint = 'http://localhost:3000/test';
```

### Change Retry Settings
Edit `test.js` and modify:
```javascript
this.maxRetries = 5; // Number of retry attempts
```

### Change Health Check Interval
Edit `test.js` and modify:
```javascript
}, 30000); // Check every 30 seconds
```

## 📝 Example Log Output

### Main Log Example
```
[2024-01-15T10:00:00.000Z] Test website initialized
[2024-01-15T10:00:00.100Z] Starting connection test to http://localhost:3000/test
[2024-01-15T10:00:00.200Z] Connection attempt 1/5
[2024-01-15T10:00:01.000Z] Successfully connected to test endpoint
[2024-01-15T10:00:01.100Z] Received response: {"status":"success","message":"Test endpoint is working"}
```

### Live Log Example
```
[2024-01-15T10:00:01.000Z] LIVE ERROR: Network Error: Failed to fetch
[2024-01-15T10:00:30.000Z] LIVE ERROR: Health check error: Failed to fetch
```

## 🚨 Troubleshooting

### Connection Issues
- Ensure the target server is running on port 3000
- Check that the `/test` endpoint is available
- Verify CORS settings if testing from different domains

### Log Issues
- Check browser console for JavaScript errors
- Ensure localStorage is available
- Try clearing browser cache

### Server Issues
- Make sure port 3001 is available
- Check file permissions
- Verify Node.js is installed

## 📞 Support

This test website is designed to be simple and self-contained. All logging happens client-side using JavaScript and localStorage. The logs are displayed in real-time in the web interface and can be downloaded as text files.
