const https = require('https');
const FormData = require('form-data');
const fs = require('fs');

async function testProfileUpload() {
  console.log('🔍 Testing profile upload endpoint...');
  
  try {
    // First, let's test if the endpoint exists
    console.log('\n1️⃣ Testing endpoint availability:');
    const healthResponse = await fetch('https://evenpappbackend-production.up.railway.app/api/v1/health');
    const healthData = await healthResponse.json();
    console.log('Health Status:', healthData.status);
    
    // Test the profile upload endpoint with a simple request
    console.log('\n2️⃣ Testing profile upload endpoint:');
    try {
      const uploadResponse = await fetch('https://evenpappbackend-production.up.railway.app/api/v1/profile/upload', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token', // This will likely fail auth but we can see the error
        }
      });
      
      console.log('Upload Response Status:', uploadResponse.status);
      const uploadData = await uploadResponse.json();
      console.log('Upload Response:', uploadData);
      
    } catch (error) {
      console.log('Upload Error:', error.message);
    }
    
    // Test with a proper file upload
    console.log('\n3️⃣ Testing with file upload:');
    try {
      // Create a simple test image buffer
      const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
      
      const formData = new FormData();
      formData.append('file', testImageBuffer, {
        filename: 'test.png',
        contentType: 'image/png'
      });
      
      const uploadResponse = await fetch('https://evenpappbackend-production.up.railway.app/api/v1/profile/upload', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
          ...formData.getHeaders()
        },
        body: formData
      });
      
      console.log('File Upload Status:', uploadResponse.status);
      const uploadData = await uploadResponse.json();
      console.log('File Upload Response:', uploadData);
      
    } catch (error) {
      console.log('File Upload Error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProfileUpload();
