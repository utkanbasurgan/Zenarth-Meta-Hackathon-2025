const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001';

async function testAPI() {
  console.log('Testing Console API...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${API_BASE}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✓ Health check:', healthData.status);

    // Test console log reading
    console.log('\n2. Testing console log reading...');
    const logPath = '/Users/utkan.basurgan/Main/1. Works Files/2. Gits Works/Zenarth-Meta-Hackathon-2025/APP_Backend/console.log';
    const logResponse = await fetch(`${API_BASE}/api/console-log?path=${encodeURIComponent(logPath)}`);
    
    if (logResponse.ok) {
      const logData = await logResponse.json();
      console.log(`✓ Console log loaded: ${logData.lines.length} lines`);
      if (logData.lines.length > 0) {
        console.log('  Sample line:', logData.lines[0]);
      }
    } else {
      console.log('✗ Console log reading failed:', logResponse.status);
    }

    // Test process status
    console.log('\n3. Testing process status...');
    const statusResponse = await fetch(`${API_BASE}/api/process-status`);
    const statusData = await statusResponse.json();
    console.log('✓ Process status:', statusData.isRunning ? 'Running' : 'Stopped');
    if (statusData.pid) {
      console.log('  PID:', statusData.pid);
    }

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure the Console API server is running:');
    console.log('npm run console-api');
  }
}

testAPI();
