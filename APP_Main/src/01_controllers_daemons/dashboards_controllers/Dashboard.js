import React, { useState } from 'react';
import { geminiApi } from '../../02_softwares_daemons/geminis_softwares';
import Sidebar from '../../02_softwares_daemons/components/Sidebar';
import Topbar from '../../02_softwares_daemons/components/Topbar';
import {
  OverviewStatistics,
  ChatPage,
  DetailPage
} from './Overview';

import {
  ProjectsPage,
  Project3,
  Project4,
  Project5,
  Project6,
  ProjectsSubPage1,
  TasksPage,
  TeamPage,
  AdminsPage
} from './Projects';

import {
  SettingsPage,
  SettingsProfile,
  SettingsPreferences,
  SettingsSecurity
} from './Settings';


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
  
  // Load user sources from localStorage
  React.useEffect(() => {
    const storedSources = JSON.parse(localStorage.getItem('userSources') || '[]');
    setDynamicSources(storedSources);
  }, []);

  // Listen for storage changes to update sources list
  React.useEffect(() => {
    const handleStorageChange = () => {
      const storedSources = JSON.parse(localStorage.getItem('userSources') || '[]');
      setDynamicSources(storedSources);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
      { id: 'main_log', name: 'main_log.txt', icon: 'fas fa-file-alt' },
      { id: 'project3', name: 'Code Debugger', icon: 'fas fa-bug' }
    ];
    
    // Add dynamic sources
    const dynamicSourceItems = dynamicSources.map((source, index) => ({
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
      { id: 'charts', name: 'Charts', icon: 'fas fa-chart-line' },
      { id: 'activities', name: 'Activities', icon: 'fas fa-history' },
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

  // Handle adding new source
  const handleAddSource = () => {
    if (newSourceName.trim()) {
      const newSource = {
        id: Date.now(),
        name: newSourceName.trim(),
        createdAt: new Date().toISOString()
      };
      setDynamicSources(prev => [...prev, newSource]);
      
      // Save to user cache (localStorage)
      const storedSources = JSON.parse(localStorage.getItem('userSources') || '[]');
      storedSources.push(newSource);
      localStorage.setItem('userSources', JSON.stringify(storedSources));
      
      // Trigger storage event to update other components
      window.dispatchEvent(new Event('storage'));
      
      setNewSourceName('');
      setShowAddSourceModal(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowAddSourceModal(false);
    setNewSourceName('');
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
        // Handle projects subpages
        if (activeSubSection === 'main_log') {
          return <Project5 />;
        } else if (activeSubSection === 'project3') {
          return <Project3 />;
        } else if (activeSubSection.startsWith('source_')) {
          const sourceIndex = parseInt(activeSubSection.replace('source_', ''));
          const source = dynamicSources[sourceIndex];
          return (
            <div className="source-section">
              <h2>{source?.name || 'Source'}</h2>
              <div className="source-content">
                <p>Source content will be displayed here.</p>
                <div className="source-info">
                  <p><strong>Name:</strong> {source?.name}</p>
                  <p><strong>Created:</strong> {source?.createdAt ? new Date(source.createdAt).toLocaleString() : 'Unknown'}</p>
                </div>
              </div>
            </div>
          );
        }
        return <Project5 />;
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
            return <div className="console-section">
              <div className="console-header">
                <div className="console-title">
                  <i className="fas fa-terminal"></i>
                  <h2>Agents Console</h2>
                </div>
                <div className="console-status">
                  <div className="status-indicator online">
                    <div className="status-dot"></div>
                    <span>Connected</span>
                  </div>
                </div>
              </div>
              
              <div className="console-grid">
                <div className="console-main">
                  <div className="terminal-window">
                    <div className="terminal-header">
                      <div className="terminal-controls">
                        <div className="control-btn close"></div>
                        <div className="control-btn minimize"></div>
                        <div className="control-btn maximize"></div>
                      </div>
                      <div className="terminal-title">Zenarth Console</div>
                    </div>
                    <div className="terminal-body">
                      <div className="terminal-content">
                        <div className="terminal-line">
                          <span className="prompt">user@zenarth.ai</span>
                          <span className="separator">:</span>
                          <span className="path">~/console</span>
                          <span className="separator">$</span>
                          <span className="command">welcome</span>
                        </div>
                        <div className="terminal-output">
                          <div className="output-line">Welcome to Zenarth Console</div>
                          <div className="output-line">Console connection interface will be implemented here.</div>
                          <div className="output-line">Type 'help' for available commands</div>
                        </div>
                        <div className="terminal-line current">
                          <span className="prompt">user@zenarth.ai</span>
                          <span className="separator">:</span>
                          <span className="path">~/console</span>
                          <span className="separator">$</span>
                          <span className="cursor">_</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="console-sidebar">
                  <div className="agents-panel">
                    <h3>Available Agents</h3>
                    <div className="agents-list">
                      <div className="agent-item">
                        <div className="agent-icon">
                          <i className="fas fa-robot"></i>
                        </div>
                        <div className="agent-info">
                          <div className="agent-name">AI Assistant</div>
                          <div className="agent-status online">Online</div>
                        </div>
                      </div>
                      <div className="agent-item">
                        <div className="agent-icon">
                          <i className="fas fa-code"></i>
                        </div>
                        <div className="agent-info">
                          <div className="agent-name">Code Analyzer</div>
                          <div className="agent-status online">Online</div>
                        </div>
                      </div>
                      <div className="agent-item">
                        <div className="agent-icon">
                          <i className="fas fa-database"></i>
                        </div>
                        <div className="agent-info">
                          <div className="agent-name">Data Processor</div>
                          <div className="agent-status offline">Offline</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="quick-actions-panel">
                    <h3>Quick Actions</h3>
                    <div className="actions-list">
                      <button className="action-btn">
                        <i className="fas fa-play"></i>
                        <span>Start Session</span>
                      </button>
                      <button className="action-btn">
                        <i className="fas fa-stop"></i>
                        <span>Stop Session</span>
                      </button>
                      <button className="action-btn">
                        <i className="fas fa-history"></i>
                        <span>View History</span>
                      </button>
                      <button className="action-btn">
                        <i className="fas fa-cog"></i>
                        <span>Settings</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>;
          default:
            return <div className="console-section">
              <div className="console-header">
                <div className="console-title">
                  <i className="fas fa-terminal"></i>
                  <h2>Agents Console</h2>
                </div>
                <div className="console-status">
                  <div className="status-indicator online">
                    <div className="status-dot"></div>
                    <span>Connected</span>
                  </div>
                </div>
              </div>
              
              <div className="console-grid">
                <div className="console-main">
                  <div className="terminal-window">
                    <div className="terminal-header">
                      <div className="terminal-controls">
                        <div className="control-btn close"></div>
                        <div className="control-btn minimize"></div>
                        <div className="control-btn maximize"></div>
                      </div>
                      <div className="terminal-title">Zenarth Console</div>
                    </div>
                    <div className="terminal-body">
                      <div className="terminal-content">
                        <div className="terminal-line">
                          <span className="prompt">user@zenarth.ai</span>
                          <span className="separator">:</span>
                          <span className="path">~/console</span>
                          <span className="separator">$</span>
                          <span className="command">welcome</span>
                        </div>
                        <div className="terminal-output">
                          <div className="output-line">Welcome to Zenarth Console</div>
                          <div className="output-line">Console connection interface will be implemented here.</div>
                          <div className="output-line">Type 'help' for available commands</div>
                        </div>
                        <div className="terminal-line current">
                          <span className="prompt">user@zenarth.ai</span>
                          <span className="separator">:</span>
                          <span className="path">~/console</span>
                          <span className="separator">$</span>
                          <span className="cursor">_</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="console-sidebar">
                  <div className="agents-panel">
                    <h3>Available Agents</h3>
                    <div className="agents-list">
                      <div className="agent-item">
                        <div className="agent-icon">
                          <i className="fas fa-robot"></i>
                        </div>
                        <div className="agent-info">
                          <div className="agent-name">AI Assistant</div>
                          <div className="agent-status online">Online</div>
                        </div>
                      </div>
                      <div className="agent-item">
                        <div className="agent-icon">
                          <i className="fas fa-code"></i>
                        </div>
                        <div className="agent-info">
                          <div className="agent-name">Code Analyzer</div>
                          <div className="agent-status online">Online</div>
                        </div>
                      </div>
                      <div className="agent-item">
                        <div className="agent-icon">
                          <i className="fas fa-database"></i>
                        </div>
                        <div className="agent-info">
                          <div className="agent-name">Data Processor</div>
                          <div className="agent-status offline">Offline</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="quick-actions-panel">
                    <h3>Quick Actions</h3>
                    <div className="actions-list">
                      <button className="action-btn">
                        <i className="fas fa-play"></i>
                        <span>Start Session</span>
                      </button>
                      <button className="action-btn">
                        <i className="fas fa-stop"></i>
                        <span>Stop Session</span>
                      </button>
                      <button className="action-btn">
                        <i className="fas fa-history"></i>
                        <span>View History</span>
                      </button>
                      <button className="action-btn">
                        <i className="fas fa-cog"></i>
                        <span>Settings</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>;
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Source</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <label htmlFor="sourceName">Source Name:</label>
              <input
                id="sourceName"
                type="text"
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSource()}
                placeholder="Enter source name..."
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="btn-add" onClick={handleAddSource} disabled={!newSourceName.trim()}>
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
          background: linear-gradient(135deg, #1f1e7a, #1f1e7a);
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
          padding: 1.5rem 2rem;
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
          background: linear-gradient(135deg, #1f1e7a, #1f1e7a);
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
          background: linear-gradient(135deg, #1f1e7a, #1f1e7a);
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
          background: linear-gradient(135deg, #1f1e7a, #1f1e7a);
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
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
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
          background: linear-gradient(135deg, #1f1e7a, #1f1e7a);
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
          background: linear-gradient(135deg, #1f1e7a, #1f1e7a);
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
          padding: 0.75rem 1rem;
          background: #2d2d2d;
          border-bottom: 1px solid #3d3d3d;
        }

        .terminal-controls {
          display: flex;
          gap: 0.5rem;
          margin-right: 1rem;
        }

        .control-btn {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .control-btn.close {
          background: #ff5f57;
        }

        .control-btn.minimize {
          background: #ffbd2e;
        }

        .control-btn.maximize {
          background: #28ca42;
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
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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
          background: linear-gradient(135deg, #1f1e7a, #3b82f6);
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

        .actions-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #1f1e7a;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .action-btn:hover {
          background: #f1f5f9;
          border-color: #1f1e7a;
          transform: translateY(-1px);
        }

        .action-btn i {
          color: #1f1e7a;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .console-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
            padding: 1rem;
          }
          
          .console-sidebar {
            order: -1;
          }
          
          .agents-panel, .quick-actions-panel {
            padding: 1rem;
          }
          
          .terminal-body {
            padding: 0.75rem;
          }
          
          .terminal-content {
            font-size: 0.8rem;
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
