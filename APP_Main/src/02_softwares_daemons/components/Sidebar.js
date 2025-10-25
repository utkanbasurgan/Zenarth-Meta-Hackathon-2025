import React from 'react';
import logo from '../../zenarth.png';

const Sidebar = ({ 
  activeSection, 
  setActiveSection, 
  activeSubSection, 
  setActiveSubSection, 
  subSections 
}) => {
  return (
    <>
      {/* Left Sidebar - Main Pages */}
      <div className="left-sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="Zenarth" className="logo" />
          <span className="brand-name">
            <span className="zenarth-bold">Zenarth</span> <span className="ai-italic">AI</span>
          </span>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('overview');
              setActiveSubSection(subSections.overview?.[0]?.id || '');
            }}
          >
            <i className="fas fa-chart-pie"></i>
            <span>Overview</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'projects' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('projects');
              setActiveSubSection(subSections.projects?.[0]?.id || '');
            }}
          >
            <i className="fas fa-folder"></i>
            <span>Projects</span>
          </button>
          
          
          <button 
            className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('settings');
              setActiveSubSection(subSections.settings?.[0]?.id || '');
            }}
          >
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <span className="copyright">
            <span className="copyright-symbol">©</span> <span className="copyright-year">2025</span> <span className="copyright-brand">Zenarth</span>
          </span>
        </div>
      </div>

      {/* Second Left Sidebar - Page */}
      <div className="sub-sidebar">
        <div className="sub-sidebar-header">
          <h3>Pages</h3>
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
    </>
  );
};

export default Sidebar;
