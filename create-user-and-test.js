const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function createUserAndTest() {
  const uri = 'mongodb+srv://shiv:Admin%40123@eventbooking.4hxsvht.mongodb.net/?retryWrites=true&w=majority&appName=EventBooking';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('eventbooking');
    const users = db.collection('user');
    
    // Delete existing user first
    await users.deleteOne({ email: 'shiv@whiz-solutions.com' });
    console.log('🗑️ Deleted existing user');
    
    // Create fresh user
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    const testUser = {
      email: 'shiv@whiz-solutions.com',
      password: hashedPassword,
      firstName: 'Shiv',
      lastName: 'Test',
      phoneNumber: '1234567890',
      countryCode: '+1',
      isActive: true,
      isMobileAppUser: true,
      userType: 'USER',
      isBlocked: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await users.insertOne(testUser);
    console.log('✅ User created:', result.insertedId);
    
    // Verify user
    const user = await users.findOne({ email: 'shiv@whiz-solutions.com' });
    console.log('✅ User verified:', !!user);
    
    // Test password
    const match = await bcrypt.compare('Test@123', user.password);
    console.log('✅ Password test:', match);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

createUserAndTest();
