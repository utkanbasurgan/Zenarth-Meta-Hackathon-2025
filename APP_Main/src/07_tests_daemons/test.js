// Test Website JavaScript
// Connects to http://localhost:3000/test and logs everything

class TestLogger {
    constructor() {
        this.mainLogFile = 'main_log.txt';
        this.liveLogFile = 'live_log.txt';
        this.testEndpoint = 'http://localhost:3000/test';
        this.isConnected = false;
        this.connectionAttempts = 0;
        this.maxRetries = 5;
        
        this.init();
    }

    init() {
        this.logToMain('Test website initialized');
        this.setupErrorHandling();
        this.startConnectionTest();
    }

    logToMain(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n`;
        
        // In a real implementation, this would write to a file
        // For now, we'll use console and localStorage as a fallback
        console.log(`MAIN LOG: ${logEntry.trim()}`);
        
        // Store in localStorage for persistence
        const existingLogs = localStorage.getItem('main_log') || '';
        localStorage.setItem('main_log', existingLogs + logEntry);
        
        // Also log to the page for visibility
        this.displayLog('main', logEntry);
    }

    logToLive(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] LIVE ERROR: ${message}\n`;
        
        console.error(`LIVE LOG: ${logEntry.trim()}`);
        
        // Store in localStorage for persistence
        const existingLogs = localStorage.getItem('live_log') || '';
        localStorage.setItem('live_log', existingLogs + logEntry);
        
        // Also log to the page for visibility
        this.displayLog('live', logEntry);
    }

    displayLog(type, message) {
        const logContainer = document.getElementById(`${type}_log_display`);
        if (logContainer) {
            const logEntry = document.createElement('div');
            logEntry.textContent = message.trim();
            logEntry.className = `log-entry ${type}-log`;
            logContainer.appendChild(logEntry);
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    }

    setupErrorHandling() {
        // Global error handler for console errors
        window.addEventListener('error', (event) => {
            this.logToLive(`Console Error: ${event.error?.message || event.message} at ${event.filename}:${event.lineno}:${event.colno}`);
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.logToLive(`Unhandled Promise Rejection: ${event.reason}`);
        });

        // Network error handler
        window.addEventListener('online', () => {
            this.logToMain('Network connection restored');
        });

        window.addEventListener('offline', () => {
            this.logToMain('Network connection lost');
        });
    }

    async startConnectionTest() {
        this.logToMain('Starting connection test to ' + this.testEndpoint);
        
        while (this.connectionAttempts < this.maxRetries && !this.isConnected) {
            try {
                this.connectionAttempts++;
                this.logToMain(`Connection attempt ${this.connectionAttempts}/${this.maxRetries}`);
                
                const response = await fetch(this.testEndpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    mode: 'cors'
                });

                if (response.ok) {
                    this.isConnected = true;
                    this.logToMain('Successfully connected to test endpoint');
                    
                    const data = await response.json();
                    this.logToMain(`Received response: ${JSON.stringify(data)}`);
                    
                    // Start periodic health checks
                    this.startHealthChecks();
                } else {
                    this.logToMain(`Connection failed with status: ${response.status}`);
                }
            } catch (error) {
                this.logToMain(`Connection error: ${error.message}`);
                this.logToLive(`Network Error: ${error.message}`);
                
                if (this.connectionAttempts < this.maxRetries) {
                    const delay = Math.pow(2, this.connectionAttempts) * 1000; // Exponential backoff
                    this.logToMain(`Retrying in ${delay}ms...`);
                    await this.sleep(delay);
                }
            }
        }

        if (!this.isConnected) {
            this.logToMain('Failed to connect after all retry attempts');
            this.logToLive('Connection failed: Unable to reach test endpoint');
        }
    }

    startHealthChecks() {
        this.logToMain('Starting periodic health checks');
        
        setInterval(async () => {
            try {
                const response = await fetch(this.testEndpoint + '/health', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    this.logToMain('Health check passed');
                } else {
                    this.logToMain(`Health check failed with status: ${response.status}`);
                    this.logToLive(`Health check failed: HTTP ${response.status}`);
                }
            } catch (error) {
                this.logToMain(`Health check error: ${error.message}`);
                this.logToLive(`Health check error: ${error.message}`);
            }
        }, 30000); // Check every 30 seconds
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Method to manually trigger a test
    async runTest() {
        this.logToMain('Manual test triggered');
        
        try {
            const response = await fetch(this.testEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    testType: 'manual',
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.logToMain(`Manual test successful: ${JSON.stringify(result)}`);
            } else {
                this.logToMain(`Manual test failed with status: ${response.status}`);
                this.logToLive(`Manual test failed: HTTP ${response.status}`);
            }
        } catch (error) {
            this.logToMain(`Manual test error: ${error.message}`);
            this.logToLive(`Manual test error: ${error.message}`);
        }
    }

    // Method to download logs
    downloadLogs(type) {
        const logs = localStorage.getItem(`${type}_log`) || '';
        const blob = new Blob([logs], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_log.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.logToMain(`Downloaded ${type}_log.txt`);
    }
}

// Initialize the test logger when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.testLogger = new TestLogger();
    
    // Add event listeners for manual controls
    const runTestBtn = document.getElementById('runTestBtn');
    if (runTestBtn) {
        runTestBtn.addEventListener('click', () => {
            window.testLogger.runTest();
        });
    }

    const downloadMainBtn = document.getElementById('downloadMainBtn');
    if (downloadMainBtn) {
        downloadMainBtn.addEventListener('click', () => {
            window.testLogger.downloadLogs('main');
        });
    }

    const downloadLiveBtn = document.getElementById('downloadLiveBtn');
    if (downloadLiveBtn) {
        downloadLiveBtn.addEventListener('click', () => {
            window.testLogger.downloadLogs('live');
        });
    }

    const clearLogsBtn = document.getElementById('clearLogsBtn');
    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', () => {
            localStorage.removeItem('main_log');
            localStorage.removeItem('live_log');
            document.getElementById('main_log_display').innerHTML = '';
            document.getElementById('live_log_display').innerHTML = '';
            window.testLogger.logToMain('Logs cleared');
        });
    }
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestLogger;
}
