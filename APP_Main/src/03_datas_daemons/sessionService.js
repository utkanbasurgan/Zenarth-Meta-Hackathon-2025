// Session Management Service
// Handles session lifecycle: Start, Stop, Restart with history tracking

class SessionService {
  constructor() {
    this.currentSession = null;
    this.sessionHistory = [];
    this.sessionSettings = {
      autoSave: true,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes in milliseconds
      maxHistorySize: 50
    };
    this.loadSessionData();
  }

  // Load session data from localStorage
  loadSessionData() {
    try {
      const storedSessions = localStorage.getItem('sessionHistory');
      if (storedSessions) {
        this.sessionHistory = JSON.parse(storedSessions);
      }

      const currentSessionData = localStorage.getItem('currentSession');
      if (currentSessionData) {
        this.currentSession = JSON.parse(currentSessionData);
      }

      const settingsData = localStorage.getItem('sessionSettings');
      if (settingsData) {
        this.sessionSettings = { ...this.sessionSettings, ...JSON.parse(settingsData) };
      }
    } catch (error) {
      console.error('Error loading session data:', error);
      this.sessionHistory = [];
      this.currentSession = null;
    }
  }

  // Save session data to localStorage
  saveSessionData() {
    try {
      localStorage.setItem('sessionHistory', JSON.stringify(this.sessionHistory));
      if (this.currentSession) {
        localStorage.setItem('currentSession', JSON.stringify(this.currentSession));
      } else {
        localStorage.removeItem('currentSession');
      }
      localStorage.setItem('sessionSettings', JSON.stringify(this.sessionSettings));
      
      // Trigger storage event to update other components
      window.dispatchEvent(new Event('sessionUpdate'));
      return true;
    } catch (error) {
      console.error('Error saving session data:', error);
      return false;
    }
  }

  // Start a new session
  startSession(sessionName = null) {
    // Stop current session if running
    if (this.currentSession) {
      this.stopSession();
    }

    const sessionId = Date.now() + Math.random();
    const sessionName_ = sessionName || `Session ${new Date().toLocaleString()}`;
    
    this.currentSession = {
      id: sessionId,
      name: sessionName_,
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'active',
      duration: 0,
      activities: [],
      settings: { ...this.sessionSettings }
    };

    this.saveSessionData();
    return this.currentSession;
  }

  // Stop current session
  stopSession() {
    if (!this.currentSession) {
      return null;
    }

    this.currentSession.endTime = new Date().toISOString();
    this.currentSession.status = 'stopped';
    this.currentSession.duration = this.calculateDuration();

    // Add to history
    this.sessionHistory.unshift(this.currentSession);
    
    // Limit history size
    if (this.sessionHistory.length > this.sessionSettings.maxHistorySize) {
      this.sessionHistory = this.sessionHistory.slice(0, this.sessionSettings.maxHistorySize);
    }

    const stoppedSession = { ...this.currentSession };
    this.currentSession = null;
    this.saveSessionData();

    return stoppedSession;
  }

  // Restart session (stop current and start new)
  restartSession(sessionName = null) {
    const stoppedSession = this.stopSession();
    const newSession = this.startSession(sessionName);
    
    return {
      stopped: stoppedSession,
      started: newSession
    };
  }

  // Get current session
  getCurrentSession() {
    return this.currentSession;
  }

  // Get session history
  getSessionHistory() {
    return this.sessionHistory;
  }

  // Get session by ID
  getSessionById(sessionId) {
    if (this.currentSession && this.currentSession.id === sessionId) {
      return this.currentSession;
    }
    return this.sessionHistory.find(session => session.id === sessionId);
  }

  // Add activity to current session
  addActivity(activity) {
    if (!this.currentSession) {
      return false;
    }

    const activityEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      type: activity.type || 'general',
      description: activity.description || '',
      data: activity.data || {},
      ...activity
    };

    this.currentSession.activities.push(activityEntry);
    this.saveSessionData();
    return activityEntry;
  }

  // Update session settings
  updateSettings(newSettings) {
    this.sessionSettings = { ...this.sessionSettings, ...newSettings };
    this.saveSessionData();
    return this.sessionSettings;
  }

  // Get session settings
  getSettings() {
    return this.sessionSettings;
  }

  // Calculate session duration
  calculateDuration() {
    if (!this.currentSession) {
      return 0;
    }

    const startTime = new Date(this.currentSession.startTime);
    const endTime = this.currentSession.endTime ? 
      new Date(this.currentSession.endTime) : 
      new Date();
    
    return endTime - startTime;
  }

  // Get formatted duration
  getFormattedDuration(session = null) {
    const targetSession = session || this.currentSession;
    if (!targetSession) {
      return '00:00:00';
    }

    const duration = targetSession.duration || this.calculateDuration();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Get session statistics
  getSessionStats() {
    const totalSessions = this.sessionHistory.length + (this.currentSession ? 1 : 0);
    const totalDuration = this.sessionHistory.reduce((total, session) => total + session.duration, 0) + 
                         (this.currentSession ? this.calculateDuration() : 0);
    
    const avgDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
    
    return {
      totalSessions,
      totalDuration,
      avgDuration,
      currentSession: this.currentSession,
      lastSession: this.sessionHistory[0] || null
    };
  }

  // Clear session history
  clearHistory() {
    this.sessionHistory = [];
    this.saveSessionData();
  }

  // Delete session from history
  deleteSession(sessionId) {
    this.sessionHistory = this.sessionHistory.filter(session => session.id !== sessionId);
    this.saveSessionData();
  }

  // Export session data
  exportSessions() {
    return JSON.stringify({
      currentSession: this.currentSession,
      sessionHistory: this.sessionHistory,
      settings: this.sessionSettings
    }, null, 2);
  }

  // Import session data
  importSessions(jsonString) {
    try {
      const importedData = JSON.parse(jsonString);
      this.currentSession = importedData.currentSession;
      this.sessionHistory = importedData.sessionHistory || [];
      this.sessionSettings = { ...this.sessionSettings, ...importedData.settings };
      this.saveSessionData();
      return true;
    } catch (error) {
      console.error('Error importing session data:', error);
      return false;
    }
  }

  // Check if session is active
  isSessionActive() {
    return this.currentSession && this.currentSession.status === 'active';
  }

  // Get session status
  getSessionStatus() {
    if (!this.currentSession) {
      return 'no_session';
    }
    return this.currentSession.status;
  }
}

// Create a singleton instance
const sessionService = new SessionService();

export default sessionService;
