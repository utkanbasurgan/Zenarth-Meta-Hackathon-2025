import React, { useState, useEffect } from 'react';
import './Sources.css';
import AddNewSourcePopup from './AddNewSourcePopup';
import dataService from '../../../03_datas_daemons/dataService';

const Sources = () => {
  const [sources, setSources] = useState([]);
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load sources on component mount
  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      setLoading(true);
      const sourcesData = await dataService.getSources();
      setSources(sourcesData || []);
    } catch (error) {
      console.error('Error loading sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSource = () => {
    setIsAddPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsAddPopupOpen(false);
  };

  const handleSourceAdded = (newSource) => {
    setSources(prev => [...prev, newSource]);
  };

  const handleDeleteSource = async (sourceId) => {
    if (window.confirm('Are you sure you want to delete this source?')) {
      try {
        const success = await dataService.deleteSource(sourceId);
        if (success) {
          setSources(prev => prev.filter(source => source.id !== sourceId));
        }
      } catch (error) {
        console.error('Error deleting source:', error);
        alert('Failed to delete source. Please try again.');
      }
    }
  };

  return (
    <div className="sources-container">
      {/* Header Section */}
      <div className="sources-header">
        <div className="sources-title">
          <h1>Data Sources</h1>
          <p>Manage your data sources and connections</p>
        </div>
        <button 
          className="add-source-btn"
          onClick={handleAddSource}
        >
          <span className="btn-icon">+</span>
          Add New Source
        </button>
      </div>

      {/* Sources List */}
      <div className="sources-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading sources...</p>
          </div>
        ) : sources.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>No sources found</h3>
            <p>Get started by adding your first data source</p>
            <button 
              className="add-source-btn primary"
              onClick={handleAddSource}
            >
              <span className="btn-icon">+</span>
              Add Your First Source
            </button>
          </div>
        ) : (
          <div className="sources-grid">
            {sources.map((source) => (
              <div key={source.id} className="source-card">
                <div className="source-header">
                  <div className="source-icon">
                    {source.type === 'file' ? '📄' : '🔗'}
        </div>
                  <div className="source-info">
                    <h3 className="source-name">{source.name}</h3>
                    <p className="source-path">{source.fileName || source.path}</p>
          </div>
                  <div className="source-actions">
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteSource(source.id)}
                      title="Delete source"
                    >
                      🗑️
                    </button>
              </div>
            </div>
                <div className="source-details">
                  <div className="source-meta">
                    <span className="source-type">{source.type}</span>
                    <span className={`source-status ${source.isActive ? 'active' : 'inactive'}`}>
                      {source.isActive ? 'Active' : 'Inactive'}
                    </span>
              </div>
                  {source.description && (
                    <p className="source-description">{source.description}</p>
                  )}
            </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Source Popup */}
      <AddNewSourcePopup
        isOpen={isAddPopupOpen}
        onClose={handleClosePopup}
        onSourceAdded={handleSourceAdded}
      />
    </div>
  );
};

export default Sources;
