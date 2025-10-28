const https = require('https');

async function testBackendDirect() {
  const backendUrl = 'https://evenpappbackend-production.up.railway.app';
  
  console.log('🔍 Testing backend directly...');
  
  // Test health endpoint
  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${backendUrl}/api/v1/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  // Test login endpoint
  try {
    console.log('2. Testing login endpoint...');
    const loginResponse = await fetch(`${backendUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'shiv@whiz-solutions.com',
        password: 'Test@123'
      })
    });
    
    console.log('Login response status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
  } catch (error) {
    console.log('❌ Login test failed:', error.message);
  }
}

testBackendDirect();
