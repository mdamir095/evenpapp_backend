const https = require('https');

async function testWithDelay() {
  console.log('🔍 Testing with longer delay...');
  
  try {
    // Wait longer for deployment
    console.log('⏳ Waiting 60 seconds for deployment...');
    await new Promise(resolve => setTimeout(resolve, 60000));
    
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
    } else {
      console.log('\n❌ LOGIN STILL FAILING');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testWithDelay();
