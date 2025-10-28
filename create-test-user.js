const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function createTestUser() {
  const uri = 'mongodb+srv://shiv:Admin%40123@eventbooking.4hxsvht.mongodb.net/eventbooking?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('eventbooking');
    const users = db.collection('user');
    
    // Check if user already exists
    const existingUser = await users.findOne({ email: 'shiv@whiz-solutions.com' });
    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      return;
    }
    
    // Create a test user
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
    console.log('User created successfully:', result.insertedId);
    console.log('Email:', testUser.email);
    console.log('Password:', 'Test@123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

createTestUser();
