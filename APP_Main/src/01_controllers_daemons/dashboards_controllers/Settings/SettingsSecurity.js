import React from 'react';

const SettingsSecurity = () => {
  return (
    <div className="settings-security">
      <div className="section-header">
        <h2>Security Settings</h2>
        <p>Manage your account security and privacy settings</p>
      </div>

      <div className="content-placeholder">
        <div className="placeholder-icon">
          <i className="fas fa-lock"></i>
        </div>
        <h3>Security Settings</h3>
        <p>This section will contain all your security settings including password changes, two-factor authentication, and privacy controls.</p>
      </div>

      <style jsx>{`
        .settings-security {
          padding: 2rem;
        }

        .section-header {
          margin-bottom: 2rem;
        }

        .section-header h2 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.75rem;
          font-weight: 700;
        }

        .section-header p {
          margin: 0;
          color: #666;
          font-size: 1rem;
        }

        .content-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          background: rgba(31, 30, 122, 0.05);
          border-radius: 16px;
          border: 2px dashed rgba(31, 30, 122, 0.2);
          text-align: center;
        }

        .placeholder-icon {
          font-size: 3rem;
          color: #1f1e7a;
          margin-bottom: 1rem;
        }

        .content-placeholder h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .content-placeholder p {
          margin: 0;
          color: #666;
          font-size: 1rem;
          max-width: 400px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default SettingsSecurity;
