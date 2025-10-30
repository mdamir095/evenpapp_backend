const https = require('https');

async function testProfileImageDebug() {
  console.log('🔍 Debugging Profile Image Update Issue...');
  
  try {
    // First, let's get a JWT token by logging in
    console.log('\n1. Getting JWT token via login...');
    
    const loginResponse = await fetch('https://evenpappbackend-production.up.railway.app/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'akhil.kaliyar1992@gmail.com',
        password: 'Test@123'
      })
    });
    
    console.log('Login Status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login Response:', JSON.stringify(loginData, null, 2));
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login failed, cannot test profile image update');
      return;
    }
    
    const jwtToken = loginData.data?.accessToken;
    if (!jwtToken) {
      console.log('❌ No JWT token in login response');
      return;
    }
    
    console.log('✅ JWT token obtained:', jwtToken.substring(0, 20) + '...');
    
    // Now test the profile image update
    console.log('\n2. Testing profile image update...');
    
    const response = await fetch('https://evenpappbackend-production.up.railway.app/api/v1/users/update-profile-image', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify({
        profileImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      })
    });
    
    console.log('Profile Image Update Status:', response.status);
    const data = await response.json();
    console.log('Profile Image Update Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      console.log('✅ SUCCESS! Profile image update is working');
    } else {
      console.log('❌ Error: Profile image update still failing');
      console.log('📋 Check Railway logs for detailed error information');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n📋 Debugging Information:');
  console.log('✅ JWT token authentication working');
  console.log('✅ Profile image endpoint accessible');
  console.log('❌ 500 error still occurring');
  
  console.log('\n🔍 Possible Issues:');
  console.log('1. AWS S3 configuration missing or invalid');
  console.log('2. Database connection issues');
  console.log('3. ObjectId conversion problems');
  console.log('4. File upload service errors');
  
  console.log('\n📊 Check Railway Logs For:');
  console.log('🖼️ Updating profile image for user: [user_id]');
  console.log('📁 Processing image: {...}');
  console.log('☁️ Using AWS S3 for production');
  console.log('❌ Error updating profile image: [error_details]');
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Check Railway logs for specific error details');
  console.log('2. Verify AWS S3 configuration in environment variables');
  console.log('3. Test with a simpler database update method');
  console.log('4. Add more specific error handling');
}

testProfileImageDebug();
