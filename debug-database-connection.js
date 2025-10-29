const https = require('https');

async function debugDatabaseConnection() {
  console.log('🔍 Debugging database connection...');
  
  try {
    // Test the database endpoint
    const response = await fetch('https://evenpappbackend-production.up.railway.app/api/v1/test-db');
    const data = await response.json();
    
    console.log('Database Test Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Test health endpoint
    const healthResponse = await fetch('https://evenpappbackend-production.up.railway.app/api/v1/health');
    const healthData = await healthResponse.json();
    console.log('\nHealth Response:');
    console.log(JSON.stringify(healthData, null, 2));
    
    // Test if we can get any response from the backend
    console.log('\n🔍 Testing backend availability...');
    try {
      const testResponse = await fetch('https://evenpappbackend-production.up.railway.app/api/v1/');
      console.log('Backend root status:', testResponse.status);
    } catch (error) {
      console.log('Backend root error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugDatabaseConnection();
