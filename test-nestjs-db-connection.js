const https = require('https');

async function testNestJSDBConnection() {
  console.log('🔍 Testing NestJS database connection...');
  
  try {
    // Test the database endpoint with more details
    const response = await fetch('https://evenpappbackend-production.up.railway.app/api/v1/test-db');
    const data = await response.json();
    
    console.log('Database Test Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Also test a simple health check
    const healthResponse = await fetch('https://evenpappbackend-production.up.railway.app/api/v1/health');
    const healthData = await healthResponse.json();
    console.log('\nHealth Check Response:');
    console.log(JSON.stringify(healthData, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testNestJSDBConnection();
