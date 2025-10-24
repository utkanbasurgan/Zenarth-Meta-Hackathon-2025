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
            className={`nav-item ${activeSection === 'tasks' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('tasks');
              setActiveSubSection(subSections.tasks?.[0]?.id || '');
            }}
          >
            <i className="fas fa-tasks"></i>
            <span>Tasks</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'team' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('team');
              setActiveSubSection(subSections.team?.[0]?.id || '');
            }}
          >
            <i className="fas fa-users"></i>
            <span>Team</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'analyze' ? 'active' : ''}`}
            onClick={() => {
              setActiveSection('analyze');
              setActiveSubSection(subSections.analyze?.[0]?.id || '');
            }}
          >
            <i className="fas fa-chart-line"></i>
            <span>Analysis</span>
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
      </div>

      {/* Second Left Sidebar - Sub Pages */}
      <div className="sub-sidebar">
        <div className="sub-sidebar-header">
          <h3>Sub Pages</h3>
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
