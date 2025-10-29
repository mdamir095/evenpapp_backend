const https = require('https');

async function testDatabaseUrlDebug() {
  console.log('🔍 Testing database URL debug...');
  
  try {
    // Test the database endpoint to see the debug logs
    const response = await fetch('https://evenpappbackend-production.up.railway.app/api/v1/test-db');
    const data = await response.json();
    
    console.log('Database Test Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Test health endpoint
    const healthResponse = await fetch('https://evenpappbackend-production.up.railway.app/api/v1/health');
    const healthData = await healthResponse.json();
    console.log('\nHealth Response:');
    console.log(JSON.stringify(healthData, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDatabaseUrlDebug();
