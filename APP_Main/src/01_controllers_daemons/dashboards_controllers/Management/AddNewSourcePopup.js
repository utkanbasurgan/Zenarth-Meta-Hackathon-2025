import React, { useState } from 'react';
import dataService from '../../../03_datas_daemons/dataService';
import './AddNewSourcePopup.css';

const AddNewSourcePopup = ({ isOpen, onClose, onSourceAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    path: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!formData.path.trim()) {
      setError('Path is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create new source object
      const newSource = {
        name: formData.name.trim(),
        fileName: formData.path.trim(),
        type: 'file', // Default type
        description: `Data source: ${formData.name.trim()}`,
        settings: {
          autoBackup: true,
          encryption: false,
          version: "1.0"
        },
        data: "",
        isActive: true
      };

      // Add source using dataService
      const addedSource = dataService.addSource(newSource);
      
      if (addedSource) {
        // Reset form
        setFormData({ name: '', path: '' });
        
        // Notify parent component
        if (onSourceAdded) {
          onSourceAdded(addedSource);
        }
        
        // Close popup
        onClose();
      } else {
        setError('Failed to add source. Please try again.');
      }
    } catch (err) {
      console.error('Error adding source:', err);
      setError('Failed to add source. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', path: '' });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="add-source-overlay">
      <div className="add-source-popup">
        <div className="add-source-header">
          <h2>Add New Source</h2>
          <button 
            className="close-btn" 
            onClick={handleClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        
        <div className="add-source-content">
          <p className="add-source-description">
            Configure a new data source for your project
          </p>
          
          <form onSubmit={handleSubmit} className="add-source-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter source name"
                className="form-input"
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="path" className="form-label">
                Path *
              </label>
              <input
                type="text"
                id="path"
                name="path"
                value={formData.path}
                onChange={handleInputChange}
                placeholder="Enter file path or URL"
                className="form-input"
                disabled={isLoading}
                required
              />
            </div>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <div className="form-actions">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Source'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddNewSourcePopup;
