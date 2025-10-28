const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function checkEventbookingUser() {
  const uri = 'mongodb+srv://shiv:Admin%40123@eventbooking.4hxsvht.mongodb.net/?retryWrites=true&w=majority&appName=EventBooking';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('eventbooking');
    const users = db.collection('user');
    
    // Get the user
    const user = await users.findOne({ email: 'shiv@whiz-solutions.com' });
    console.log('\n👤 User details:');
    console.log('Found:', !!user);
    if (user) {
      console.log('ID:', user._id);
      console.log('Email:', user.email);
      console.log('First Name:', user.firstName);
      console.log('Last Name:', user.lastName);
      console.log('Is Active:', user.isActive);
      console.log('Is Mobile App User:', user.isMobileAppUser);
      console.log('Is Blocked:', user.isBlocked);
      console.log('Has Password:', !!user.password);
      console.log('Role IDs:', user.roleIds);
      console.log('Created At:', user.createdAt);
      console.log('Updated At:', user.updatedAt);
      
      // Test password
      console.log('\n🔐 Password test:');
      const passwordMatch = await bcrypt.compare('Test@123', user.password);
      console.log('Password match:', passwordMatch);
      
      // Test eligibility
      console.log('\n✅ Eligibility test:');
      const isEligible = !user.isBlocked && (user.isMobileAppUser || (user.isActive && !user.isMobileAppUser));
      console.log('Is eligible:', isEligible);
      console.log('- isBlocked:', user.isBlocked);
      console.log('- isMobileAppUser:', user.isMobileAppUser);
      console.log('- isActive:', user.isActive);
    }
    
    // Check if there are any other users
    console.log('\n📊 All users in eventbooking.user:');
    const allUsers = await users.find({}).toArray();
    allUsers.forEach((u, index) => {
      console.log(`${index + 1}. Email: ${u.email}, Type: ${u.userType || 'N/A'}, Active: ${u.isActive || false}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkEventbookingUser();
