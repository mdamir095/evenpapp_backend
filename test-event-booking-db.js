const https = require('https');

async function testEventBookingDB() {
  console.log('🔍 Testing connection to event_booking database...');
  
  try {
    // Wait for deployment
    console.log('⏳ Waiting 30 seconds for deployment...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Test database endpoint
    console.log('\n1️⃣ Database Test:');
    const dbResponse = await fetch('https://evenpappbackend-production.up.railway.app/api/v1/test-db');
    const dbData = await dbResponse.json();
    console.log('Database Status:', dbData.data?.status);
    console.log('User Count:', dbData.data?.userCount);
    console.log('Test User Found:', dbData.data?.testUserFound);
    console.log('Test User Email:', dbData.data?.testUserEmail);
    
    // Test login
    console.log('\n2️⃣ Login Test:');
    const loginResponse = await fetch('https://evenpappbackend-production.up.railway.app/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'shiv@whiz-solutions.com',
        password: 'Test@123'
      })
    });
    
    console.log('Login Status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);
    
    if (loginResponse.status === 200) {
      console.log('\n🎉 LOGIN SUCCESSFUL!');
      console.log('✅ The event_booking database connection worked!');
    } else {
      console.log('\n❌ LOGIN STILL FAILING');
    }
    
    // Test frontend login
    console.log('\n3️⃣ Frontend Login Test:');
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
    
    console.log('Frontend Login Status:', frontendLoginResponse.status);
    const frontendLoginData = await frontendLoginResponse.json();
    console.log('Frontend Login Response:', frontendLoginData);
    
    if (frontendLoginResponse.status === 200) {
      console.log('\n🎉 FRONTEND LOGIN SUCCESSFUL!');
    } else {
      console.log('\n❌ FRONTEND LOGIN STILL FAILING');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEventBookingDB();
