// Example usage of the enhanced source management system
// This file demonstrates how to use the new source management features

import dataService from './dataService.js';


// Example: Add a new source for a project
export function addNewSource(projectName) {
  const newSource = dataService.addSource({
    name: `${projectName} Log`,
    fileName: `${projectName.toLowerCase()}_log.txt`,
    type: 'log',
    description: `Log file for ${projectName} project`,
    settings: {
      autoRotate: true,
      maxSize: '5MB',
      retentionDays: 15,
      logLevel: 'DEBUG',
      format: 'timestamp|level|message|source'
    },
    data: '',
    isActive: true
  });
  
  console.log('New source added:', newSource);
  return newSource;
}

// Example: Update source data (simulating log entries)
export function addLogEntry(sourceId, logEntry) {
  const source = dataService.getSourceById(sourceId);
  if (source) {
    const timestamp = new Date().toISOString();
    const formattedEntry = `${timestamp}|INFO|${logEntry}\n`;
    const newData = source.data + formattedEntry;
    
    dataService.updateSourceData(sourceId, newData);
    console.log('Log entry added to source:', sourceId);
  }
}

// Example: Update source settings
export function updateSourceSettings(sourceId, newSettings) {
  const updatedSource = dataService.updateSourceSettings(sourceId, newSettings);
  console.log('Source settings updated:', updatedSource);
  return updatedSource;
}

// Example: Get all sources
export async function getAllSources() {
  await dataService.waitForInit();
  const sources = dataService.getSources();
  console.log('All sources:', sources);
  return sources;
}


// Example: Export sources data
export function exportSources() {
  const sourcesData = dataService.exportSourcesData();
  console.log('Sources data exported:', sourcesData);
  return sourcesData;
}

// Example: Reset sources to default
export function resetToDefault() {
  dataService.resetSourcesToDefault();
  console.log('Sources reset to default configuration');
}

// Example usage in a React component or other part of the application:
/*
// Initialize main log on app start
initializeMainLog();

// Add a new source for a specific project
const projectSource = addNewSource('MyProject');

// Add some log entries
addLogEntry(projectSource.id, 'Application started');
addLogEntry(projectSource.id, 'User logged in');
addLogEntry(projectSource.id, 'Data processed successfully');

// Update settings
updateSourceSettings(projectSource.id, {
  logLevel: 'WARN',
  maxSize: '20MB'
});

// Get all sources
const allSources = getAllSources();
*/
