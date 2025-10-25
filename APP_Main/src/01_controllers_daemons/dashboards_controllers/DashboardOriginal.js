import React, { useState } from 'react';
import { geminiApi } from '../../02_softwares_daemons/geminis_softwares';
import logo from '../../05_loaders_daemons/zenarth.png';

const Dashboard = ({ onNavigateToWebsite }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [activeSubSection, setActiveSubSection] = useState('stats');
  const [user, setUser] = useState({
    name: 'Kullanıcı',
    email: 'user@zenarth.ai',
    avatar: null
  });

  // CSV Analysis states
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
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

  const stats = [
    { title: 'Toplam Projeler', value: '12', icon: 'fas fa-folder', color: '#1f1e7a' },
    { title: 'Aktif Görevler', value: '8', icon: 'fas fa-tasks', color: '#f093fb' },
    { title: 'Tamamlanan', value: '24', icon: 'fas fa-check-circle', color: '#4facfe' },
    { title: 'Bekleyen', value: '3', icon: 'fas fa-clock', color: '#43e97b' }
  ];

  const recentActivities = [
    { id: 1, action: 'Yeni proje oluşturuldu', project: 'Website Redesign', time: '2 saat önce' },
    { id: 2, action: 'Görev tamamlandı', project: 'Mobile App', time: '4 saat önce' },
    { id: 3, action: 'Dosya yüklendi', project: 'Dashboard UI', time: '6 saat önce' },
    { id: 4, action: 'Yorum eklendi', project: 'API Integration', time: '1 gün önce' }
  ];

  const projects = [
    { id: 1, name: 'Website Redesign', progress: 75, status: 'active', deadline: '2024-02-15' },
    { id: 2, name: 'Mobile App', progress: 45, status: 'active', deadline: '2024-03-01' },
    { id: 3, name: 'Dashboard UI', progress: 90, status: 'review', deadline: '2024-01-30' },
    { id: 4, name: 'API Integration', progress: 30, status: 'pending', deadline: '2024-02-28' }
  ];

  // Sub-sections for each main section
  const subSections = {
    overview: [
      { id: 'stats', name: 'İstatistikler', icon: 'fas fa-chart-bar' },
      { id: 'charts', name: 'Grafikler', icon: 'fas fa-chart-line' },
      { id: 'activities', name: 'Aktiviteler', icon: 'fas fa-history' }
    ],
    projects: [
      { id: 'all', name: 'Tüm Projeler', icon: 'fas fa-folder' },
      { id: 'active', name: 'Aktif Projeler', icon: 'fas fa-play' },
      { id: 'completed', name: 'Tamamlanan', icon: 'fas fa-check' },
      { id: 'archived', name: 'Arşivlenen', icon: 'fas fa-archive' }
    ],
    tasks: [
      { id: 'my-tasks', name: 'Görevlerim', icon: 'fas fa-tasks' },
      { id: 'assigned', name: 'Atanan', icon: 'fas fa-user-plus' },
      { id: 'completed', name: 'Tamamlanan', icon: 'fas fa-check-circle' },
      { id: 'overdue', name: 'Geciken', icon: 'fas fa-exclamation-triangle' }
    ],
    team: [
      { id: 'members', name: 'Üyeler', icon: 'fas fa-users' },
      { id: 'roles', name: 'Roller', icon: 'fas fa-user-tag' },
      { id: 'permissions', name: 'İzinler', icon: 'fas fa-shield-alt' }
    ],
    analyze: [
      { id: 'data-upload', name: 'Veri Yükle', icon: 'fas fa-upload' },
      { id: 'ai-analysis', name: 'AI Analiz', icon: 'fas fa-robot' },
      { id: 'reports', name: 'Raporlar', icon: 'fas fa-file-alt' }
    ],
    settings: [
      { id: 'profile', name: 'Profil', icon: 'fas fa-user' },
      { id: 'preferences', name: 'Tercihler', icon: 'fas fa-cog' },
      { id: 'security', name: 'Güvenlik', icon: 'fas fa-lock' }
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
      case 'active': return 'Aktif';
      case 'review': return 'İnceleme';
      case 'pending': return 'Bekliyor';
      default: return 'Bilinmiyor';
    }
  };

  // CSV Analysis functions
  const parseCSV = (text) => {
    const lines = text.split('\n');
    const parsedData = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        // Simple CSV parsing - handles basic cases
        const values = line.split(',').map(value => value.trim().replace(/^"|"$/g, ''));
        parsedData.push(values);
      }
    }
    
    return parsedData;
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const parsedData = parseCSV(text);
        
        if (parsedData.length > 0) {
          setHeaders(parsedData[0]);
          setCsvData(parsedData.slice(1));
          setFilteredData([]);
          
          // Generate quick actions based on CSV structure
          await generateQuickActions(parsedData[0], parsedData.slice(1));
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = handleFileSelect;
    input.click();
  };

  const generateQuickActions = async (headers, data) => {
    setIsGeneratingActions(true);
    try {
      const actions = await geminiApi.generateQuickActions(headers, data);
      setQuickActions(actions);
    } catch (error) {
      console.error('Error generating quick actions:', error);
      // Use default actions if API fails
      setQuickActions(geminiApi.getDefaultQuickActions());
    } finally {
      setIsGeneratingActions(false);
    }
  };

  const handleQuickAction = (action) => {
    let result = [];
    
    switch (action.action) {
      case 'sort_asc':
        result = [...csvData].sort((a, b) => {
          const firstValue = a[0] || '';
          const secondValue = b[0] || '';
          return firstValue.toString().localeCompare(secondValue.toString());
        });
        break;
        
      case 'sort_desc':
        result = [...csvData].sort((a, b) => {
          const firstValue = a[0] || '';
          const secondValue = b[0] || '';
          return secondValue.toString().localeCompare(firstValue.toString());
        });
        break;
        
      case 'top_10':
        result = csvData.slice(0, 10);
        break;
        
      case 'bottom_10':
        result = csvData.slice(-10);
        break;
        
      case 'remove_empty':
        result = csvData.filter(row => row.some(cell => cell && cell.trim() !== ''));
        break;
        
      case 'find_duplicates':
        const seen = new Set();
        const duplicates = [];
        csvData.forEach((row, index) => {
          const rowKey = row.join('|');
          if (seen.has(rowKey)) {
            duplicates.push(row);
          } else {
            seen.add(rowKey);
          }
        });
        result = duplicates;
        break;
        
      case 'export_csv':
        exportToCSV();
        return;
        
      case 'reset_view':
        setFilteredData([]);
        return;
        
      default:
        // Try to find a column that matches the action
        const columnIndex = headers.findIndex(header => 
          header.toLowerCase().includes(action.action.toLowerCase()) ||
          action.action.toLowerCase().includes(header.toLowerCase())
        );
        
        if (columnIndex !== -1) {
          // Sort by the found column
          result = [...csvData].sort((a, b) => {
            const aVal = a[columnIndex] || '';
            const bVal = b[columnIndex] || '';
            return aVal.toString().localeCompare(bVal.toString());
          });
        } else {
          result = csvData;
        }
    }
    
    setFilteredData(result);
  };

  const exportToCSV = () => {
    const dataToExport = filteredData.length > 0 ? filteredData : csvData;
    const csvContent = [headers, ...dataToExport]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace('.csv', '')}_exported.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAiSearch = async () => {
    if (!aiSearchQuery.trim()) {
      setAiError('Please enter a search query first!');
      return;
    }

    if (csvData.length === 0) {
      setAiError('Please upload a CSV file first!');
      return;
    }

    setIsAiLoading(true);
    setAiError('');

    try {
      const generatedCode = await geminiApi.generateFilterCode(
        aiSearchQuery, 
        headers, 
        csvData
      );

      // Execute the generated code
      const filterFunction = new Function('csvData', 'headers', `
        ${generatedCode}
      `);

      const result = filterFunction(csvData, headers);
      
      if (result && Array.isArray(result)) {
        setFilteredData(result);
        setAiError('');
      } else if (result && result.error) {
        setAiError(result.error);
      } else {
        setFilteredData([]);
        setAiError('No results found for your query.');
      }

    } catch (error) {
      console.error('AI Search Error:', error);
      setAiError(`AI Search failed: ${error.message}`);
      setFilteredData([]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // General AI Search function
  const handleGeneralAiSearch = async () => {
    if (!searchQuery.trim()) {
      setAiError('Please enter a search query first!');
      return;
    }

    setIsAiLoading(true);
    setAiError('');

    try {
      const response = await geminiApi.generateContent({
        contents: [{
          parts: [{
            text: `You are a helpful AI assistant. Please provide a helpful and informative response to this query: "${searchQuery}"`
          }]
        }]
      });

      if (response && response.response && response.response.text) {
        setAiResponse(response.response.text);
      } else {
        setAiError('Failed to get AI response. Please try again.');
      }
    } catch (error) {
      console.error('AI Search Error:', error);
      setAiError('Failed to process your request. Please try again.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
      />
      
      <div className="dashboard">
        {/* Left Sidebar - Main Pages */}
        <div className="left-sidebar">
          <div className="sidebar-header">
            <img src={logo} alt="Zenarth" className="logo" />
            <span className="brand-name">Zenarth</span>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('overview');
                setActiveSubSection('');
              }}
            >
              <i className="fas fa-chart-pie"></i>
              <span>Genel Bakış</span>
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'projects' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('projects');
                setActiveSubSection('');
              }}
            >
              <i className="fas fa-folder"></i>
              <span>Projeler</span>
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'tasks' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('tasks');
                setActiveSubSection('');
              }}
            >
              <i className="fas fa-tasks"></i>
              <span>Görevler</span>
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'team' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('team');
                setActiveSubSection('');
              }}
            >
              <i className="fas fa-users"></i>
              <span>Takım</span>
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'analyze' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('analyze');
                setActiveSubSection('');
              }}
            >
              <i className="fas fa-chart-line"></i>
              <span>Analiz</span>
            </button>
            
            
            <button 
              className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('settings');
                setActiveSubSection('');
              }}
            >
              <i className="fas fa-cog"></i>
              <span>Ayarlar</span>
            </button>
          </nav>
        </div>

        {/* Second Left Sidebar - Page */}
        <div className="sub-sidebar">
          <div className="sub-sidebar-header">
            <h3>Alt Sayfalar</h3>
          </div>
          
          <nav className="sub-nav">
            {subSections[activeSection]?.map(subSection => (
              <button 
                key={subSection.id}
                className={`sub-nav-item ${activeSubSection === subSection.id ? 'active' : ''}`}
                onClick={() => setActiveSubSection(subSection.id)}
              >
                <i className={subSection.icon}></i>
                <span>{subSection.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {/* Header */}
          <header className="dashboard-header">
            <div className="header-left">
              <h1 className="page-title">
                {activeSection === 'overview' && 'Genel Bakış'}
                {activeSection === 'projects' && 'Projeler'}
                {activeSection === 'tasks' && 'Görevler'}
                {activeSection === 'team' && 'Takım'}
                {activeSection === 'analyze' && 'Veri Analizi'}
                {activeSection === 'settings' && 'Ayarlar'}
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

          {/* Content Area */}
          <div className="content-area">
            {activeSection === 'overview' && (
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
                    <h3>Proje İlerlemesi</h3>
                    <div className="chart-placeholder">
                      <i className="fas fa-chart-bar"></i>
                      <p>Grafik burada görünecek</p>
                    </div>
                  </div>
                  
                  <div className="activities-section">
                    <h3>Son Aktiviteler</h3>
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
            )}

            {activeSection === 'projects' && (
              <div className="projects-section">
                <div className="section-header">
                  <h2>Projelerim</h2>
                  <button className="btn-primary">
                    <i className="fas fa-plus"></i>
                    Yeni Proje
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
            )}

            {activeSection === 'tasks' && (
              <div className="tasks-section">
                <h2>Görevlerim</h2>
                <div className="tasks-placeholder">
                  <i className="fas fa-tasks"></i>
                  <p>Görev yönetimi burada olacak</p>
                </div>
              </div>
            )}

            {activeSection === 'team' && (
              <div className="team-section">
                <h2>Takım Üyeleri</h2>
                <div className="team-placeholder">
                  <i className="fas fa-users"></i>
                  <p>Takım yönetimi burada olacak</p>
                </div>
              </div>
            )}

            {activeSection === 'analyze' && (
              <div className="analyze-section">
                <div className="analyze-header">
                  <h2>Veri Analizi</h2>
                  <p>CSV dosyalarınızı yükleyin ve AI ile analiz edin</p>
                </div>

                <div className="analyze-content">
                  <div className="upload-section">
                    <button 
                      className="upload-button"
                      onClick={handleFileUpload}
                    >
                      <i className="fas fa-file-csv"></i>
                      CSV Dosyası Yükle
                    </button>
                    {fileName && (
                      <div className="file-info">
                        <i className="fas fa-file"></i>
                        <span>{fileName}</span>
                      </div>
                    )}
                  </div>

                  {csvData.length > 0 && (
                    <>
                      {/* AI Search Section */}
                      <div className="ai-search-section">
                        <h3>
                          <i className="fas fa-robot"></i>
                          AI Veri Asistanı
                        </h3>
                        <div className="search-container">
                          <input
                            type="text"
                            placeholder="En iyisini bul"
                            value={aiSearchQuery}
                            onChange={(e) => setAiSearchQuery(e.target.value)}
                            disabled={isAiLoading}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !isAiLoading) {
                                handleAiSearch();
                              }
                            }}
                          />
                          <button
                            onClick={handleAiSearch}
                            disabled={isAiLoading}
                            className="search-btn"
                          >
                            {isAiLoading ? (
                              <>
                                <i className="fas fa-spinner fa-spin"></i>
                                İşleniyor...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-search"></i>
                                Ara
                              </>
                            )}
                          </button>
                        </div>
                        
                        {aiError && (
                          <div className="error-message">
                            <i className="fas fa-exclamation-triangle"></i>
                            {aiError}
                          </div>
                        )}
                      </div>

                      {/* Quick Actions Section */}
                      <div className="quick-actions-section">
                        <h3>
                          Hızlı İşlemler
                          {isGeneratingActions && (
                            <i className="fas fa-spinner fa-spin"></i>
                          )}
                        </h3>
                        <div className="actions-container">
                          {isGeneratingActions ? (
                            <div className="loading-actions">
                              <i className="fas fa-robot"></i>
                              AI verileriniz için akıllı işlemler oluşturuyor...
                            </div>
                          ) : (
                            quickActions.map((action, index) => (
                              <button
                                key={index}
                                onClick={() => handleQuickAction(action)}
                                title={action.description}
                                className="action-btn"
                              >
                                <i className={action.icon}></i>
                                {action.label}
                              </button>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Data Table Section */}
                      <div className="data-table-section">
                        <div className="table-header">
                          <h3>
                            {filteredData.length > 0 ? 'AI Filtrelenmiş Sonuçlar' : 'CSV Verisi'}: {fileName}
                            {filteredData.length > 0 && (
                              <span className="result-count">
                                ({filteredData.length} / {csvData.length} satır)
                              </span>
                            )}
                          </h3>
                          {filteredData.length > 0 && (
                            <button
                              onClick={() => setFilteredData([])}
                              className="clear-filter-btn"
                            >
                              <i className="fas fa-times"></i>
                              Filtreyi Temizle
                            </button>
                          )}
                        </div>
                        
                        <div className="table-container">
                          <table className="data-table">
                            <thead>
                              <tr>
                                {headers.map((header, index) => (
                                  <th key={index}>{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(filteredData.length > 0 ? filteredData : csvData).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {row.map((cell, cellIndex) => (
                                    <td key={cellIndex}>{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="table-footer">
                          <p>
                            {filteredData.length > 0 ? filteredData.length : csvData.length} satır, {headers.length} sütun gösteriliyor
                            {filteredData.length > 0 && (
                              <span className="filtered-indicator">
                                (AI ile filtrelendi)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}


            {activeSection === 'settings' && (
              <div className="settings-section">
                <h2>Ayarlar</h2>
                <div className="settings-placeholder">
                  <i className="fas fa-cog"></i>
                  <p>Kullanıcı ayarları burada olacak</p>
                </div>
              </div>
            )}
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

      {/* Floating AI Search Box */}
      <div className="floating-search">
        <div className="search-box">
          <i className="fas fa-magic"></i>
          <input 
            type="text" 
            placeholder={isAiLoading ? "AI is thinking..." : "Ask AI anything..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isAiLoading && handleGeneralAiSearch()}
            disabled={isAiLoading}
          />
          <button className="ai-search-btn" onClick={handleGeneralAiSearch} disabled={isAiLoading}>
            {isAiLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
          </button>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          display: flex;
          min-height: 100vh;
          background-color: #f8f9fa;
        }

        .left-sidebar {
          width: 200px;
          background: #2a2880;
          color: white;
          display: flex;
          flex-direction: column;
        }

        .sub-sidebar {
          width: 200px;
          background: #3a3780;
          color: white;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(255,255,255,0.1);
        }


        .sidebar-header {
          padding: 2rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .logo {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }

        .brand-name {
          font-size: 1.5rem;
          font-weight: bold;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
        }

        .nav-item {
          width: 100%;
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          color: white;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .nav-item:hover {
          background-color: rgba(255,255,255,0.1);
        }

        .nav-item.active {
          background-color: rgba(255,255,255,0.2);
          border-right: 3px solid white;
        }

        .nav-item i {
          width: 20px;
          text-align: center;
        }

        .sub-sidebar-header {
          padding: 1.5rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .sub-sidebar-header h3 {
          margin: 0;
          font-size: 1rem;
          color: rgba(255,255,255,0.8);
        }

        .sub-nav {
          flex: 1;
          padding: 1rem 0;
        }

        .sub-nav-item {
          width: 100%;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          color: rgba(255,255,255,0.7);
          text-align: left;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.9rem;
        }

        .sub-nav-item:hover {
          background-color: rgba(255,255,255,0.1);
          color: white;
        }

        .sub-nav-item.active {
          background-color: rgba(255,255,255,0.2);
          color: white;
          border-right: 3px solid white;
        }

        .sub-nav-item i {
          width: 16px;
          text-align: center;
          font-size: 0.8rem;
        }

        .sub-title {
          margin-left: 1rem;
          color: #666;
          font-size: 0.9rem;
          font-weight: normal;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }


        .dashboard-header {
          background: white;
          padding: 1rem 2rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .page-title {
          margin: 0;
          color: #333;
          font-size: 1.8rem;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .floating-search {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          animation: floatUp 0.6s ease-out;
        }

        @keyframes floatUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }

        .floating-search .search-box {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 16px;
          box-shadow: 
            0 8px 32px rgba(45, 43, 172, 0.15),
            0 2px 8px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          padding: 0.75rem;
          min-width: 450px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .floating-search .search-box:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 12px 40px rgba(45, 43, 172, 0.2),
            0 4px 12px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .floating-search .search-box:focus-within {
          transform: translateY(-3px);
          box-shadow: 
            0 16px 48px rgba(45, 43, 172, 0.25),
            0 6px 16px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.9),
            0 0 0 3px rgba(45, 43, 172, 0.1);
        }

        .floating-search .search-box:has(input:disabled) {
          opacity: 0.8;
          cursor: not-allowed;
          transform: none;
        }

        .floating-search .search-box:has(input:disabled):hover {
          transform: none;
          box-shadow: 
            0 8px 32px rgba(45, 43, 172, 0.15),
            0 2px 8px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .floating-search .search-box i {
          position: absolute;
          left: 1.25rem;
          color: #2d2bac;
          font-size: 1.1rem;
          z-index: 1;
          transition: all 0.3s ease;
        }

        .floating-search .search-box:focus-within i {
          color: #1a1a7a;
          transform: scale(1.1);
        }

        .floating-search .search-box:has(input:disabled) i {
          color: #ccc;
          transform: none;
        }

        .floating-search .search-box input {
          padding: 0.875rem 1.25rem 0.875rem 3rem;
          border: none;
          border-radius: 12px;
          width: 100%;
          font-size: 1rem;
          background: transparent;
          outline: none;
          color: #333;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .floating-search .search-box input:focus {
          outline: none;
          color: #1a1a7a;
        }

        .floating-search .search-box input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          color: #999;
        }

        .floating-search .search-box input::placeholder {
          color: #999;
          font-weight: 400;
          transition: all 0.3s ease;
        }

        .floating-search .search-box:focus-within input::placeholder {
          color: #bbb;
          transform: translateX(2px);
        }

        .floating-search .search-box input:disabled::placeholder {
          color: #ccc;
          transform: none;
        }

        .ai-search-btn {
          position: absolute;
          right: 0.75rem;
          background: linear-gradient(135deg, #2d2bac 0%, #1a1a7a 100%);
          border: none;
          border-radius: 10px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
          box-shadow: 0 4px 12px rgba(45, 43, 172, 0.3);
        }

        .ai-search-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #1a1a7a 0%, #0f0f4a 100%);
          transform: translateY(-1px) scale(1.05);
          box-shadow: 0 6px 16px rgba(45, 43, 172, 0.4);
        }

        .ai-search-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }

        .ai-search-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .ai-search-btn i {
          font-size: 0.9rem;
          transition: transform 0.3s ease;
        }

        .ai-search-btn:hover:not(:disabled) i {
          transform: scale(1.1);
        }

        .ai-response-section {
          position: fixed;
          bottom: 8rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 999;
          max-width: 600px;
          width: 90%;
          animation: slideUp 0.3s ease-out;
        }

        .ai-response-content {
          background: white;
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          border: 1px solid #e1e5e9;
          overflow: hidden;
        }

        .ai-response-header {
          background: #2d2bac;
          color: white;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .ai-response-header i {
          font-size: 1rem;
        }

        .close-response {
          margin-left: auto;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 4px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.8rem;
        }

        .close-response:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .ai-response-text {
          padding: 1rem;
          color: #333;
          line-height: 1.5;
          font-size: 0.9rem;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }


        .user-menu {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background-color: #2d2bac;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
        }

        .user-email {
          color: #666;
          font-size: 0.8rem;
        }

        .logout-btn {
          background: transparent;
          border: 2px solid #1f1e7a;
          color: #1f1e7a;
          cursor: pointer;
          padding: 0.75rem;
          border-radius: 50%;
          transition: all 0.3s;
          font-size: 1.2rem;
        }

        .logout-btn:hover {
          background-color: #1f1e7a;
          border-color: #1f1e7a;
          color: white;
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
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          margin: 0;
          color: #333;
        }

        .stat-title {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .chart-section, .activities-section {
          background: white;
          padding: 1.5rem;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .chart-section h3, .activities-section h3 {
          margin: 0 0 1.5rem 0;
          color: #333;
        }

        .chart-placeholder {
          text-align: center;
          padding: 3rem;
          color: #999;
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
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          transition: background-color 0.3s;
        }

        .activity-item:hover {
          background-color: #f8f9fa;
        }

        .activity-icon {
          color: #2d2bac;
          margin-top: 0.25rem;
        }

        .activity-content {
          flex: 1;
        }

        .activity-action {
          margin: 0 0 0.25rem 0;
          font-weight: 600;
          color: #333;
        }

        .activity-project {
          margin: 0 0 0.25rem 0;
          color: #666;
          font-size: 0.9rem;
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
        }

        .btn-primary {
          background: linear-gradient(135deg, #2d2bac 0%, #1a1a7a 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          transition: transform 0.3s;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .project-card {
          background: white;
          padding: 1.5rem;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          transition: transform 0.3s;
        }

        .project-card:hover {
          transform: translateY(-5px);
        }

        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .project-name {
          margin: 0;
          color: #333;
          font-size: 1.1rem;
        }

        .project-status {
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .project-progress {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background-color: #e1e5e9;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #2d2bac 0%, #1a1a7a 100%);
          transition: width 0.3s;
        }

        .progress-text {
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
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
          font-size: 0.9rem;
        }

        .project-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: all 0.3s;
        }

        .action-btn:hover {
          background-color: #f0f0f0;
          color: #333;
        }

        .tasks-section, .team-section, .settings-section {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .tasks-section h2, .team-section h2, .settings-section h2 {
          margin: 0 0 2rem 0;
          color: #333;
        }

        .tasks-placeholder, .team-placeholder, .settings-placeholder {
          text-align: center;
          padding: 3rem;
          color: #999;
        }

        .tasks-placeholder i, .team-placeholder i, .settings-placeholder i {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        /* Analyze Section Styles */
        .analyze-section {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .analyze-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .analyze-header h2 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 2rem;
        }

        .analyze-header p {
          margin: 0;
          color: #666;
          font-size: 1.1rem;
        }

        .upload-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .upload-button {
          background: linear-gradient(135deg, #2d2bac 0%, #1a1a7a 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .upload-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(45, 43, 172, 0.4);
        }

        .file-info {
          margin-top: 1rem;
          padding: 0.75rem 1rem;
          background-color: #f8f9fa;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #333;
        }

        .ai-search-section {
          background-color: #f8f9fa;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          margin-bottom: 2rem;
        }

        .ai-search-section h3 {
          margin: 0 0 1rem 0;
          color: #333;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .ai-search-section h3 i {
          color: #2d2bac;
        }

        .search-container {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .search-container input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
          opacity: isAiLoading ? 0.7 : 1;
        }

        .search-container input:focus {
          border-color: #2d2bac;
        }

        .search-btn {
          padding: 0.75rem 1.25rem;
          background: linear-gradient(135deg, #2d2bac 0%, #1a1a7a 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
          opacity: isAiLoading ? 0.7 : 1;
        }

        .search-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(45, 43, 172, 0.4);
        }

        .search-btn:disabled {
          cursor: not-allowed;
        }

        .error-message {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
          border-radius: 6px;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .quick-actions-section {
          margin-bottom: 2rem;
        }

        .quick-actions-section h3 {
          margin: 0 0 1rem 0;
          color: #333;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .quick-actions-section h3 i {
          color: #2d2bac;
          font-size: 0.9rem;
        }

        .actions-container {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          scrollbar-width: thin;
          scrollbar-color: #1f1e7a #f1f1f1;
        }

        .loading-actions {
          padding: 1.25rem;
          text-align: center;
          color: #666;
          font-style: italic;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.625rem 1rem;
          background-color: white;
          color: #2d2bac;
          border: 2px solid #2d2bac;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          min-width: fit-content;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .action-btn:hover {
          background-color: #2d2bac;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(45, 43, 172, 0.3);
        }

        .data-table-section {
          margin-top: 2rem;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .table-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.1rem;
        }

        .result-count {
          font-size: 0.9rem;
          font-weight: normal;
          color: #666;
          margin-left: 0.5rem;
        }

        .clear-filter-btn {
          padding: 0.5rem 1rem;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          transition: background-color 0.2s;
        }

        .clear-filter-btn:hover {
          background-color: #c82333;
        }

        .table-container {
          overflow-x: auto;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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

        @media (max-width: 992px) {
          .sub-sidebar {
            width: 150px;
          }
        }

        @media (max-width: 768px) {
          .left-sidebar {
            width: 180px;
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

          .floating-search .search-box {
            min-width: 320px;
            padding: 0.625rem;
            border-radius: 14px;
          }

          .floating-search .search-box input {
            padding: 0.75rem 1rem 0.75rem 2.75rem;
            font-size: 0.95rem;
          }

          .floating-search .search-box i {
            left: 1rem;
            font-size: 1rem;
          }

          .ai-search-btn {
            width: 32px;
            height: 32px;
            right: 0.625rem;
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
