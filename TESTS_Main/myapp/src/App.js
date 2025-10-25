import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import SuccessPage from './components/SuccessPage';
import FailurePage from './components/FailurePage';
import { successfulApiCall, failedApiCall, realApiCall } from './services/apiService';
import serverLogger from './services/serverLogger';

// Logs Viewer Component
function LogsViewer() {
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  const loadLogs = async () => {
    const allLogs = await serverLogger.getAllLogs();
    setLogs(allLogs);
    setShowLogs(true);
  };

  const clearLogs = async () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      const success = await serverLogger.clearLogs();
      if (success) {
        setLogs([]);
        alert('All logs cleared!');
      } else {
        alert('Failed to clear logs. Check console for details.');
      }
    }
  };

  const downloadLogs = () => {
    // Show current log file content
    serverLogger.showLogFile();
    alert('Check browser console for log file content');
  };

  return (
    <div className="logs-viewer">
      <div className="logs-controls">
        <button className="btn btn-primary" onClick={loadLogs}>
          📋 View Error Logs
        </button>
        <button className="btn btn-secondary" onClick={downloadLogs}>
          📄 Download Logs
        </button>
        <button className="btn btn-outline" onClick={clearLogs}>
          🗑️ Clear Logs
        </button>
      </div>
      
      {showLogs && (
        <div className="logs-display">
          <h3>📋 Error Logs ({logs.length} entries)</h3>
          {logs.length === 0 ? (
            <p>No error logs found. Try triggering an error first.</p>
          ) : (
            <div className="logs-list">
              {logs.map((log, index) => (
                <div key={index} className="log-entry">
                  <div className="log-header">
                    <strong>#{index + 1}: {log.title}</strong>
                    <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="log-details">
                    <p><strong>Type:</strong> {log.type}</p>
                    <p><strong>Message:</strong> {log.message || log.error?.message || 'No message'}</p>
                    {log.endpoint && <p><strong>Endpoint:</strong> {log.endpoint}</p>}
                    {log.stack && (
                      <details>
                        <summary>Stack Trace</summary>
                        <pre>{log.stack}</pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSuccessfulTest = async () => {
    setLoading(true);
    try {
      const result = await successfulApiCall();
      navigate('/success', { state: result });
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFailedTest = async () => {
    setLoading(true);
    try {
      await failedApiCall();
    } catch (error) {
      navigate('/failure', { state: { error: error.message, timestamp: new Date().toISOString() } });
    } finally {
      setLoading(false);
    }
  };

  const handleRealApiTest = async () => {
    setLoading(true);
    try {
      const result = await realApiCall();
      navigate('/success', { state: result });
    } catch (error) {
      navigate('/failure', { state: { error: error.message, timestamp: new Date().toISOString() } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>YourBrand</h2>
          </div>
          <ul className="nav-menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <h1>Welcome to YourBrand</h1>
          <p>We provide innovative solutions that drive your business forward with cutting-edge technology and exceptional service.</p>
          <div className="hero-buttons">
            <button className="btn-primary">Get Started</button>
            <button className="btn-secondary">Learn More</button>
          </div>
        </div>
      </section>

      {/* API Test Section */}
      <section className="api-test-section">
        <div className="container">
          <h2>🧪 API Test Center</h2>
          <p>Test different API scenarios to see how the application handles success and failure cases.</p>
          
          <div className="test-buttons">
            <button 
              className="test-btn test-success" 
              onClick={handleSuccessfulTest}
              disabled={loading}
            >
              {loading ? '⏳ Loading...' : '✅ Test Successful API'}
            </button>
            
            <button 
              className="test-btn test-failure" 
              onClick={handleFailedTest}
              disabled={loading}
            >
              {loading ? '⏳ Loading...' : '❌ Test Failed API'}
            </button>
            
            <button 
              className="test-btn test-real" 
              onClick={handleRealApiTest}
              disabled={loading}
            >
              {loading ? '⏳ Loading...' : '🌐 Test Real API'}
            </button>
          </div>
          
          <div className="test-info">
            <div className="info-card">
              <h3>✅ Success Test</h3>
              <p>Simulates a successful API call with mock data. You'll see a success page with loaded data.</p>
            </div>
            <div className="info-card">
              <h3>❌ Failure Test</h3>
              <p>Simulates a failed API call. You'll see an error page with troubleshooting information.</p>
            </div>
            <div className="info-card">
              <h3>🌐 Real API Test</h3>
              <p>Makes a real API call to JSONPlaceholder. May succeed or fail based on network conditions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Logs Viewer Section */}
      <section className="logs-section">
        <div className="container">
          <h2>📋 Error Logs Viewer</h2>
          <p>View, download, and manage error logs from failed API calls and React errors.</p>
          <LogsViewer />
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="features">
        <div className="container">
          <h2>Why Choose Us</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Fast & Reliable</h3>
              <p>Lightning-fast performance with 99.9% uptime guarantee for all our services.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Safe</h3>
              <p>Enterprise-grade security measures to protect your data and privacy.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h3>Innovation</h3>
              <p>Cutting-edge technology and innovative solutions for modern challenges.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Focused Results</h3>
              <p>Data-driven approach to deliver measurable results for your business.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>About YourBrand</h2>
              <p>We are a team of passionate professionals dedicated to delivering exceptional results. With years of experience in the industry, we understand the challenges businesses face and provide tailored solutions that drive growth and success.</p>
              <p>Our mission is to empower businesses with innovative technology solutions that streamline operations, enhance productivity, and accelerate growth in today's competitive market.</p>
            </div>
            <div className="about-stats">
              <div className="stat">
                <h3>500+</h3>
                <p>Happy Clients</p>
              </div>
              <div className="stat">
                <h3>1000+</h3>
                <p>Projects Completed</p>
              </div>
              <div className="stat">
                <h3>5+</h3>
                <p>Years Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <h2>Get In Touch</h2>
          <p>Ready to start your next project? We'd love to hear from you.</p>
          <div className="contact-info">
            <div className="contact-item">
              <h4>Email</h4>
              <p>hello@yourbrand.com</p>
            </div>
            <div className="contact-item">
              <h4>Phone</h4>
              <p>+1 (555) 123-4567</p>
            </div>
            <div className="contact-item">
              <h4>Address</h4>
              <p>123 Business St, City, State 12345</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>YourBrand</h3>
              <p>Empowering businesses with innovative solutions.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="#">LinkedIn</a>
                <a href="#">Twitter</a>
                <a href="#">Facebook</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 YourBrand. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log the React error
    serverLogger.logError('React Error Boundary Caught Error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      type: 'REACT_ERROR_BOUNDARY'
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  useEffect(() => {
    // Setup global error handling
    const handleError = (error) => {
      serverLogger.logError('Global JavaScript Error', {
        message: error.message,
        stack: error.stack,
        type: 'GLOBAL_ERROR'
      });
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/success" 
            element={<SuccessPage {...(window.history.state || {})} />} 
          />
          <Route 
            path="/failure" 
            element={<FailurePage {...(window.history.state || {})} />} 
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
