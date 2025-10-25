import React from 'react';

const OverviewPage = ({ stats, recentActivities }) => {
  return (
    <div className="overview-section">
      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: stat.color }}>
              <i className={stat.icon}></i>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-title">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Activities */}
      <div className="overview-grid">
        <div className="chart-section">
          <h3>Project Progress</h3>
          <div className="chart-placeholder">
            <i className="fas fa-chart-bar"></i>
            <p>Chart will appear here</p>
          </div>
        </div>
        
        <div className="activities-section">
          <h3>Recent Activities</h3>
          <div className="activities-list">
            {recentActivities.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-circle"></i>
                </div>
                <div className="activity-content">
                  <p className="activity-action">{activity.action}</p>
                  <p className="activity-project">{activity.project}</p>
                  <p className="activity-time">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
