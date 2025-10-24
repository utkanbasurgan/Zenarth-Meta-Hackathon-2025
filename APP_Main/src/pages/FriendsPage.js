import React from 'react';

const FriendsPage = () => {
  return (
    <div className="content-card">
      <h2>Friends</h2>
      <div className="contact-list">
        <div className="contact-item">
          <i className="fas fa-user"></i>
          <span>Emma Wilson</span>
        </div>
        <div className="contact-item">
          <i className="fas fa-user"></i>
          <span>David Park</span>
        </div>
        <div className="contact-item">
          <i className="fas fa-user"></i>
          <span>Lisa Rodriguez</span>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
