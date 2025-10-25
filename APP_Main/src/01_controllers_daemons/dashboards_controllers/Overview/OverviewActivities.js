import React from 'react';

const OverviewActivities = () => {
  return (
    <div className="overview-activities">
      <div className="section-header">
        <h2>Activity Feed</h2>
        <p>Track all project activities and team updates</p>
      </div>

      <div className="content-placeholder">
        <div className="placeholder-icon">
          <i className="fas fa-history"></i>
        </div>
        <h3>Activity Feed</h3>
        <p>This section will display a comprehensive activity feed showing all project activities, team updates, and recent changes.</p>
      </div>

      <style jsx>{`
        .overview-activities {
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

export default OverviewActivities;
