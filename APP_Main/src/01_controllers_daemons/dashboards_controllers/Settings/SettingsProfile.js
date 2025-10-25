import React from 'react';

const SettingsProfile = () => {
  return (
    <div className="settings-profile">
      <div className="section-header">
        <h2>Profile Settings</h2>
        <p>Manage your personal information and account details</p>
      </div>

      <div className="content-placeholder">
        <div className="placeholder-icon">
          <i className="fas fa-user"></i>
        </div>
        <h3>Profile Settings</h3>
        <p>This section will allow you to update your personal information, profile picture, and account details.</p>
      </div>

      <style jsx>{`
        .settings-profile {
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

export default SettingsProfile;
