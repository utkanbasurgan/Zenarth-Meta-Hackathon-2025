import React, { useState, useEffect } from 'react';
import dataService from '../../../03_datas_daemons/dataService';

const DetailPage = () => {
  const [projectName, setProjectName] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [projectBuild, setProjectBuild] = useState('React');

  // Load project details from data service on component mount
  useEffect(() => {
    const projectDetails = dataService.getProjectDetails();
    setProjectName(projectDetails.name || '');
    setProjectLocation(projectDetails.location || '');
    setProjectBuild(projectDetails.build || 'React');
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const projectDetails = {
      name: projectName,
      location: projectLocation,
      build: projectBuild
    };
    
    // Save project details to JSON file via data service
    dataService.updateProjectDetails(projectDetails);
    
    console.log('Project Details saved:', projectDetails);
    alert('Project details saved successfully!');
  };

  return (
    <div className="detail-page">
      <div className="detail-header">
        <h1>Project Details</h1>
        <p>Create a new project or update existing project information</p>
      </div>

      <div className="detail-form-container">
        <form className="detail-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="projectName" className="form-label">
              <i className="fas fa-folder"></i>
              Project Name
            </label>
            <input
              type="text"
              id="projectName"
              className="form-input"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="projectLocation" className="form-label">
              <i className="fas fa-map-marker-alt"></i>
              Project Location
            </label>
            <input
              type="text"
              id="projectLocation"
              className="form-input"
              value={projectLocation}
              onChange={(e) => setProjectLocation(e.target.value)}
              placeholder="Enter project location"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="projectBuild" className="form-label">
              <i className="fas fa-code"></i>
              Project Build
            </label>
            <select
              id="projectBuild"
              className="form-select"
              value={projectBuild}
              onChange={(e) => setProjectBuild(e.target.value)}
            >
              <option value="React">React</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              <i className="fas fa-save"></i>
              Save Project
            </button>
            <button type="button" className="btn-secondary">
              <i className="fas fa-times"></i>
              Cancel
            </button>
          </div>
        </form>

        <div className="project-preview">
          <h3>Project Preview</h3>
          <div className="preview-card">
            <div className="preview-item">
              <strong>Name:</strong> {projectName || 'Not specified'}
            </div>
            <div className="preview-item">
              <strong>Location:</strong> {projectLocation || 'Not specified'}
            </div>
            <div className="preview-item">
              <strong>Build:</strong> {projectBuild}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .detail-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .detail-header {
          margin-bottom: 2rem;
        }

        .detail-header h1 {
          color: #1f1e7a;
          margin-bottom: 0.5rem;
          font-size: 2rem;
        }

        .detail-header p {
          color: #666;
          font-size: 1.1rem;
        }

        .detail-form-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: start;
        }

        .detail-form {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        }

        .form-label i {
          color: #1f1e7a;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #1f1e7a;
          box-shadow: 0 0 0 3px rgba(31, 30, 122, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #1f1e7a, #4facfe);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(31, 30, 122, 0.3);
        }

        .btn-secondary {
          background: #f8f9fa;
          color: #666;
          border: 2px solid #e1e5e9;
        }

        .btn-secondary:hover {
          background: #e9ecef;
        }

        .project-preview {
          background: #f8f9fa;
          padding: 2rem;
          border-radius: 12px;
          border: 2px solid #e1e5e9;
        }

        .project-preview h3 {
          color: #1f1e7a;
          margin-bottom: 1rem;
        }

        .preview-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .preview-item {
          margin-bottom: 0.75rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e1e5e9;
        }

        .preview-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .preview-item strong {
          color: #1f1e7a;
          margin-right: 0.5rem;
        }

        @media (max-width: 768px) {
          .detail-form-container {
            grid-template-columns: 1fr;
          }
          
          .detail-page {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DetailPage;
