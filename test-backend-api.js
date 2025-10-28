const https = require('https');

async function testBackendAPI() {
  const backendUrl = 'https://evenpappbackend-production.up.railway.app';
  
  console.log('🔍 Testing backend API directly...');
  
  try {
    // Test 1: Health check
    console.log('\n1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${backendUrl}/api/v1/health`);
    const healthData = await healthResponse.json();
    console.log('Health check response:', healthData);
    
    // Test 2: Database test
    console.log('\n2️⃣ Testing database endpoint...');
    const dbResponse = await fetch(`${backendUrl}/api/v1/test-db`);
    const dbData = await dbResponse.json();
    console.log('Database test response:', dbData);
    
    // Test 3: Login test
    console.log('\n3️⃣ Testing login endpoint...');
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
    
    if (loginResponse.status === 200) {
      console.log('🎉 LOGIN SUCCESSFUL!');
    } else {
      console.log('❌ LOGIN FAILED');
    }
    
  } catch (error) {
    console.error('❌ Error testing backend API:', error.message);
  }
}

testBackendAPI();
