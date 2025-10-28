const https = require('https');

async function testDirectQuery() {
  console.log('🔍 Testing direct query to backend...');
  
  try {
    // Test the database endpoint with more details
    const response = await fetch('https://evenpappbackend-production.up.railway.app/api/v1/test-db');
    const data = await response.json();
    
    console.log('Database Test Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Test if we can access the backend directly
    console.log('\n🔍 Testing backend health...');
    const healthResponse = await fetch('https://evenpappbackend-production.up.railway.app/api/v1/health');
    const healthData = await healthResponse.json();
    console.log('Health Response:');
    console.log(JSON.stringify(healthData, null, 2));
    
    // Test a simple GET request to see if the backend is responding
    console.log('\n🔍 Testing backend root...');
    try {
      const rootResponse = await fetch('https://evenpappbackend-production.up.railway.app/');
      console.log('Root response status:', rootResponse.status);
    } catch (error) {
      console.log('Root response error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDirectQuery();
