const https = require('https');
const FormData = require('form-data');

async function testProfileUploadFix() {
  console.log('🔍 Testing profile upload fix...');
  
  try {
    // Wait for deployment
    console.log('⏳ Waiting 30 seconds for deployment...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // First, login to get a valid token
    console.log('\n1️⃣ Getting authentication token:');
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
    
    if (loginResponse.status !== 200) {
      console.log('Login failed:', loginData);
      return;
    }
    
    const token = loginData.data.accessToken;
    console.log('Token obtained:', token ? 'Yes' : 'No');
    
    // Now test the profile upload with the valid token
    console.log('\n2️⃣ Testing profile upload with multer fix:');
    try {
      // Create a simple test image buffer (1x1 PNG)
      const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      
      const formData = new FormData();
      formData.append('file', testImageBuffer, {
        filename: 'test.png',
        contentType: 'image/png'
      });
      
      const uploadResponse = await fetch('https://evenpappbackend-production.up.railway.app/api/v1/profile/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...formData.getHeaders()
        },
        body: formData
      });
      
      console.log('Upload Response Status:', uploadResponse.status);
      const uploadData = await uploadResponse.json();
      console.log('Upload Response:', uploadData);
      
      if (uploadResponse.status === 200) {
        console.log('✅ Profile upload successful!');
        console.log('✅ The multer dependency fix worked!');
      } else if (uploadResponse.status === 500) {
        console.log('❌ Still getting 500 error - there might be another issue');
      } else {
        console.log('❌ Profile upload failed with status:', uploadResponse.status);
      }
      
    } catch (error) {
      console.log('Upload Error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProfileUploadFix();
