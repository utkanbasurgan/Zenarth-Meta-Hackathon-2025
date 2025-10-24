import React from 'react';

const PrivacyPage = () => {
  return (
    <div className="content-card">
      <h2>Privacy Settings</h2>
      <div className="settings-option">
        <span>Profile Visibility</span>
        <button className="toggle-btn">Public</button>
      </div>
      <div className="settings-option">
        <span>Data Sharing</span>
        <button className="toggle-btn">Enabled</button>
      </div>
      <div className="settings-option">
        <span>Activity Status</span>
        <button className="toggle-btn">Visible</button>
      </div>
    </div>
  );
};

export default PrivacyPage;
