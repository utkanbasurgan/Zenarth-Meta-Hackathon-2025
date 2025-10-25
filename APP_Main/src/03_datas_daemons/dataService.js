// Data Service for handling JSON file operations
// This service manages all project data storage in projects_dats.json

class DataService {
  constructor() {
    this.dataFilePath = '/src/03_datas_daemons/projects_dats.json';
    this.sourcesFilePath = '/src/03_datas_daemons/sources.json';
    this.data = null;
    this.sourcesData = null;
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      this.data = await this.loadData();
      this.sourcesData = await this.loadSourcesData();
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing DataService:', error);
      // Set default values if initialization fails
      this.data = {
        projects: [],
        sources: [],
        uploadedFiles: [],
        projectDetails: {
          name: '',
          location: '',
          build: 'React'
        },
        lastUpdated: new Date().toISOString()
      };
      this.sourcesData = {
        sources: [],
        lastUpdated: new Date().toISOString()
      };
      this.initialized = true;
    }
  }

  // Load data from JSON file
  async loadData() {
    try {
      const response = await fetch('http://localhost:3001/api/data/projects');
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading data from API, falling back to localStorage:', error);
      // Fallback to localStorage if API is not available
      try {
        const storedData = localStorage.getItem('projectsData');
        if (storedData) {
          return JSON.parse(storedData);
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError);
      }
      
      // Return default structure if no data exists
      return {
        projects: [],
        sources: [],
        uploadedFiles: [],
        projectDetails: {
          name: '',
          location: '',
          build: 'React'
        },
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Load sources data from sources.json
  async loadSourcesData() {
    try {
      const response = await fetch('http://localhost:3001/api/data/sources');
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading sources data from API, falling back to localStorage:', error);
      // Fallback to localStorage if API is not available
      try {
        const storedSourcesData = localStorage.getItem('sourcesData');
        if (storedSourcesData) {
          return JSON.parse(storedSourcesData);
        }
      } catch (localError) {
        console.error('Error loading sources from localStorage:', localError);
      }
      
      // Return default sources structure
      return {
        sources: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Save data to JSON file
  async saveData() {
    try {
      this.data.lastUpdated = new Date().toISOString();
      
      const response = await fetch('http://localhost:3001/api/data/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.data)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Data saved successfully:', result.message);
        
        // Also save to localStorage as backup
        localStorage.setItem('projectsData', JSON.stringify(this.data, null, 2));
        
        // Trigger storage event to update other components
        window.dispatchEvent(new Event('storage'));
        return true;
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving data to API, falling back to localStorage:', error);
      // Fallback to localStorage if API is not available
      try {
        localStorage.setItem('projectsData', JSON.stringify(this.data, null, 2));
        window.dispatchEvent(new Event('storage'));
        return true;
      } catch (localError) {
        console.error('Error saving to localStorage:', localError);
        return false;
      }
    }
  }

  // Save sources data to JSON file
  async saveSourcesData() {
    try {
      this.sourcesData.lastUpdated = new Date().toISOString();
      
      const response = await fetch('http://localhost:3001/api/data/sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.sourcesData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Sources data saved successfully:', result.message);
        
        // Also save to localStorage as backup
        localStorage.setItem('sourcesData', JSON.stringify(this.sourcesData, null, 2));
        
        // Trigger storage event to update other components
        window.dispatchEvent(new Event('sourcesUpdated'));
        return true;
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving sources data to API, falling back to localStorage:', error);
      // Fallback to localStorage if API is not available
      try {
        localStorage.setItem('sourcesData', JSON.stringify(this.sourcesData, null, 2));
        window.dispatchEvent(new Event('sourcesUpdated'));
        return true;
      } catch (localError) {
        console.error('Error saving sources to localStorage:', localError);
        return false;
      }
    }
  }

  // Sources management - Enhanced for sources.json
  getSources() {
    if (!this.sourcesData) {
      console.warn('DataService not initialized yet, returning empty sources array');
      return [];
    }
    return this.sourcesData.sources || [];
  }

  getSourceById(sourceId) {
    if (!this.sourcesData || !this.sourcesData.sources) {
      return null;
    }
    return this.sourcesData.sources.find(source => source.id === sourceId);
  }

  addSource(source) {
    if (!this.sourcesData) {
      console.error('DataService not initialized, cannot add source');
      return null;
    }
    
    const newSource = {
      id: source.id || `source_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: source.name,
      fileName: source.fileName,
      type: source.type || 'file',
      description: source.description || '',
      settings: source.settings || {},
      data: source.data || '',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      isActive: source.isActive !== undefined ? source.isActive : true,
      ...source
    };
    
    this.sourcesData.sources = this.sourcesData.sources || [];
    this.sourcesData.sources.push(newSource);
    this.saveSourcesData();
    return newSource;
  }

  removeSource(sourceId) {
    if (!this.sourcesData || !this.sourcesData.sources) {
      console.error('DataService not initialized, cannot remove source');
      return;
    }
    this.sourcesData.sources = this.sourcesData.sources.filter(source => source.id !== sourceId);
    this.saveSourcesData();
  }

  updateSource(sourceId, updates) {
    if (!this.sourcesData || !this.sourcesData.sources) {
      console.error('DataService not initialized, cannot update source');
      return null;
    }
    const sourceIndex = this.sourcesData.sources.findIndex(source => source.id === sourceId);
    if (sourceIndex !== -1) {
      this.sourcesData.sources[sourceIndex] = { 
        ...this.sourcesData.sources[sourceIndex], 
        ...updates,
        lastUpdated: new Date().toISOString()
      };
      this.saveSourcesData();
      return this.sourcesData.sources[sourceIndex];
    }
    return null;
  }

  updateSourceData(sourceId, data) {
    if (!this.sourcesData || !this.sourcesData.sources) {
      console.error('DataService not initialized, cannot update source data');
      return null;
    }
    const sourceIndex = this.sourcesData.sources.findIndex(source => source.id === sourceId);
    if (sourceIndex !== -1) {
      this.sourcesData.sources[sourceIndex].data = data;
      this.sourcesData.sources[sourceIndex].lastUpdated = new Date().toISOString();
      this.saveSourcesData();
      return this.sourcesData.sources[sourceIndex];
    }
    return null;
  }

  updateSourceSettings(sourceId, settings) {
    if (!this.sourcesData || !this.sourcesData.sources) {
      console.error('DataService not initialized, cannot update source settings');
      return null;
    }
    const sourceIndex = this.sourcesData.sources.findIndex(source => source.id === sourceId);
    if (sourceIndex !== -1) {
      this.sourcesData.sources[sourceIndex].settings = { 
        ...this.sourcesData.sources[sourceIndex].settings, 
        ...settings 
      };
      this.sourcesData.sources[sourceIndex].lastUpdated = new Date().toISOString();
      this.saveSourcesData();
      return this.sourcesData.sources[sourceIndex];
    }
    return null;
  }


  // Wait for initialization to complete
  async waitForInit() {
    while (!this.initialized) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  // Project details management
  async getProjectDetails() {
    await this.waitForInit();
    return this.data.projectDetails || {
      name: '',
      location: '',
      build: 'React'
    };
  }

  async updateProjectDetails(details) {
    try {
      const response = await fetch('http://localhost:3001/api/data/project-details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(details)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Project details updated successfully:', result.message);
        
        // Update local data
        this.data.projectDetails = { ...this.data.projectDetails, ...details };
        
        // Also save to localStorage as backup
        localStorage.setItem('projectsData', JSON.stringify(this.data, null, 2));
        
        // Trigger storage event to update other components
        window.dispatchEvent(new Event('storage'));
        return this.data.projectDetails;
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating project details via API, falling back to local save:', error);
      // Fallback to local update
      this.data.projectDetails = { ...this.data.projectDetails, ...details };
      await this.saveData();
      return this.data.projectDetails;
    }
  }

  // Uploaded files management
  getUploadedFiles() {
    return this.data.uploadedFiles || [];
  }

  addUploadedFile(fileData) {
    const newFile = {
      id: Date.now() + Math.random(),
      ...fileData,
      uploadDate: new Date().toISOString()
    };
    
    this.data.uploadedFiles = this.data.uploadedFiles || [];
    this.data.uploadedFiles.push(newFile);
    this.saveData();
    return newFile;
  }

  removeUploadedFile(fileId) {
    this.data.uploadedFiles = this.data.uploadedFiles.filter(file => file.id !== fileId);
    this.saveData();
  }

  updateUploadedFile(fileId, updates) {
    const fileIndex = this.data.uploadedFiles.findIndex(file => file.id === fileId);
    if (fileIndex !== -1) {
      this.data.uploadedFiles[fileIndex] = { ...this.data.uploadedFiles[fileIndex], ...updates };
      this.saveData();
      return this.data.uploadedFiles[fileIndex];
    }
    return null;
  }

  // Projects management
  getProjects() {
    return this.data.projects || [];
  }

  addProject(project) {
    const newProject = {
      id: Date.now() + Math.random(),
      ...project,
      createdAt: new Date().toISOString()
    };
    
    this.data.projects = this.data.projects || [];
    this.data.projects.push(newProject);
    this.saveData();
    return newProject;
  }

  updateProject(projectId, updates) {
    const projectIndex = this.data.projects.findIndex(project => project.id === projectId);
    if (projectIndex !== -1) {
      this.data.projects[projectIndex] = { ...this.data.projects[projectIndex], ...updates };
      this.saveData();
      return this.data.projects[projectIndex];
    }
    return null;
  }

  removeProject(projectId) {
    this.data.projects = this.data.projects.filter(project => project.id !== projectId);
    this.saveData();
  }

  // Get all data
  getAllData() {
    return this.data;
  }

  // Get all sources data
  getAllSourcesData() {
    return this.sourcesData;
  }

  // Export data to JSON string
  exportData() {
    return JSON.stringify(this.data, null, 2);
  }

  // Export sources data to JSON string
  exportSourcesData() {
    return JSON.stringify(this.sourcesData, null, 2);
  }

  // Import data from JSON string
  importData(jsonString) {
    try {
      const importedData = JSON.parse(jsonString);
      this.data = { ...this.data, ...importedData };
      this.saveData();
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Import sources data from JSON string
  importSourcesData(jsonString) {
    try {
      const importedData = JSON.parse(jsonString);
      this.sourcesData = { ...this.sourcesData, ...importedData };
      this.saveSourcesData();
      return true;
    } catch (error) {
      console.error('Error importing sources data:', error);
      return false;
    }
  }

  // Clear all data
  clearAllData() {
    this.data = {
      projects: [],
      sources: [],
      uploadedFiles: [],
      projectDetails: {
        name: '',
        location: '',
        build: 'React'
      },
      lastUpdated: new Date().toISOString()
    };
    this.saveData();
  }

  // Clear all sources data
  clearAllSourcesData() {
    this.sourcesData = {
      sources: [],
      lastUpdated: new Date().toISOString()
    };
    this.saveSourcesData();
  }

  // Reset sources to default
  resetSourcesToDefault() {
    this.sourcesData = {
      sources: [],
      lastUpdated: new Date().toISOString()
    };
    this.saveSourcesData();
  }
}

// Create a singleton instance
const dataService = new DataService();

export default dataService;
