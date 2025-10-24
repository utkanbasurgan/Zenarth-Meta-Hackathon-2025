import React from 'react';
import { useState } from 'react';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';

const MainWebsite = ({ onNavigateToDashboard }) => {
  const [currentPage, setCurrentPage] = useState('home');
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
              <img src="/src/zenarth.png" alt="Zenarth" className="logo" />
              <span className="brand-name">Zenarth</span>
            </div>
            
            <div className="navbar-menu">
              <a href="#home" className="nav-link" onClick={() => setCurrentPage('home')}>
                Ana Sayfa
              </a>
              <a href="#about" className="nav-link" onClick={() => setCurrentPage('about')}>
                Hakkımızda
              </a>
              <a href="#services" className="nav-link" onClick={() => setCurrentPage('services')}>
                Hizmetler
              </a>
              <a href="#contact" className="nav-link" onClick={() => setCurrentPage('contact')}>
                İletişim
              </a>
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
          {currentPage === 'home' && (
            <div className="hero-section">
              <div className="hero-content">
                <h1 className="hero-title">Zenarth'a Hoş Geldiniz</h1>
                <p className="hero-subtitle">
                  Modern ve güvenilir çözümlerle işinizi bir üst seviyeye taşıyın
                </p>
                <div className="hero-buttons">
                  <button className="btn-primary" onClick={handleRegisterClick}>
                    Hemen Başla
                  </button>
                  <button className="btn-secondary" onClick={() => setCurrentPage('about')}>
                    Daha Fazla Bilgi
                  </button>
                </div>
              </div>
              <div className="hero-image">
                <i className="fas fa-rocket hero-icon"></i>
              </div>
            </div>
          )}

          {currentPage === 'about' && (
            <div className="about-section">
              <div className="container">
                <h2 className="section-title">Hakkımızda</h2>
                <div className="about-content">
                  <div className="about-text">
                    <p>
                      Zenarth, modern teknoloji çözümleri sunan bir platformdur. 
                      Müşterilerimizin ihtiyaçlarını karşılamak için sürekli 
                      gelişen ve yenilenen hizmetler sunuyoruz.
                    </p>
                    <div className="features">
                      <div className="feature">
                        <i className="fas fa-shield-alt"></i>
                        <h3>Güvenlik</h3>
                        <p>En yüksek güvenlik standartları</p>
                      </div>
                      <div className="feature">
                        <i className="fas fa-bolt"></i>
                        <h3>Hız</h3>
                        <p>Hızlı ve verimli çözümler</p>
                      </div>
                      <div className="feature">
                        <i className="fas fa-cog"></i>
                        <h3>Özelleştirme</h3>
                        <p>İhtiyaçlarınıza göre uyarlanabilir</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'services' && (
            <div className="services-section">
              <div className="container">
                <h2 className="section-title">Hizmetlerimiz</h2>
                <div className="services-grid">
                  <div className="service-card">
                    <i className="fas fa-laptop-code"></i>
                    <h3>Web Geliştirme</h3>
                    <p>Modern ve responsive web siteleri</p>
                  </div>
                  <div className="service-card">
                    <i className="fas fa-mobile-alt"></i>
                    <h3>Mobil Uygulama</h3>
                    <p>iOS ve Android uygulamaları</p>
                  </div>
                  <div className="service-card">
                    <i className="fas fa-cloud"></i>
                    <h3>Bulut Çözümleri</h3>
                    <p>Güvenli ve ölçeklenebilir bulut hizmetleri</p>
                  </div>
                  <div className="service-card">
                    <i className="fas fa-chart-line"></i>
                    <h3>Analitik</h3>
                    <p>Veri analizi ve raporlama</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'contact' && (
            <div className="contact-section">
              <div className="container">
                <h2 className="section-title">İletişim</h2>
                <div className="contact-content">
                  <div className="contact-info">
                    <div className="contact-item">
                      <i className="fas fa-envelope"></i>
                      <span>info@zenarth.com</span>
                    </div>
                    <div className="contact-item">
                      <i className="fas fa-phone"></i>
                      <span>+90 (212) 123 45 67</span>
                    </div>
                    <div className="contact-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>İstanbul, Türkiye</span>
                    </div>
                  </div>
                  <form className="contact-form">
                    <input type="text" placeholder="Adınız" />
                    <input type="email" placeholder="E-posta" />
                    <textarea placeholder="Mesajınız"></textarea>
                    <button type="submit" className="btn-primary">Gönder</button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Zenarth</h3>
              <p>Modern teknoloji çözümleri</p>
            </div>
            <div className="footer-section">
              <h4>Hızlı Linkler</h4>
              <ul>
                <li><a href="#home">Ana Sayfa</a></li>
                <li><a href="#about">Hakkımızda</a></li>
                <li><a href="#services">Hizmetler</a></li>
                <li><a href="#contact">İletişim</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Sosyal Medya</h4>
              <div className="social-links">
                <a href="#"><i className="fab fa-facebook"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-linkedin"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
              </div>
            </div>
          </div>
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
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

        .navbar-menu {
          display: flex;
          gap: 2rem;
        }

        .nav-link {
          color: white;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          transition: background-color 0.3s;
        }

        .nav-link:hover {
          background-color: rgba(255,255,255,0.1);
        }

        .navbar-auth {
          display: flex;
          gap: 1rem;
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
          color: #667eea;
        }

        .btn-register {
          background-color: white;
          color: #667eea;
        }

        .btn-register:hover {
          background-color: #f0f0f0;
        }

        .main-body {
          flex: 1;
          background-color: #f8f9fa;
        }

        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4rem 2rem;
          display: flex;
          align-items: center;
          min-height: 70vh;
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
          color: #667eea;
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
          color: #667eea;
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

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .section-title {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 3rem;
          color: #333;
        }

        .about-section, .services-section, .contact-section {
          padding: 4rem 0;
        }

        .about-content {
          text-align: center;
        }

        .about-text p {
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 3rem;
          color: #666;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .feature {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .feature i {
          font-size: 3rem;
          color: #667eea;
          margin-bottom: 1rem;
        }

        .feature h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .service-card {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          transition: transform 0.3s;
        }

        .service-card:hover {
          transform: translateY(-5px);
        }

        .service-card i {
          font-size: 3rem;
          color: #667eea;
          margin-bottom: 1rem;
        }

        .service-card h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .contact-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: start;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 1.1rem;
        }

        .contact-item i {
          color: #667eea;
          font-size: 1.5rem;
          width: 30px;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .contact-form input,
        .contact-form textarea {
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 1rem;
        }

        .contact-form textarea {
          height: 120px;
          resize: vertical;
        }

        .footer {
          background-color: #333;
          color: white;
          padding: 3rem 0 1rem;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          padding: 0 2rem;
        }

        .footer-section h3,
        .footer-section h4 {
          margin-bottom: 1rem;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
        }

        .footer-section ul li {
          margin-bottom: 0.5rem;
        }

        .footer-section ul li a {
          color: #ccc;
          text-decoration: none;
          transition: color 0.3s;
        }

        .footer-section ul li a:hover {
          color: white;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

        .social-links a {
          color: #ccc;
          font-size: 1.5rem;
          transition: color 0.3s;
        }

        .social-links a:hover {
          color: white;
        }

        .footer-bottom {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #555;
          color: #ccc;
        }

        @media (max-width: 768px) {
          .navbar-container {
            flex-direction: column;
            gap: 1rem;
          }

          .navbar-menu {
            flex-direction: column;
            text-align: center;
          }

          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .hero-title {
            font-size: 2rem;
          }

          .contact-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default MainWebsite;
