# Console Agents Setup

The Console Agents feature requires both the React frontend and a separate API server to be running.

## Quick Start

### Option 1: Use the startup script (Recommended)
```bash
# Make the script executable
chmod +x start-console.sh

# Run the startup script
./start-console.sh
```

### Option 2: Manual startup
```bash
# Terminal 1: Start the Console API server
npm run console-api

# Terminal 2: Start the React development server
npm start
```

## What the Console Agents Do

- **Monitor Backend Processes**: Track the status of your Python backend processes
- **View Console Logs**: Display real-time logs from your backend
- **Start/Stop Processes**: Control your backend processes directly from the web interface
- **Auto-refresh**: Automatically update log entries every 2 seconds

## Troubleshooting

### "Console API server is not running" Error
This means the API server (port 3001) is not running. Start it with:
```bash
npm run console-api
```

### "No log entries found"
- Check if the console.log file exists at the specified path
- Ensure the backend process is generating logs
- Verify the log file path in ConsoleAgents.js matches your setup

### Process won't start
- Check if the Python script path is correct
- Ensure Python 3 is installed and accessible
- Verify the script has proper permissions

## API Endpoints

The Console API server provides these endpoints:
- `GET /api/console-log` - Retrieve console log content
- `GET /api/process-status` - Check if backend process is running
- `POST /api/start-process` - Start the backend process
- `POST /api/stop-process` - Stop the backend process
- `GET /api/health` - Health check

## Configuration

Update these paths in `ConsoleAgents.js` if needed:
- `consoleLogPath`: Path to your console.log file
- `pythonScriptPath`: Path to your Python backend script