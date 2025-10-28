const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function debugProductionUser() {
  // Use the exact same URL as in production
  const uri = 'mongodb+srv://shiv:Admin%40123@eventbooking.4hxsvht.mongodb.net/?retryWrites=true&w=majority&appName=EventBooking';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to production MongoDB');
    
    const db = client.db('eventbooking');
    const users = db.collection('user');
    
    // Test the exact login credentials
    const email = 'shiv@whiz-solutions.com';
    const password = 'Test@123';
    
    console.log('🔍 Testing production login for:', email);
    
    // Find user by email
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
        roleIds: user.roleIds,
        passwordLength: user.password ? user.password.length : 0
      });
      
      // Test password
      const match = await bcrypt.compare(password, user.password);
      console.log('🔐 Password match:', match);
      
      // Test eligibility
      const isEligible = !user.isBlocked && (user.isMobileAppUser || (user.isActive && !user.isMobileAppUser));
      console.log('✅ User eligible:', isEligible);
      
      if (match && isEligible) {
        console.log('🎉 Production login test PASSED');
      } else {
        console.log('❌ Production login test FAILED');
        console.log('   - Password match:', match);
        console.log('   - User eligible:', isEligible);
        console.log('   - isBlocked:', user.isBlocked);
        console.log('   - isMobileAppUser:', user.isMobileAppUser);
        console.log('   - isActive:', user.isActive);
      }
    } else {
      console.log('❌ User not found in production database');
      
      // List all users to see what exists
      console.log('\n📋 All users in production database:');
      const allUsers = await users.find({}).toArray();
      allUsers.forEach((u, index) => {
        console.log(`${index + 1}. Email: ${u.email}, Type: ${u.userType || 'N/A'}, Active: ${u.isActive || false}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

debugProductionUser();
