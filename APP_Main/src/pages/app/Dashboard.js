import React, { useState } from 'react';
import { geminiApi } from '../../services/geminiApi';
import CreatePage from './CreatePage';

const Dashboard = ({ onNavigateToWebsite }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [user, setUser] = useState({
    name: 'Kullanıcı',
    email: 'user@example.com',
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

  const stats = [
    { title: 'Toplam Projeler', value: '12', icon: 'fas fa-folder', color: '#667eea' },
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4facfe';
      case 'review': return '#f093fb';
      case 'pending': return '#43e97b';
      default: return '#667eea';
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

  return (
    <>
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
      />
      
      <div className="dashboard">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <img src="/src/zenarth.png" alt="Zenarth" className="logo" />
            <span className="brand-name">Zenarth</span>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              <i className="fas fa-chart-pie"></i>
              <span>Genel Bakış</span>
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveSection('projects')}
            >
              <i className="fas fa-folder"></i>
              <span>Projeler</span>
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveSection('tasks')}
            >
              <i className="fas fa-tasks"></i>
              <span>Görevler</span>
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'team' ? 'active' : ''}`}
              onClick={() => setActiveSection('team')}
            >
              <i className="fas fa-users"></i>
              <span>Takım</span>
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'analyze' ? 'active' : ''}`}
              onClick={() => setActiveSection('analyze')}
            >
              <i className="fas fa-chart-line"></i>
              <span>Analiz</span>
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'create' ? 'active' : ''}`}
              onClick={() => setActiveSection('create')}
            >
              <i className="fas fa-code"></i>
              <span>Create</span>
            </button>
            
            <button 
              className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveSection('settings')}
            >
              <i className="fas fa-cog"></i>
              <span>Ayarlar</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
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
                {activeSection === 'create' && 'Create'}
                {activeSection === 'settings' && 'Ayarlar'}
              </h1>
            </div>
            
            <div className="header-right">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input type="text" placeholder="Ara..." />
              </div>
              
              <div className="notifications">
                <button className="notification-btn">
                  <i className="fas fa-bell"></i>
                  <span className="notification-badge">3</span>
                </button>
              </div>
              
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

            {activeSection === 'create' && (
              <CreatePage />
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

      <style jsx>{`
        .dashboard {
          display: flex;
          min-height: 100vh;
          background-color: #f8f9fa;
        }

        .sidebar {
          width: 250px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          flex-direction: column;
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

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-box i {
          position: absolute;
          left: 1rem;
          color: #999;
        }

        .search-box input {
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #ddd;
          border-radius: 25px;
          width: 300px;
          font-size: 0.9rem;
        }

        .search-box input:focus {
          outline: none;
          border-color: #667eea;
        }

        .notification-btn {
          position: relative;
          background: none;
          border: none;
          font-size: 1.2rem;
          color: #666;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.3s;
        }

        .notification-btn:hover {
          background-color: #f0f0f0;
        }

        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          background-color: #e74c3c;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background-color: #667eea;
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
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.3s;
        }

        .logout-btn:hover {
          background-color: #f0f0f0;
          color: #e74c3c;
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
          color: #667eea;
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
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
          color: #667eea;
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
          border-color: #667eea;
        }

        .search-btn {
          padding: 0.75rem 1.25rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
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
          color: #667eea;
          font-size: 0.9rem;
        }

        .actions-container {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          scrollbar-width: thin;
          scrollbar-color: #667eea #f1f1f1;
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
          color: #667eea;
          border: 2px solid #667eea;
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
          background-color: #667eea;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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
          color: #667eea;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 200px;
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }

          .search-box input {
            width: 200px;
          }

          .user-info {
            display: none;
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
