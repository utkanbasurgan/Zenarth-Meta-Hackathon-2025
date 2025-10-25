import React from 'react';
import { Link } from 'react-router-dom';
import './SuccessPage.css';

const SuccessPage = ({ data, message, timestamp }) => {
  return (
    <div className="success-page">
      <div className="success-container">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">✅</div>
          <h1>API Load Successful!</h1>
          <p className="success-message">{message}</p>
          <p className="timestamp">Loaded at: {new Date(timestamp).toLocaleString()}</p>
        </div>

        {/* Data Display */}
        <div className="data-section">
          <h2>Loaded Data</h2>
          
          {/* Users Data */}
          {data.users && (
            <div className="data-card">
              <h3>👥 Users ({data.users.length})</h3>
              <div className="data-grid">
                {data.users.map(user => (
                  <div key={user.id} className="data-item">
                    <div className="item-header">
                      <strong>{user.name}</strong>
                    </div>
                    <div className="item-details">
                      <p>📧 {user.email}</p>
                      <p>📞 {user.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts Data */}
          {data.posts && (
            <div className="data-card">
              <h3>📝 Posts ({data.posts.length})</h3>
              <div className="data-grid">
                {data.posts.map(post => (
                  <div key={post.id} className="data-item">
                    <div className="item-header">
                      <strong>{post.title}</strong>
                    </div>
                    <div className="item-details">
                      <p>{post.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Data Display */}
          <div className="data-card">
            <h3>🔍 Raw API Response</h3>
            <pre className="json-display">
              {JSON.stringify(data, null, 2)}
            </pre>
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
            🔄 Reload Data
          </button>
        </div>

        {/* Success Stats */}
        <div className="success-stats">
          <div className="stat-item">
            <div className="stat-number">{data.users ? data.users.length : 0}</div>
            <div className="stat-label">Users Loaded</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{data.posts ? data.posts.length : 0}</div>
            <div className="stat-label">Posts Loaded</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">100%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
