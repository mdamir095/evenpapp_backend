const https = require('https');
const FormData = require('form-data');

async function debugMultipart() {
  console.log('🔍 Debugging multipart form data...');
  
  try {
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
    
    // Test with a very simple form data
    console.log('\n2️⃣ Testing with simple form data:');
    try {
      const formData = new FormData();
      formData.append('file', 'test content', {
        filename: 'test.txt',
        contentType: 'text/plain'
      });
      
      console.log('Form data created');
      console.log('Form data headers:', formData.getHeaders());
      
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
      
    } catch (error) {
      console.log('Upload Error:', error.message);
    }
    
    // Test with a different approach - using fetch with FormData directly
    console.log('\n3️⃣ Testing with native FormData:');
    try {
      const formData = new FormData();
      formData.append('file', 'test content', 'test.txt');
      
      const uploadResponse = await fetch('https://evenpappbackend-production.up.railway.app/api/v1/profile/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      console.log('Upload Response Status:', uploadResponse.status);
      const uploadData = await uploadResponse.json();
      console.log('Upload Response:', uploadData);
      
    } catch (error) {
      console.log('Upload Error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugMultipart();
