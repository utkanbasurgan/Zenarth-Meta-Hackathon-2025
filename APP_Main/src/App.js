import { useState, useEffect } from 'react';
import './App.css';
import logo from './zenarth.png';
import MainWebsite from './pages/site/MainWebsite';
import Dashboard from './pages/app/Dashboard';
import HomePage from './pages/HomePage';
import CompanyPage from './pages/CompanyPage';
import FriendsPage from './pages/FriendsPage';
import PrivacyPage from './pages/PrivacyPage';
import AccountPage from './pages/AccountPage';
import DefaultPage from './pages/DefaultPage';

function App() 
{
  const [currentView, setCurrentView] = useState('website');
  const [activeSection, setActiveSection] = useState('home');
  const [activeSubSection, setActiveSubSection] = useState(null);

  // Check URL for routing
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/dashboard') {
      setCurrentView('dashboard');
    } else {
      setCurrentView('website');
    }
  }, []);

  // Handle navigation to dashboard
  const navigateToDashboard = () => {
    setCurrentView('dashboard');
    window.history.pushState({}, '', '/dashboard');
  };

  // Handle navigation back to website
  const navigateToWebsite = () => {
    setCurrentView('website');
    window.history.pushState({}, '', '/');
  };

  const sections = 
  {
    home: { icon: 'fa-house', subSections: [] },
    people: 
    { 
      icon: 'fa-users', 
      subSections: ['Company', 'Friends'] 
    },
    settings: 
    { 
      icon: 'fa-gear', 
      subSections: ['Privacy', 'Account'] 
    }
  };

  const getPageTitle = () => 
  {
    if (activeSubSection) 
    {
      return activeSubSection;
    }
    return activeSection.charAt(0).toUpperCase() + activeSection.slice(1);
  };

  const getPageContent = () => {
    if (activeSection === 'home') {
      return <HomePage />;
    }
    
    if (activeSection === 'people') {
      if (activeSubSection === 'Company') {
        return <CompanyPage />;
      }
      
      if (activeSubSection === 'Friends') {
        return <FriendsPage />;
      }
    }
    
    if (activeSection === 'settings') {
      if (activeSubSection === 'Privacy') {
        return <PrivacyPage />;
      }
      
      if (activeSubSection === 'Account') {
        return <AccountPage />;
      }
    }
    
    return <DefaultPage pageTitle={getPageTitle()} />;
  };

  // Show main website or dashboard based on current view
  if (currentView === 'website') {
    return <MainWebsite onNavigateToDashboard={navigateToDashboard} />;
  }

  if (currentView === 'dashboard') {
    return <Dashboard onNavigateToWebsite={navigateToWebsite} />;
  }

  // Fallback to original dashboard for backward compatibility
  return (
    <>
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
      />
      
      <div className="dashboard">
        <div className="sidebar-main">
          <div className="company-name">
            <img src={logo} alt="Zenarth" />
            <span>Zenarth</span>
          </div>
          
          <nav className="nav-menu">
            {Object.keys(sections).map(section => (
              <button
                key={section}
                className={`nav-item ${activeSection === section ? 'active' : ''}`}
                onClick={() => 
                {
                  setActiveSection(section);
                  setActiveSubSection(
                    sections[section].subSections.length > 0 
                      ? sections[section].subSections[0] 
                      : null
                  );
                }}
              >
                <i className={`fas ${sections[section].icon}`}></i>
                <span>{section.charAt(0).toUpperCase() + section.slice(1)}</span>
              </button>
            ))}
          </nav>
        </div>

        {sections[activeSection].subSections.length > 0 && (
          <div className="sidebar-sub">
            <div className="sub-title">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </div>
            
            {sections[activeSection].subSections.map(subSection => (
              <button
                key={subSection}
                className={`sub-item ${activeSubSection === subSection ? 'active' : ''}`}
                onClick={() => setActiveSubSection(subSection)}
              >
                {subSection}
              </button>
            ))}
          </div>
        )}

        <div className="main-content">
          <div className="navbar">
            <h1 className="page-title">{getPageTitle()}</h1>
            <button className="help-button">
              <i className="fas fa-question"></i>
            </button>
          </div>
          
          <div className="page-section">
            {getPageContent()}
          </div>
        </div>
      </div>

      <style jsx>{`
      `}</style>
    </>
  );
}

export default App;