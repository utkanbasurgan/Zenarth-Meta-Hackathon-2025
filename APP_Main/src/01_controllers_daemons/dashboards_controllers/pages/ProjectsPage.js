import React from 'react';

const ProjectsPage = ({ projects, getStatusColor, getStatusText }) => {
  return (
    <div className="projects-section">
      <div className="section-header">
        <h2>My Projects</h2>
        <button className="btn-primary">
          <i className="fas fa-plus"></i>
          New Project
        </button>
      </div>
      
      <div className="projects-grid">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <div className="project-header">
              <h3 className="project-name">{project.name}</h3>
              <span 
                className="project-status"
                style={{ backgroundColor: getStatusColor(project.status) }}
              >
                {getStatusText(project.status)}
              </span>
            </div>
            
            <div className="project-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              <span className="progress-text">{project.progress}%</span>
            </div>
            
            <div className="project-footer">
              <div className="project-deadline">
                <i className="fas fa-calendar"></i>
                <span>{project.deadline}</span>
              </div>
              <div className="project-actions">
                <button className="action-btn">
                  <i className="fas fa-edit"></i>
                </button>
                <button className="action-btn">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;
