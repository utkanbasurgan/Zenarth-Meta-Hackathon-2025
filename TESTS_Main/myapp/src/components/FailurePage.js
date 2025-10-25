import React from 'react';
import { Link } from 'react-router-dom';
import './FailurePage.css';
import serverLogger from '../services/serverLogger';

const FailurePage = ({ error, timestamp }) => {
  return (
    <div className="failure-page">
      <div className="failure-container">
        {/* Failure Header */}
        <div className="failure-header">
          <div className="failure-icon">❌</div>
          <h1>API Load Failed!</h1>
          <p className="failure-message">The API request encountered an error</p>
          <p className="timestamp">Failed at: {new Date(timestamp).toLocaleString()}</p>
        </div>

        {/* Error Details */}
        <div className="error-section">
          <h2>Error Details</h2>
          
          <div className="error-card">
            <h3>🚨 Error Information</h3>
            <div className="error-details">
              <div className="error-item">
                <strong>Error Type:</strong> API Address Mismatch
              </div>
              <div className="error-item">
                <strong>Error Message:</strong> {error}
              </div>
              <div className="error-item">
                <strong>Error Category:</strong> Network/Endpoint Error
              </div>
              <div className="error-item">
                <strong>Possible Causes:</strong> Invalid endpoint, CORS issues, or server unavailable
              </div>
              <div className="error-item">
                <strong>Timestamp:</strong> {new Date(timestamp).toISOString()}
              </div>
            </div>
          </div>

          {/* Troubleshooting Steps */}
          <div className="troubleshooting-card">
            <h3>🔧 Troubleshooting Steps</h3>
            <ul className="troubleshooting-list">
              <li>✅ Check your internet connection</li>
              <li>✅ Verify the API endpoint is accessible</li>
              <li>✅ Ensure the server is running</li>
              <li>✅ Check for any firewall restrictions</li>
              <li>✅ Try again in a few moments</li>
            </ul>
          </div>

          {/* Error Log */}
          <div className="error-log-card">
            <h3>📋 Error Log</h3>
            <div className="error-log">
              <div className="log-entry">
                <span className="log-time">{new Date(timestamp).toLocaleTimeString()}</span>
                <span className="log-level">ERROR</span>
                <span className="log-message">{error}</span>
              </div>
              <div className="log-entry">
                <span className="log-time">{new Date(timestamp).toLocaleTimeString()}</span>
                <span className="log-level">INFO</span>
                <span className="log-message">Retrying connection...</span>
              </div>
              <div className="log-entry">
                <span className="log-time">{new Date(timestamp).toLocaleTimeString()}</span>
                <span className="log-level">ERROR</span>
                <span className="log-message">Connection retry failed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Link to="/" className="btn btn-primary">
            🏠 Back to Home
          </Link>
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.reload()}
          >
            🔄 Retry API Call
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => {
              // Copy error to clipboard
              navigator.clipboard.writeText(error);
              alert('Error details copied to clipboard!');
            }}
          >
            📋 Copy Error Details
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => {
              // Show log file content
              serverLogger.showLogFile();
              alert('Check browser console for log file content');
            }}
          >
            📄 View Log File
          </button>
          <button 
            className="btn btn-outline"
            onClick={async () => {
              // Show logs in browser
              const logs = await serverLogger.getAllLogs();
              console.log('📋 All Error Logs:', logs);
              alert(`Found ${logs.length} error logs. Check browser console for details.`);
            }}
          >
            👁️ View Logs in Browser
          </button>
          <button 
            className="btn btn-outline"
            onClick={async () => {
              // Clear logs
              if (window.confirm('Are you sure you want to clear all error logs?')) {
                const success = await serverLogger.clearLogs();
                if (success) {
                  alert('All logs cleared!');
                } else {
                  alert('Failed to clear logs. Check console for details.');
                }
              }
            }}
          >
            🗑️ Clear All Logs
          </button>
        </div>

        {/* Failure Stats */}
        <div className="failure-stats">
          <div className="stat-item">
            <div className="stat-number">0</div>
            <div className="stat-label">Data Items Loaded</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">1</div>
            <div className="stat-label">Error Count</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">0%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>

        {/* Support Information */}
        <div className="support-section">
          <h3>🆘 Need Help?</h3>
          <p>If this error persists, please contact our support team:</p>
          <div className="support-contacts">
            <div className="contact-item">
              <strong>📧 Email:</strong> support@yourbrand.com
            </div>
            <div className="contact-item">
              <strong>📞 Phone:</strong> +1 (555) 123-4567
            </div>
            <div className="contact-item">
              <strong>💬 Live Chat:</strong> Available 24/7
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FailurePage;
