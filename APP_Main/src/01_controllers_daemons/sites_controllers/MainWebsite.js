import React from 'react';
import { useState } from 'react';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import logo from '../../zenarth.png';

const MainWebsite = ({ onNavigateToDashboard }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLoginClick = () => {
    setShowLogin(true);
    setShowRegister(false);
  };

  const handleRegisterClick = () => {
    setShowRegister(true);
    setShowLogin(false);
  };

  const handleCloseModal = () => {
    setShowLogin(false);
    setShowRegister(false);
  };

  if (showLogin) {
    return <LoginPage onClose={handleCloseModal} onNavigateToDashboard={onNavigateToDashboard} />;
  }

  if (showRegister) {
    return <RegisterPage onClose={handleCloseModal} onNavigateToDashboard={onNavigateToDashboard} />;
  }

  return (
    <>
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
      />
      
      <div className="main-website">
        {/* Navbar */}
        <nav className="navbar">
          <div className="navbar-container">
            <div className="navbar-brand">
              <img src={logo} alt="Zenarth" className="logo" />
              <span className="brand-name">
                <span className="zenarth-bold">Zenarth</span> <span className="ai-italic">AI</span>
              </span>
            </div>
            
            
            <div className="navbar-auth">
              <button className="btn-login" onClick={handleLoginClick}>
                <i className="fas fa-sign-in-alt"></i>
                Giriş Yap
              </button>
              <button className="btn-register" onClick={handleRegisterClick}>
                <i className="fas fa-user-plus"></i>
                Kayıt Ol
              </button>
            </div>
          </div>
        </nav>

        {/* Body */}
        <main className="main-body">
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">Zenarth'a Hoş Geldiniz</h1>
              <p className="hero-subtitle">
                Modern ve güvenilir çözümlerle işinizi bir üst seviyeye taşıyın.
              </p>
              <div className="hero-buttons">
                <button className="btn-primary" onClick={handleRegisterClick}>
                  Hemen Başla
                </button>
                <button className="btn-secondary" onClick={handleLoginClick}>
                  Giriş Yap
                </button>
              </div>
            </div>
            <div className="hero-image">
              <i className="fas fa-rocket hero-icon"></i>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-bottom">
            <p>&copy; 2024 Zenarth. Tüm hakları saklıdır.</p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .main-website {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .navbar {
          background: linear-gradient(135deg, #1f1e7a 0%, #0f0e5a 100%);
          color: white;
          padding: 1rem 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
          width: 100%;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
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

        .zenarth-bold {
          font-weight: bold;
        }

        .ai-italic {
          font-style: italic;
          font-weight: 500;
        }


        .navbar-auth {
          display: flex;
          gap: 1rem;
          flex-shrink: 0;
        }

        .btn-login, .btn-register {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s;
        }

        .btn-login {
          background-color: transparent;
          color: white;
          border: 1px solid white;
        }

        .btn-login:hover {
          background-color: white;
          color: #1f1e7a;
        }

        .btn-register {
          background-color: white;
          color: #1f1e7a;
        }

        .btn-register:hover {
          background-color: #f0f0f0;
        }

        .main-body {
          flex: 1;
          background-color: #f8f9fa;
          min-height: calc(100vh - 80px);
        }

        .hero-section {
          background: linear-gradient(135deg, #1f1e7a 0%, #0f0e5a 100%);
          color: white;
          padding: 4rem 2rem;
          display: flex;
          align-items: center;
          min-height: calc(100vh - 80px);
          height: calc(100vh - 80px);
        }

        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
        }

        .hero-title {
          font-size: 3rem;
          margin-bottom: 1rem;
          font-weight: bold;
        }

        .hero-subtitle {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
        }

        .btn-primary, .btn-secondary {
          padding: 1rem 2rem;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .btn-primary {
          background-color: white;
          color: #1f1e7a;
        }

        .btn-primary:hover {
          background-color: #f0f0f0;
        }

        .btn-secondary {
          background-color: transparent;
          color: white;
          border: 2px solid white;
        }

        .btn-secondary:hover {
          background-color: white;
          color: #1f1e7a;
        }

        .hero-image {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-icon {
          font-size: 8rem;
          opacity: 0.3;
        }


        .footer {
          background-color: #333;
          color: white;
          padding: 2rem 0;
        }

        .footer-bottom {
          text-align: center;
          color: #ccc;
        }

        @media (max-width: 768px) {
          .navbar-container {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 0 1rem;
          }

          .navbar-brand {
            flex-shrink: 0;
          }

          .navbar-auth {
            flex-shrink: 0;
            gap: 0.5rem;
          }

          .btn-login, .btn-register {
            padding: 0.4rem 0.8rem;
            font-size: 0.9rem;
          }

          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-section {
            min-height: calc(100vh - 60px);
            height: calc(100vh - 60px);
            padding: 2rem 1rem;
          }
        }

        @media (max-height: 600px) {
          .hero-section {
            min-height: 100vh;
            height: 100vh;
            padding: 2rem;
          }
        }
      `}</style>
    </>
  );
};

export default MainWebsite;
