import React, { useState } from 'react';

const LoginPage = ({ onClose, onNavigateToDashboard }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Herhangi bir giriş yapıldığında dashboard'a yönlendir
    // Bu örnekte basit bir kontrol yapıyoruz
    if (formData.email && formData.password) {
      // Dashboard'a yönlendirme için parent component'e bilgi gönder
      if (onNavigateToDashboard) {
        onNavigateToDashboard();
      } else {
        window.location.href = '/dashboard';
      }
    }
  };

  return (
    <>
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
      />
      
      <div className="login-overlay">
        <div className="login-modal">
          <div className="login-header">
            <h2>Giriş Yap</h2>
            <button className="close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">E-posta</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="E-posta adresinizi girin"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Şifre</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Şifrenizi girin"
                required
              />
            </div>
            
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Beni hatırla</span>
              </label>
              <a href="#" className="forgot-password">Şifremi unuttum</a>
            </div>
            
            <button type="submit" className="login-btn">
              <i className="fas fa-sign-in-alt"></i>
              Giriş Yap
            </button>
          </form>
          
          <div className="login-footer">
            <p>Hesabınız yok mu? <a href="#" className="register-link">Kayıt olun</a></p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
        }

        .login-modal {
          background: white;
          border-radius: 15px;
          padding: 2rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .login-header h2 {
          margin: 0;
          color: #333;
          font-size: 1.8rem;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #999;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.3s;
        }

        .close-btn:hover {
          background-color: #f0f0f0;
          color: #333;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
        }

        .form-group input {
          padding: 1rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .remember-me input[type="checkbox"] {
          margin: 0;
        }

        .forgot-password {
          color: #667eea;
          text-decoration: none;
          transition: color 0.3s;
        }

        .forgot-password:hover {
          color: #5a6fd8;
        }

        .login-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: transform 0.3s;
        }

        .login-btn:hover {
          transform: translateY(-2px);
        }

        .login-footer {
          text-align: center;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e1e5e9;
        }

        .login-footer p {
          margin: 0;
          color: #666;
        }

        .register-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s;
        }

        .register-link:hover {
          color: #5a6fd8;
        }

        @media (max-width: 480px) {
          .login-modal {
            margin: 1rem;
            padding: 1.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default LoginPage;
