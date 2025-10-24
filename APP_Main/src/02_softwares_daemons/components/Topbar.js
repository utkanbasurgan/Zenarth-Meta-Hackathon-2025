import React from 'react';

const Topbar = ({ 
  activeSection, 
  activeSubSection, 
  subSections, 
  user, 
  onNavigateToWebsite 
}) => {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1 className="page-title">
          {activeSection === 'overview' && 'Overview'}
          {activeSection === 'projects' && 'Projects'}
          {activeSection === 'tasks' && 'Tasks'}
          {activeSection === 'team' && 'Team'}
          {activeSection === 'analyze' && 'Data Analysis'}
          {activeSection === 'settings' && 'Settings'}
        </h1>
        {activeSubSection && (
          <span className="sub-title">
            {subSections[activeSection]?.find(sub => sub.id === activeSubSection)?.name}
          </span>
        )}
      </div>
      
      <div className="header-right">
        <div className="user-menu">
          <div className="user-avatar">
            <i className="fas fa-user"></i>
          </div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-email">{user.email}</span>
          </div>
          <button className="logout-btn" onClick={() => {
            if (onNavigateToWebsite) {
              onNavigateToWebsite();
            } else {
              window.location.href = '/';
            }
          }}>
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
