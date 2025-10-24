import React, { useState } from 'react';
import { geminiApi } from '../../02_softwares_daemons/geminis_softwares';
import { Sidebar, Topbar } from '../../02_softwares_daemons/components';
import { 
  OverviewPage, 
  ProjectsPage, 
  TasksPage, 
  TeamPage, 
  AnalyzePage, 
  SettingsPage 
} from './pages';

const Dashboard = ({ onNavigateToWebsite }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [activeSubSection, setActiveSubSection] = useState('stats');
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

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      const text = await file.text();
      const data = parseCSV(text);
      
      if (data.length > 0) {
        setHeaders(data[0]);
        setCsvData(data.slice(1));
        setFileName(file.name);
        setFilteredData([]);
        
        // Generate quick actions for the new data
        await generateQuickActions(data[0], data.slice(1));
      }
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
      const prompt = `Bu CSV verisi için ${headers.length} sütun ve ${data.length} satır var. Sütunlar: ${headers.join(', ')}. Bu veri için 5 adet kullanışlı hızlı işlem öner. Her işlem için label, icon (FontAwesome), ve description ver. JSON formatında yanıtla.`;
      
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
      const prompt = `CSV verisi analizi: ${headers.join(', ')} sütunları var. ${csvData.length} satır veri. Kullanıcı soruyor: "${aiSearchQuery}". Bu soruya göre veriyi filtrele ve sonuçları döndür. Sadece eşleşen satırları JSON array olarak ver.`;
      
      const response = await geminiApi(prompt);
      const filtered = JSON.parse(response);
      setFilteredData(filtered);
    } catch (error) {
      console.error('AI search failed:', error);
      setAiError('AI arama başarısız oldu. Lütfen tekrar deneyin.');
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
      setAiResponse('AI yanıtı alınamadı. Lütfen tekrar deneyin.');
    }
  };

  const renderPage = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewPage stats={stats} recentActivities={recentActivities} />;
      case 'projects':
        return <ProjectsPage 
          projects={projects} 
          getStatusColor={getStatusColor} 
          getStatusText={getStatusText} 
        />;
      case 'tasks':
        return <TasksPage />;
      case 'team':
        return <TeamPage />;
      case 'analyze':
        return <AnalyzePage
          csvData={csvData}
          headers={headers}
          fileName={fileName}
          aiSearchQuery={aiSearchQuery}
          setAiSearchQuery={setAiSearchQuery}
          isAiLoading={isAiLoading}
          aiError={aiError}
          filteredData={filteredData}
          quickActions={quickActions}
          isGeneratingActions={isGeneratingActions}
          handleFileUpload={handleFileUpload}
          handleAiSearch={handleAiSearch}
          handleQuickAction={handleQuickAction}
          setFilteredData={setFilteredData}
        />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage stats={stats} recentActivities={recentActivities} />;
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

      {/* Floating AI Search Box */}
      <div className="floating-search">
        <div className="search-box">
          <i className="fas fa-magic"></i>
          <input 
            type="text" 
            placeholder="AI ile herhangi bir şey sorun..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleGeneralAiSearch();
              }
            }}
          />
          <button 
            className="ai-search-btn"
            onClick={handleGeneralAiSearch}
            title="AI ile ara"
          >
            <i className="fas fa-robot"></i>
          </button>
        </div>
      </div>

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
          background: rgba(255, 0, 0, 0.1);
          color: #dc3545;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: rgba(255, 0, 0, 0.2);
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

        .floating-search {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
        }

        .search-box {
          position: relative;
          background: white;
          border-radius: 25px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          padding: 0.75rem 1rem;
          min-width: 400px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .search-box i {
          color: #1f1e7a;
          font-size: 1.1rem;
        }

        .search-box input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.95rem;
          color: #333;
        }

        .search-box input::placeholder {
          color: #999;
        }

        .ai-search-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: linear-gradient(135deg, #1f1e7a, #1f1e7a);
          color: white;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .ai-search-btn:hover {
          transform: scale(1.1);
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
