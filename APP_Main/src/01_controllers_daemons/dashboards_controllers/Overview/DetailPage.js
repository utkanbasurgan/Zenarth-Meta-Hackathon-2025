import React, { useState, useEffect } from 'react';
import dataService from '../../../03_datas_daemons/dataService';

const DetailPage = () => {
  const [projectName, setProjectName] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [projectBuild, setProjectBuild] = useState('React');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Load project details from data service on component mount
  useEffect(() => {
    const loadProjectDetails = async () => {
      setIsLoading(true);
      try {
        const projectDetails = await dataService.getProjectDetails();
        setProjectName(projectDetails.name || '');
        setProjectLocation(projectDetails.location || '');
        setProjectBuild(projectDetails.build || 'React');
      } catch (error) {
        console.error('Error loading project details:', error);
        setSaveStatus('Error loading project details');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjectDetails();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus('Saving...');
    
    const projectDetails = {
      name: projectName,
      location: projectLocation,
      build: projectBuild
    };
    
    try {
      // Save project details to JSON file via data service
      await dataService.updateProjectDetails(projectDetails);
      
      console.log('Project Details saved:', projectDetails);
      setSaveStatus('Project details saved successfully!');
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
    } catch (error) {
      console.error('Error saving project details:', error);
      setSaveStatus('Error saving project details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFolderSelect = () => {
    // Create a hidden file input element for folder selection
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true; // This allows folder selection
    input.directory = true;
    input.multiple = true;
    input.style.display = 'none';
    
    input.onchange = (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        // Get the folder path from the first file's webkitRelativePath
        const firstFile = files[0];
        if (firstFile.webkitRelativePath) {
          // Extract the folder path (everything before the first slash)
          const folderPath = firstFile.webkitRelativePath.split('/')[0];
          
          // For webkitRelativePath, we need to construct the full path
          // The webkitRelativePath gives us the relative path from the selected folder
          let fullPath = firstFile.webkitRelativePath;
          
          // If we have a full path, extract the directory
          if (fullPath.includes('/')) {
            const lastSlashIndex = fullPath.lastIndexOf('/');
            const directoryPath = fullPath.substring(0, lastSlashIndex);
            setProjectLocation(directoryPath);
          } else {
            // Fallback: use the folder name
            setProjectLocation(folderPath);
          }
        } else {
          // If no webkitRelativePath, try to use the file name as folder name
          const fileName = firstFile.name;
          if (fileName) {
            setProjectLocation(fileName);
          }
        }
      }
    };
    
    // Add the input to the DOM temporarily
    document.body.appendChild(input);
    
    // Trigger the folder selection dialog
    input.click();
    
    // Clean up the input element after use
    setTimeout(() => {
      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
    }, 1000);
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
            <div className="input-with-button">
              <input
                type="text"
                id="projectLocation"
                className="form-input"
                value={projectLocation}
                onChange={(e) => setProjectLocation(e.target.value)}
                placeholder="Enter project location or click Select Folder"
                required
              />
              <button
                type="button"
                className="btn-folder-select"
                onClick={handleFolderSelect}
                title="Select a folder"
              >
                <i className="fas fa-folder"></i>
                Select Folder
              </button>
            </div>
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
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSaving || isLoading}
            >
              {isSaving ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Save Project
                </>
              )}
            </button>
            <button type="button" className="btn-secondary">
              <i className="fas fa-times"></i>
              Cancel
            </button>
          </div>
          
          {saveStatus && (
            <div className={`save-status ${saveStatus.includes('Error') ? 'error' : 'success'}`}>
              {saveStatus}
            </div>
          )}
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

        .form-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1rem;
          padding-right: 3rem;
          background-color: white;
          color: #333;
          box-sizing: border-box;
        }

        .form-select:hover {
          border-color: #1f1e7a;
        }

        .input-with-button {
          display: flex;
          gap: 0.5rem;
          align-items: stretch;
        }

        .input-with-button .form-input {
          flex: 1;
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          border-right: none;
        }

        .input-with-button .form-input:focus {
          border-right: none;
        }

        .btn-folder-select {
          padding: 0.75rem 1rem;
          background: #f8f9fa;
          color: #666;
          border: 2px solid #e1e5e9;
          border-left: none;
          border-radius: 0 8px 8px 0;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
        }

        .btn-folder-select:hover {
          background: #e9ecef;
        }

        .btn-folder-select:active {
          transform: translateY(0);
        }

        .btn-folder-select i {
          font-size: 0.9rem;
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

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-primary:disabled:hover {
          transform: none;
          box-shadow: none;
        }

        .save-status {
          margin-top: 1rem;
          padding: 0.75rem;
          border-radius: 8px;
          font-weight: 500;
          text-align: center;
        }

        .save-status.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .save-status.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
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

          .input-with-button {
            flex-direction: column;
          }

          .input-with-button .form-input {
            border-radius: 8px;
            border-right: 2px solid #e1e5e9;
          }

          .input-with-button .form-input:focus {
            border-right: 2px solid #1f1e7a;
          }

          .btn-folder-select {
            border-radius: 8px;
            border: 2px solid #e1e5e9;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default DetailPage;
