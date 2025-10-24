import React from 'react';

const AccountPage = () => {
  return (
    <div className="content-card">
      <h2>Account Settings</h2>
      <div className="settings-option">
        <span>Email</span>
        <span className="setting-value">user@zenarth.com</span>
      </div>
      <div className="settings-option">
        <span>Password</span>
        <button className="change-btn">Change</button>
      </div>
      <div className="settings-option">
        <span>Two-Factor Auth</span>
        <button className="toggle-btn">Enabled</button>
      </div>
    </div>
  );
};

export default AccountPage;
