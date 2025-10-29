const https = require('https');

async function testRailwayEnv() {
  console.log('🔍 Testing Railway environment variables...');
  
  try {
    // Test if we can access any environment info
    const response = await fetch('https://evenpappbackend-production.up.railway.app/api/v1/health');
    const data = await response.json();
    
    console.log('Health Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // The debug logs should show which database URL is being used
    // Let's check if we can see any logs or if there's another endpoint
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRailwayEnv();
