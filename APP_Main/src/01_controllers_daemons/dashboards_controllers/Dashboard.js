import React, { useState } from 'react';
import { geminiApi } from '../../02_softwares_daemons/geminis_softwares';
import Sidebar from '../../02_softwares_daemons/components/Sidebar';
import Topbar from '../../02_softwares_daemons/components/Topbar';
import dataService from '../../03_datas_daemons/dataService';
import {
  OverviewStatistics,
  ChatPage,
  DetailPage
} from './Overview';

import {
  Sources
} from './Management';
import {
  TeamPage,
  AdminsPage
} from './People';

import {
  SettingsPage,
  SettingsProfile,
  SettingsPreferences,
  SettingsSecurity
} from './Settings';

import {
  ConsoleAgents
} from './Console';


const Dashboard = ({ onNavigateToWebsite }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [activeSubSection, setActiveSubSection] = useState('details');
  const [user, setUser] = useState({
    name: 'User',
    email: 'user@zenarth.ai',
    avatar: null
  });

  // CSV Analysis states
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  
  // Dynamic sources states
  const [dynamicSources, setDynamicSources] = useState([]);
  const [showAddSourceModal, setShowAddSourceModal] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourcePath, setNewSourcePath] = useState('');
  const [newSourceType, setNewSourceType] = useState('file');
  const [newSourceDescription, setNewSourceDescription] = useState('');
  const [newSourceEncrypted, setNewSourceEncrypted] = useState(false);
  const [newSourceBackup, setNewSourceBackup] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [isGeneratingActions, setIsGeneratingActions] = useState(false);
  
  // AI Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  // Console session states
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  // Load user sources from data service
  React.useEffect(() => {
    const loadSources = async () => {
      try {
        await dataService.waitForInit();
        const sources = dataService.getSources();
        // Filter out any null/undefined sources and ensure they have required properties
        const validSources = sources.filter(source => 
          source && 
          source.name && 
          typeof source.name === 'string'
        );
        setDynamicSources(validSources);
      } catch (error) {
        console.error('Error loading sources:', error);
        setDynamicSources([]);
      }
    };
    loadSources();
  }, []);

  // Function to get appropriate icon based on source type
  const getSourceIcon = (source) => {
    if (!source || !source.type) return 'fas fa-file';
    
    const iconMap = {
      'log': 'fas fa-file-alt',
      'data': 'fas fa-database',
      'code': 'fas fa-code',
      'text': 'fas fa-file-text',
      'json': 'fas fa-file-code',
      'csv': 'fas fa-file-csv',
      'xml': 'fas fa-file-code',
      'pdf': 'fas fa-file-pdf',
      'image': 'fas fa-file-image',
      'video': 'fas fa-file-video',
      'audio': 'fas fa-file-audio',
      'archive': 'fas fa-file-archive',
      'spreadsheet': 'fas fa-file-excel',
      'document': 'fas fa-file-word',
      'presentation': 'fas fa-file-powerpoint',
      'default': 'fas fa-file'
    };
    
    return iconMap[source.type] || iconMap.default;
  };

  // Listen for storage changes to update sources list
  React.useEffect(() => {
    const handleStorageChange = async () => {
      try {
        await dataService.waitForInit();
        const sources = dataService.getSources();
        // Filter out any null/undefined sources and ensure they have required properties
        const validSources = sources.filter(source => 
          source && 
          source.name && 
          typeof source.name === 'string'
        );
        setDynamicSources(validSources);
      } catch (error) {
        console.error('Error handling storage change:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sourcesUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sourcesUpdated', handleStorageChange);
    };
  }, []);

  const stats = [
    { title: 'Total Projects', value: '12', icon: 'fas fa-folder', color: '#1f1e7a' },
    { title: 'Active Tasks', value: '8', icon: 'fas fa-tasks', color: '#f093fb' },
    { title: 'Completed', value: '24', icon: 'fas fa-check-circle', color: '#4facfe' },
    { title: 'Pending', value: '3', icon: 'fas fa-clock', color: '#43e97b' }
  ];

  const recentActivities = [
    { id: 1, action: 'New project created', project: 'Website Redesign', time: '2 hours ago' },
    { id: 2, action: 'Task completed', project: 'Mobile App', time: '4 hours ago' },
    { id: 3, action: 'File uploaded', project: 'Dashboard UI', time: '6 hours ago' },
    { id: 4, action: 'Comment added', project: 'API Integration', time: '1 day ago' }
  ];

  const projects = [
    { id: 1, name: 'Website Redesign', progress: 75, status: 'active', deadline: '2024-02-15' },
    { id: 2, name: 'Mobile App', progress: 45, status: 'active', deadline: '2024-03-01' },
    { id: 3, name: 'Dashboard UI', progress: 90, status: 'review', deadline: '2024-01-30' },
    { id: 4, name: 'API Integration', progress: 30, status: 'pending', deadline: '2024-02-28' }
  ];


  // Function to generate projects sub-sections with dynamic sources
  const generateProjectsSubSections = () => {
    const baseProjects = [
    ];
    
    // Add dynamic sources - filter out null/undefined sources and add null checks
    const dynamicSourceItems = dynamicSources
      .filter(source => source && source.name) // Filter out null/undefined sources
      .map((source, index) => ({
        id: `source_${index}`,
        name: source.name,
        icon: 'fas fa-file-code',
        isDynamic: true
      }));
    
    return [...baseProjects, ...dynamicSourceItems];
  };

  // Sub-sections for each main section
  const subSections = {
    overview: [
      { id: 'details', name: 'Details', icon: 'fas fa-info-circle' },
      { id: 'stats', name: 'Statistics', icon: 'fas fa-chart-bar' },
      { id: 'chat', name: 'Chat', icon: 'fas fa-comments' }
    ],
    projects: generateProjectsSubSections(),
    console: [
      { id: 'connect', name: 'Agents', icon: 'fas fa-terminal' }
    ],
    people: [
      { id: 'admins', name: 'Admins', icon: 'fas fa-user-shield' },
      { id: 'team', name: 'Team', icon: 'fas fa-users' }
    ],
    settings: [
      { id: 'profile', name: 'Profile', icon: 'fas fa-user' },
      { id: 'preferences', name: 'Preferences', icon: 'fas fa-cog' },
      { id: 'security', name: 'Security', icon: 'fas fa-lock' }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4facfe';
      case 'review': return '#f093fb';
      case 'pending': return '#43e97b';
      default: return '#1f1e7a';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'review': return 'Review';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!newSourceName.trim()) {
      errors.name = 'Source name is required';
    } else if (newSourceName.trim().length < 3) {
      errors.name = 'Source name must be at least 3 characters';
    } else if (newSourceName.trim().length > 50) {
      errors.name = 'Source name must be less than 50 characters';
    }
    
    if (!newSourcePath.trim()) {
      errors.path = 'Source path is required';
    } else if (newSourcePath.trim().length < 3) {
      errors.path = 'Source path must be at least 3 characters';
    }
    
    if (newSourceDescription.trim().length > 200) {
      errors.description = 'Description must be less than 200 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle adding new source
  const handleAddSource = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newSource = dataService.addSource({
        name: newSourceName.trim(),
        path: newSourcePath.trim(),
        type: newSourceType,
        description: newSourceDescription.trim(),
        settings: {
          encrypted: newSourceEncrypted,
          backup: newSourceBackup
        }
      });
      
      if (newSource) {
        setDynamicSources(prev => [...prev, newSource]);
        // Reset all form fields
        setNewSourceName('');
        setNewSourcePath('');
        setNewSourceType('file');
        setNewSourceDescription('');
        setNewSourceEncrypted(false);
        setNewSourceBackup(true);
        setFormErrors({});
        setShowAddSourceModal(false);
      } else {
        setFormErrors({ submit: 'Failed to add source. Please try again.' });
      }
    } catch (error) {
      console.error('Error adding source:', error);
      setFormErrors({ submit: 'An error occurred while adding the source.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowAddSourceModal(false);
    // Reset all form fields
    setNewSourceName('');
    setNewSourcePath('');
    setNewSourceType('file');
    setNewSourceDescription('');
    setNewSourceEncrypted(false);
    setNewSourceBackup(true);
    setFormErrors({});
    setIsSubmitting(false);
  };

  const parseCSV = (text) => {
    const lines = text.split('\n');
    const result = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const values = line.split(',').map(val => val.trim().replace(/"/g, ''));
        result.push(values);
      }
    }
    
    return result;
  };


  const generateQuickActions = async (headers, data) => {
    setIsGeneratingActions(true);
    try {
      const prompt = `This CSV data has ${headers.length} columns and ${data.length} rows. Columns: ${headers.join(', ')}. Suggest 5 useful quick actions for this data. For each action provide label, icon (FontAwesome), and description. Respond in JSON format.`;
      
      const response = await geminiApi(prompt);
      const actions = JSON.parse(response);
      setQuickActions(actions);
    } catch (error) {
      console.error('Quick actions generation failed:', error);
      setQuickActions([]);
    } finally {
      setIsGeneratingActions(false);
    }
  };

  const handleQuickAction = (action) => {
    setAiSearchQuery(action.description);
    handleAiSearch();
  };

  const exportToCSV = () => {
    const dataToExport = filteredData.length > 0 ? filteredData : csvData;
    const csvContent = [headers, ...dataToExport].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filtered_${fileName}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAiSearch = async () => {
    if (!aiSearchQuery.trim() || csvData.length === 0) return;
    
    setIsAiLoading(true);
    setAiError('');
    
    try {
      const prompt = `CSV data analysis: ${headers.join(', ')} columns. ${csvData.length} rows of data. User asks: "${aiSearchQuery}". Filter the data according to this question and return results. Return only matching rows as JSON array.`;
      
      const response = await geminiApi(prompt);
      const filtered = JSON.parse(response);
      setFilteredData(filtered);
    } catch (error) {
      console.error('AI search failed:', error);
      setAiError('AI search failed. Please try again.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGeneralAiSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const response = await geminiApi(searchQuery);
      setAiResponse(response);
    } catch (error) {
      console.error('General AI search failed:', error);
      setAiResponse('Could not get AI response. Please try again.');
    }
  };

  // Console session control functions
  const handleStartStopSession = () => {
    setIsSessionActive(!isSessionActive);
  };

  const handleRestartSession = () => {
    setIsSessionActive(false);
    // Add a small delay to show the restart effect
    setTimeout(() => {
      setIsSessionActive(true);
    }, 500);
  };

  const renderPage = () => {
    switch (activeSection) {
      case 'overview':
        // Handle overview subpages
        switch (activeSubSection) {
          case 'details':
            return <DetailPage />;
          case 'stats':
            return <OverviewStatistics />;
          case 'chat':
            return <ChatPage />;
          default:
            return <DetailPage />;
        }
      case 'projects':
        return <Sources />;
      case 'settings':
        // Handle settings subpages
        switch (activeSubSection) {
          case 'profile':
            return <SettingsProfile />;
          case 'preferences':
            return <SettingsPreferences />;
          case 'security':
            return <SettingsSecurity />;
          default:
            return <SettingsPage />;
        }
      case 'console':
        // Handle console subpages
        switch (activeSubSection) {
          case 'connect':
            return <ConsoleAgents />;
          default:
            return <ConsoleAgents />;
        }
      case 'people':
        // Handle people subpages
        switch (activeSubSection) {
          case 'admins':
            return <AdminsPage />;
          case 'team':
            return <TeamPage />;
          default:
            return <AdminsPage />;
        }
      default:
        return <DetailPage />;
    }
  };

  return (
    <>
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
      />
      
      <div className="dashboard">
        <Sidebar 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          activeSubSection={activeSubSection}
          setActiveSubSection={setActiveSubSection}
          subSections={subSections}
          onAddSource={() => setShowAddSourceModal(true)}
        />

        {/* Main Content Area */}
        <div className="main-content">
          <Topbar 
            activeSection={activeSection}
            activeSubSection={activeSubSection}
            subSections={subSections}
            user={user}
            onNavigateToWebsite={onNavigateToWebsite}
          />

          {/* Content Area */}
          <div className="content-area">
            {renderPage()}
          </div>
        </div>
      </div>

      {/* AI Response Section */}
      {aiResponse && (
        <div className="ai-response-section">
          <div className="ai-response-content">
            <div className="ai-response-header">
              <i className="fas fa-robot"></i>
              <span>AI Assistant</span>
              <button className="close-response" onClick={() => setAiResponse('')}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="ai-response-text">
              {aiResponse}
            </div>
          </div>
        </div>
      )}

      {/* Add Source Modal */}
      {showAddSourceModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content modern-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header modern-header">
              <div className="header-content">
                <div className="header-icon">
                  <i className="fas fa-plus-circle"></i>
                </div>
                <div className="header-text">
                  <h3>Add New Source</h3>
                  <p>Configure a new data source for your project</p>
                </div>
              </div>
              <button className="modal-close modern-close" onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body modern-body">
              <div className="form-section">
                <div className="form-group modern-group">
                  <label htmlFor="sourceName" className="modern-label">
                    <i className="fas fa-tag"></i>
                    Source Name
                  </label>
                  <input
                    id="sourceName"
                    type="text"
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSource()}
                    placeholder="Enter a descriptive name for your source..."
                    className="modern-input"
                    autoFocus
                  />
                  {newSourceName && (
                    <div className="input-hint">
                      <i className="fas fa-check-circle"></i>
                      Source name is valid
                    </div>
                  )}
                </div>

                <div className="form-group modern-group">
                  <label htmlFor="sourcePath" className="modern-label">
                    <i className="fas fa-folder-open"></i>
                    Path *
                  </label>
                  <input
                    id="sourcePath"
                    type="text"
                    value={newSourcePath}
                    onChange={(e) => setNewSourcePath(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSource()}
                    placeholder="Enter file path or URL..."
                    className="modern-input"
                  />
                  {newSourcePath && (
                    <div className="input-hint">
                      <i className="fas fa-check-circle"></i>
                      Path is valid
                    </div>
                  )}
                </div>

                <div className="form-group modern-group">
                  <label htmlFor="sourceType" className="modern-label">
                    <i className="fas fa-cog"></i>
                    Source Type
                  </label>
                  <select
                    id="sourceType"
                    value={newSourceType}
                    onChange={(e) => setNewSourceType(e.target.value)}
                    className="modern-select"
                  >
                    <option value="file">File Upload</option>
                    <option value="database">Database Connection</option>
                    <option value="api">API Endpoint</option>
                    <option value="stream">Data Stream</option>
                    <option value="manual">Manual Entry</option>
                  </select>
                </div>

                <div className="form-group modern-group">
                  <label htmlFor="sourceDescription" className="modern-label">
                    <i className="fas fa-align-left"></i>
                    Description (Optional)
                  </label>
                  <textarea
                    id="sourceDescription"
                    value={newSourceDescription}
                    onChange={(e) => setNewSourceDescription(e.target.value)}
                    placeholder="Describe what this source contains and how it will be used..."
                    className="modern-textarea"
                    rows="3"
                  />
                </div>

                <div className="form-group modern-group">
                  <label className="modern-label">
                    <i className="fas fa-shield-alt"></i>
                    Security Settings
                  </label>
                  <div className="checkbox-group">
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={newSourceEncrypted}
                        onChange={(e) => setNewSourceEncrypted(e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      <span className="checkbox-text">Encrypt sensitive data</span>
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={newSourceBackup}
                        onChange={(e) => setNewSourceBackup(e.target.checked)}
                      />
                      <span className="checkmark"></span>
                      <span className="checkbox-text">Enable automatic backup</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer modern-footer">
              <button className="btn-cancel modern-cancel" onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
                Cancel
              </button>
              <button 
                className="btn-add modern-add" 
                onClick={handleAddSource} 
                disabled={!newSourceName.trim() || !newSourcePath.trim()}
              >
                <i className="fas fa-plus"></i>
                Add Source
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dashboard {
          display: flex;
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .left-sidebar {
          width: 250px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-right: 1px solid rgba(255, 255, 255, 0.2);
          border-left: 0.75rem solid #1f1e7a;
          display: flex;
          flex-direction: column;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo {
          width: 40px;
          height: 40px;
          border-radius: 8px;
        }

        .brand-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
        }

        .zenarth-bold {
          font-weight: bold;
        }

        .ai-italic {
          font-weight: 500;
        }

        .sidebar-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          text-align: center;
          margin-top: auto;
        }

        .copyright {
          font-size: 0.9rem;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
        }

        .copyright-symbol {
          font-weight: 500;
        }

        .copyright-year {
          font-weight: 500;
        }

        .copyright-brand {
          font-weight: 600;
          color: #333;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
        }

        .nav-item {
          width: 100%;
          padding: 1rem 1.5rem;
          border: none;
          background: none;
          text-align: left;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #666;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .nav-item:hover {
          background: rgba(31, 30, 122, 0.1);
          color: #1f1e7a;
        }

        .nav-item.active {
          background: #1f1e7a;
          color: white;
          box-shadow: 0 2px 10px rgba(31, 30, 122, 0.3);
        }

        .nav-item i {
          width: 20px;
          text-align: center;
        }

        .sub-sidebar {
          width: 200px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-right: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          flex-direction: column;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
        }

        .sub-sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .sub-sidebar-header h3 {
          margin: 0;
          font-size: 1.1rem;
          color: #333;
          font-weight: 600;
        }

        .sub-nav {
          flex: 1;
          padding: 1rem 0;
        }

        .sub-nav-item {
          width: 100%;
          padding: 0.75rem 1.5rem;
          border: none;
          background: none;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #666;
          font-size: 0.9rem;
        }

        .sub-nav-item:hover {
          background: rgba(31, 30, 122, 0.1);
          color: #1f1e7a;
        }

        .sub-nav-item.active {
          background: rgba(31, 30, 122, 0.15);
          color: #1f1e7a;
          font-weight: 600;
        }

        .sub-nav-item i {
          width: 16px;
          text-align: center;
          font-size: 0.85rem;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: white;
          overflow: hidden;
        }

        .dashboard-header {
          padding: 1rem 2rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .page-title {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 700;
          color: #333;
        }

        .sub-title {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        .header-right {
          display: flex;
          align-items: center;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          background: rgba(31, 30, 122, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(31, 30, 122, 0.2);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #1f1e7a;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.1rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .user-name {
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
        }

        .user-email {
          font-size: 0.8rem;
          color: #666;
        }

        .logout-btn {
          padding: 0.5rem;
          border: none;
          background: rgba(31, 30, 122, 0.1);
          color: #1f1e7a;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: rgba(31, 30, 122, 0.2);
          transform: scale(1.05);
        }

        .content-area {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          margin: 0 0 0.25rem 0;
          font-size: 2rem;
          font-weight: 700;
          color: #333;
        }

        .stat-title {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .chart-section, .activities-section {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .chart-section h3, .activities-section h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-weight: 600;
        }

        .chart-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #999;
          background: rgba(31, 30, 122, 0.05);
          border-radius: 12px;
          border: 2px dashed rgba(31, 30, 122, 0.2);
        }

        .chart-placeholder i {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .activities-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(31, 30, 122, 0.05);
          border-radius: 8px;
        }

        .activity-icon {
          color: #1f1e7a;
          margin-top: 0.25rem;
        }

        .activity-content {
          flex: 1;
        }

        .activity-action {
          margin: 0 0 0.25rem 0;
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
        }

        .activity-project {
          margin: 0 0 0.25rem 0;
          color: #1f1e7a;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .activity-time {
          margin: 0;
          color: #999;
          font-size: 0.8rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .section-header h2 {
          margin: 0;
          color: #333;
          font-size: 1.75rem;
          font-weight: 700;
        }

        .btn-primary {
          background: #1f1e7a;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(31, 30, 122, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(31, 30, 122, 0.4);
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .project-card {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .project-card:hover {
          transform: translateY(-2px);
        }

        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .project-name {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
        }

        .project-status {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          color: white;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .project-progress {
          margin-bottom: 1rem;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(31, 30, 122, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: #1f1e7a;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        .project-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .project-deadline {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          font-size: 0.85rem;
        }

        .project-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .action-btn:first-child {
          background: rgba(31, 30, 122, 0.1);
          color: #1f1e7a;
        }

        .action-btn:last-child {
          padding: 0.5rem;
          border: none;
          background: rgba(31, 30, 122, 0.1);
          color: #1f1e7a;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn:last-child:hover {
          background: rgba(31, 30, 122, 0.2);
          transform: scale(1.05);
        }

        .action-btn:hover {
          transform: scale(1.1);
        }

        .tasks-placeholder, .team-placeholder, .settings-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: #999;
          background: rgba(31, 30, 122, 0.05);
          border-radius: 12px;
          border: 2px dashed rgba(31, 30, 122, 0.2);
        }

        .tasks-placeholder i, .team-placeholder i, .settings-placeholder i {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .analyze-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .analyze-header h2 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.75rem;
          font-weight: 700;
        }

        .analyze-header p {
          margin: 0;
          color: #666;
          font-size: 1rem;
        }

        .upload-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .upload-button {
          background: #1f1e7a;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(31, 30, 122, 0.3);
          font-size: 1rem;
        }

        .upload-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(31, 30, 122, 0.4);
        }

        .file-info {
          margin-top: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(31, 30, 122, 0.1);
          border-radius: 8px;
          color: #1f1e7a;
          font-weight: 500;
        }

        .ai-search-section {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .ai-search-section h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .search-container {
          display: flex;
          gap: 0.75rem;
        }

        .search-container input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 2px solid rgba(31, 30, 122, 0.2);
          border-radius: 8px;
          font-size: 0.95rem;
          transition: border-color 0.3s ease;
        }

        .search-container input:focus {
          outline: none;
          border-color: #1f1e7a;
        }

        .search-btn {
          background: #1f1e7a;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .search-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .search-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.2);
          border-radius: 8px;
          color: #dc3545;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .quick-actions-section {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .quick-actions-section h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .actions-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .loading-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(31, 30, 122, 0.05);
          border-radius: 8px;
          color: #1f1e7a;
          font-weight: 500;
        }

        .action-btn {
          padding: 0.75rem 1rem;
          background: rgba(31, 30, 122, 0.1);
          border: 1px solid rgba(31, 30, 122, 0.2);
          border-radius: 8px;
          color: #1f1e7a;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .action-btn:hover {
          background: rgba(31, 30, 122, 0.2);
          transform: translateY(-1px);
        }

        .data-table-section {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .table-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .table-header h3 {
          margin: 0;
          color: #333;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .result-count {
          font-size: 0.85rem;
          color: #1f1e7a;
          font-weight: 500;
        }

        .clear-filter-btn {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
          border: 1px solid rgba(220, 53, 69, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }

        .clear-filter-btn:hover {
          background: rgba(220, 53, 69, 0.2);
        }

        .table-container {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .data-table thead tr {
          background-color: #f8f9fa;
        }

        .data-table th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #dee2e6;
          font-size: 0.9rem;
        }

        .data-table tbody tr {
          border-bottom: 1px solid #dee2e6;
          transition: background-color 0.2s;
        }

        .data-table tbody tr:hover {
          background-color: #f8f9fa;
        }

        .data-table td {
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
          color: #555;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .table-footer {
          margin-top: 0.75rem;
        }

        .table-footer p {
          margin: 0;
          font-size: 0.75rem;
          color: #666;
          font-style: italic;
        }

        .filtered-indicator {
          margin-left: 0.5rem;
          color: #2d2bac;
        }

        .ai-response-section {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 400px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          overflow: hidden;
        }

        .ai-response-content {
          padding: 1.5rem;
        }

        .ai-response-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .ai-response-header span {
          font-weight: 600;
          color: #333;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .close-response {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .close-response:hover {
          background: rgba(0, 0, 0, 0.1);
          color: #333;
        }

        .ai-response-text {
          color: #555;
          line-height: 1.6;
          font-size: 0.9rem;
        }

        /* Console Styles */
        .console-section {
          padding: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
        }

        .console-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .console-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .console-title i {
          font-size: 1.5rem;
          color: #1f1e7a;
        }

        .console-title h2 {
          margin: 0;
          color: #1f1e7a;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .console-status {
          display: flex;
          align-items: center;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .status-indicator.online {
          background: #dcfce7;
          color: #166534;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .console-grid {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 1.5rem;
          padding: 1.5rem 2rem;
          overflow: hidden;
        }

        .console-main {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 400px;
        }

        .terminal-window {
          flex: 1;
          background: #1e1e1e;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
        }

        .terminal-header {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1rem;
          background: #2d2d2d;
          border-bottom: 1px solid #3d3d3d;
        }

        .terminal-title {
          color: #fff;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .terminal-body {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
        }

        .terminal-content {
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .terminal-line {
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .prompt {
          color: #4ade80;
          font-weight: 600;
        }

        .separator {
          color: #94a3b8;
        }

        .path {
          color: #3b82f6;
        }

        .command {
          color: #fbbf24;
        }

        .cursor {
          color: #fff;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .terminal-output {
          margin: 1rem 0;
        }

        .output-line {
          color: #d1d5db;
          margin-bottom: 0.25rem;
        }

        .console-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .agents-panel, .quick-actions-panel {
          background: white;
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .quick-actions-panel {
          flex-shrink: 0;
        }
        
        .agents-panel {
          flex-shrink: 0;
          max-height: 200px;
          overflow-y: auto;
        }

        .agents-panel h3, .quick-actions-panel h3 {
          margin: 0 0 1rem 0;
          color: #1f1e7a;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .agents-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .agent-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .agent-item:hover {
          background: #f1f5f9;
          transform: translateY(-1px);
        }

        .agent-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: #1f1e7a;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.1rem;
        }

        .agent-info {
          flex: 1;
        }

        .agent-name {
          font-weight: 600;
          color: #1f1e7a;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .agent-status {
          font-size: 0.8rem;
          font-weight: 500;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          display: inline-block;
        }

        .agent-status.online {
          background: #dcfce7;
          color: #166534;
        }

        .agent-status.offline {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .source-agent {
          border-left: 3px solid #1f1e7a;
          background: rgba(31, 30, 122, 0.05);
        }
        
        .source-agent .agent-icon {
          color: #1f1e7a;
        }

        .actions-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #1f1e7a;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
          justify-content: flex-start;
        }

        .action-btn:hover {
           background: #1f1e7a;
          color: white;
          border-color: #1f1e7a;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(31, 30, 122, 0.2);
        }

        .action-btn.active {
           background: #1f1e7a;
          color: white;
          border-color: #1f1e7a;
        }

        .action-btn.active:hover {
          background: #dc2626;
          border-color: #dc2626;
        }

        .action-btn i {
          color: #1f1e7a;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .console-grid {
            gap: 1rem;
            padding: 1rem;
          }
          
          .agents-panel, .quick-actions-panel {
            padding: 1rem;
          }
          
          .actions-list {
            flex-direction: column;
          }
          
          .terminal-body {
            padding: 0.75rem;
          }
          
          .terminal-content {
            font-size: 0.8rem;
          }
        }

        /* Modern Modal Styles */
        .modern-modal {
          max-width: 600px;
          width: 95%;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

         .modern-header {
           background: #1f1e7a;
           color: white;
           padding: 1.5rem 2rem;
           border-radius: 16px 16px 0 0;
           display: flex;
           justify-content: space-between;
           align-items: center;
         }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-icon {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .header-text h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .header-text p {
          margin: 0.25rem 0 0 0;
          opacity: 0.9;
          font-size: 0.9rem;
        }

        .modern-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.1rem;
        }

        .modern-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .modern-body {
          padding: 2rem;
          background: #fafbfc;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .modern-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .modern-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #374151;
          font-size: 0.95rem;
        }

         .modern-label i {
           color: #1f1e7a;
           width: 16px;
         }

        .modern-input, .modern-select, .modern-textarea {
          padding: 0.875rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          background: white;
        }

        .modern-input:focus, .modern-select:focus, .modern-textarea:focus {
          outline: none;
          border-color: #1f1e7a;
          box-shadow: 0 0 0 3px rgba(31, 30, 122, 0.1);
        }

        .modern-input.error, .modern-textarea.error {
          border-color: #dc2626;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }

        .modern-input.success {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .modern-textarea {
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
        }

        .input-hint {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #10b981;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .input-hint i {
          font-size: 0.9rem;
        }

        .required {
          color: #dc2626;
          margin-left: 0.25rem;
        }

        .char-count {
          margin-left: auto;
          font-size: 0.8rem;
          color: #6b7280;
          font-weight: 500;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #dc2626;
          font-size: 0.85rem;
          font-weight: 500;
          margin-top: 0.25rem;
        }

        .error-message i {
          font-size: 0.9rem;
        }

        .submit-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #dc2626;
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.2);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .submit-error i {
          font-size: 1rem;
        }

        .footer-buttons {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.75rem;
          border-radius: 8px;
          transition: background-color 0.3s ease;
        }

         .checkbox-item:hover {
           background: rgba(31, 30, 122, 0.05);
         }

        .checkbox-item input[type="checkbox"] {
          display: none;
        }

        .checkmark {
          width: 20px;
          height: 20px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
        }

        .checkbox-item input[type="checkbox"]:checked + .checkmark {
           background: #1f1e7a;
           border-color: #1f1e7a;
        }

        .checkbox-item input[type="checkbox"]:checked + .checkmark::after {
          content: '✓';
          color: white;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .checkbox-text {
          font-weight: 500;
          color: #374151;
        }

        .modern-footer {
          padding: 1.5rem 2rem;
          background: white;
          border-top: 1px solid #e5e7eb;
          border-radius: 0 0 16px 16px;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        .modern-cancel, .modern-add {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .modern-cancel {
          background: #f3f4f6;
          color: #6b7280;
          border: 1px solid #d1d5db;
        }

        .modern-cancel:hover {
          background: #e5e7eb;
          color: #374151;
          transform: translateY(-1px);
        }

         .modern-add {
           background: #1f1e7a;
           color: white;
           box-shadow: 0 4px 15px rgba(31, 30, 122, 0.3);
         }

        .modern-add:hover:not(:disabled) {
          transform: translateY(-2px);
           box-shadow: 0 6px 20px rgba(31, 30, 122, 0.4);
        }

        .modern-add:disabled {
          background: #d1d5db;
          color: #9ca3af;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        @media (max-width: 768px) {
          .modern-modal {
            width: 98%;
            margin: 1rem;
          }
          
          .modern-header {
            padding: 1rem 1.5rem;
          }
          
          .modern-body {
            padding: 1.5rem;
          }
          
          .modern-footer {
            padding: 1rem 1.5rem;
          }
          
          .footer-buttons {
            flex-direction: column;
          }
          
          .modern-cancel, .modern-add {
            width: 100%;
            justify-content: center;
          }
        }


        @media (max-width: 992px) {
          .sub-sidebar {
            width: 150px;
          }
        }

        @media (max-width: 768px) {
          .left-sidebar {
            width: 180px;
            border-left: 0.75rem solid #1f1e7a;
          }
          
          .sub-sidebar {
            width: 120px;
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }

          .user-info {
            display: none;
          }


          .ai-response-section {
            width: 95%;
            bottom: 6rem;
          }

          .ai-response-text {
            padding: 1rem;
            font-size: 0.9rem;
          }

          .search-container {
            flex-direction: column;
          }

          .actions-container {
            flex-direction: column;
            align-items: stretch;
          }

          .action-btn {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default Dashboard;
