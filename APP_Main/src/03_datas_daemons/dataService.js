// Data Service for handling JSON file operations
// This service manages all project data storage in projects_dats.json

class DataService {
  constructor() {
    this.dataFilePath = '/src/03_datas_daemons/projects_dats.json';
    this.data = this.loadData();
  }

  // Load data from JSON file
  loadData() {
    try {
      // In a real application, this would make an API call to read the file
      // For now, we'll use localStorage as a fallback and structure the data properly
      const storedData = localStorage.getItem('projectsData');
      if (storedData) {
        return JSON.parse(storedData);
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
    } catch (error) {
      console.error('Error loading data:', error);
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

  // Save data to JSON file
  saveData() {
    try {
      this.data.lastUpdated = new Date().toISOString();
      // In a real application, this would make an API call to write to the file
      // For now, we'll use localStorage as a fallback
      localStorage.setItem('projectsData', JSON.stringify(this.data, null, 2));
      
      // Trigger storage event to update other components
      window.dispatchEvent(new Event('storage'));
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  // Sources management
  getSources() {
    return this.data.sources || [];
  }

  addSource(source) {
    const newSource = {
      id: Date.now() + Math.random(),
      name: source.name,
      fileName: source.fileName,
      createdAt: new Date().toISOString(),
      ...source
    };
    
    this.data.sources = this.data.sources || [];
    this.data.sources.push(newSource);
    this.saveData();
    return newSource;
  }

  removeSource(sourceId) {
    this.data.sources = this.data.sources.filter(source => source.id !== sourceId);
    this.saveData();
  }

  updateSource(sourceId, updates) {
    const sourceIndex = this.data.sources.findIndex(source => source.id === sourceId);
    if (sourceIndex !== -1) {
      this.data.sources[sourceIndex] = { ...this.data.sources[sourceIndex], ...updates };
      this.saveData();
      return this.data.sources[sourceIndex];
    }
    return null;
  }

  // Project details management
  getProjectDetails() {
    return this.data.projectDetails || {
      name: '',
      location: '',
      build: 'React'
    };
  }

  updateProjectDetails(details) {
    this.data.projectDetails = { ...this.data.projectDetails, ...details };
    this.saveData();
    return this.data.projectDetails;
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

  // Export data to JSON string
  exportData() {
    return JSON.stringify(this.data, null, 2);
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
}

// Create a singleton instance
const dataService = new DataService();

export default dataService;
