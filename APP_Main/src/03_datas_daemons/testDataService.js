// Test script for the data service
// This file can be used to test the JSON file storage system

import dataService from './dataService.js';

// Test function to verify data service functionality
export const testDataService = () => {
  console.log('Testing Data Service...');
  
  // Test 1: Add a source
  console.log('Test 1: Adding a source');
  const testSource = dataService.addSource({
    name: 'Test Source',
    fileName: 'test.csv'
  });
  console.log('Added source:', testSource);
  
  // Test 2: Get all sources
  console.log('Test 2: Getting all sources');
  const sources = dataService.getSources();
  console.log('All sources:', sources);
  
  // Test 3: Update project details
  console.log('Test 3: Updating project details');
  const projectDetails = dataService.updateProjectDetails({
    name: 'Test Project',
    location: '/path/to/project',
    build: 'React'
  });
  console.log('Updated project details:', projectDetails);
  
  // Test 4: Add an uploaded file
  console.log('Test 4: Adding an uploaded file');
  const testFile = dataService.addUploadedFile({
    name: 'test.csv',
    size: 1024,
    fileType: 'csv',
    headers: ['Name', 'Age'],
    data: [['John', '25'], ['Jane', '30']],
    rowCount: 2
  });
  console.log('Added file:', testFile);
  
  // Test 5: Get all data
  console.log('Test 5: Getting all data');
  const allData = dataService.getAllData();
  console.log('All data:', allData);
  
  // Test 6: Export data
  console.log('Test 6: Exporting data');
  const exportedData = dataService.exportData();
  console.log('Exported data length:', exportedData.length);
  
  console.log('Data Service tests completed successfully!');
  return true;
};

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testDataService = testDataService;
  console.log('Data Service test function available as window.testDataService()');
} else {
  // Node.js environment
  testDataService();
}
