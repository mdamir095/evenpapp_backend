const https = require('https');

async function testRailwayDebug() {
  const backendUrl = 'https://evenpappbackend-production.up.railway.app';
  
  console.log('🔍 Testing Railway backend debug...');
  
  try {
    // Test 1: Health check
    console.log('\n1️⃣ Health Check:');
    const healthResponse = await fetch(`${backendUrl}/api/v1/health`);
    const healthData = await healthResponse.json();
    console.log('Status:', healthData.status);
    console.log('Environment:', healthData.data?.environment);
    
    // Test 2: Database test
    console.log('\n2️⃣ Database Test:');
    const dbResponse = await fetch(`${backendUrl}/api/v1/test-db`);
    const dbData = await dbResponse.json();
    console.log('Database Status:', dbData.data?.status);
    console.log('User Count:', dbData.data?.userCount);
    console.log('Test User Found:', dbData.data?.testUserFound);
    console.log('Test User Email:', dbData.data?.testUserEmail);
    
    // Test 3: Try different login approaches
    console.log('\n3️⃣ Login Tests:');
    
    // Test 3a: Direct backend login
    console.log('\n3a. Direct Backend Login:');
    const directLoginResponse = await fetch(`${backendUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'shiv@whiz-solutions.com',
        password: 'Test@123'
      })
    });
    console.log('Status:', directLoginResponse.status);
    const directLoginData = await directLoginResponse.json();
    console.log('Response:', directLoginData);
    
    // Test 3b: Frontend proxy login
    console.log('\n3b. Frontend Proxy Login:');
    const frontendLoginResponse = await fetch('https://evenpappfrontend-production.up.railway.app/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'shiv@whiz-solutions.com',
        password: 'Test@123'
      })
    });
    console.log('Status:', frontendLoginResponse.status);
    const frontendLoginData = await frontendLoginResponse.json();
    console.log('Response:', frontendLoginData);
    
    // Test 4: Check if there are any CORS issues
    console.log('\n4️⃣ CORS Test:');
    try {
      const corsResponse = await fetch(`${backendUrl}/api/v1/auth/login`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://evenpappfrontend-production.up.railway.app',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      console.log('CORS Status:', corsResponse.status);
      console.log('CORS Headers:', Object.fromEntries(corsResponse.headers.entries()));
    } catch (error) {
      console.log('CORS Error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRailwayDebug();
