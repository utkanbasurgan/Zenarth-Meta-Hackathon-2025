import React from 'react';

const CompanyPage = () => {
  return (
    <div className="content-card">
      <h2>Company Contacts</h2>
      <div className="contact-list">
        <div className="contact-item">
          <i className="fas fa-user-tie"></i>
          <span>John Anderson - CEO</span>
        </div>
        <div className="contact-item">
          <i className="fas fa-user-tie"></i>
          <span>Sarah Mitchell - CTO</span>
        </div>
        <div className="contact-item">
          <i className="fas fa-user-tie"></i>
          <span>Michael Chen - Designer</span>
        </div>
      </div>
    </div>
  );
};

export default CompanyPage;
