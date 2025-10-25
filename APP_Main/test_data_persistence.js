// Test script to verify data persistence
// Run this with: node test_data_persistence.js

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src/03_datas_daemons');

console.log('Testing data persistence...');

// Test 1: Check if data directory exists
if (fs.existsSync(dataDir)) {
  console.log('✅ Data directory exists');
} else {
  console.log('❌ Data directory does not exist');
}

// Test 2: Check if projects_dats.json exists and is readable
const projectsFile = path.join(dataDir, 'projects_dats.json');
if (fs.existsSync(projectsFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(projectsFile, 'utf8'));
    console.log('✅ projects_dats.json exists and is readable');
    console.log('   Last updated:', data.lastUpdated);
    console.log('   Projects count:', data.projects?.length || 0);
  } catch (error) {
    console.log('❌ projects_dats.json exists but is not readable:', error.message);
  }
} else {
  console.log('⚠️  projects_dats.json does not exist (will be created on first save)');
}

// Test 3: Check if sources.json exists and is readable
const sourcesFile = path.join(dataDir, 'sources.json');
if (fs.existsSync(sourcesFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(sourcesFile, 'utf8'));
    console.log('✅ sources.json exists and is readable');
    console.log('   Last updated:', data.lastUpdated);
    console.log('   Sources count:', data.sources?.length || 0);
  } catch (error) {
    console.log('❌ sources.json exists but is not readable:', error.message);
  }
} else {
  console.log('⚠️  sources.json does not exist (will be created on first save)');
}

console.log('\nTo test the API endpoints, make sure the server is running:');
console.log('1. Start the server: node src/04_settings_daemons/ssh-server.js');
console.log('2. Test the endpoints:');
console.log('   - GET http://localhost:3001/api/data/projects');
console.log('   - GET http://localhost:3001/api/data/sources');
console.log('   - POST http://localhost:3001/api/data/projects');
console.log('   - PUT http://localhost:3001/api/data/project-details');
