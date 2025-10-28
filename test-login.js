const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function testLogin() {
  const uri = 'mongodb+srv://shiv:Admin%40123@eventbooking.4hxsvht.mongodb.net/?retryWrites=true&w=majority&appName=EventBooking';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('eventbooking');
    const users = db.collection('user');
    
    // Test the exact login credentials
    const email = 'shiv@whiz-solutions.com';
    const password = 'Test@123';
    
    console.log('🔍 Testing login for:', email);
    
    const user = await users.findOne({ email: email });
    console.log('👤 User found:', !!user);
    
    if (user) {
      console.log('📋 User details:', {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isBlocked: user.isBlocked,
        isMobileAppUser: user.isMobileAppUser,
        isActive: user.isActive,
        hasPassword: !!user.password,
        roleIds: user.roleIds
      });
      
      // Test password
      const match = await bcrypt.compare(password, user.password);
      console.log('🔐 Password match:', match);
      
      // Test eligibility
      const isEligible = !user.isBlocked && (user.isMobileAppUser || (user.isActive && !user.isMobileAppUser));
      console.log('✅ User eligible:', isEligible);
      
      if (match && isEligible) {
        console.log('🎉 Login test PASSED - user should be able to login');
      } else {
        console.log('❌ Login test FAILED - user cannot login');
        console.log('   - Password match:', match);
        console.log('   - User eligible:', isEligible);
      }
    } else {
      console.log('❌ User not found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

testLogin();
