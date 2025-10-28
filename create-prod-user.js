const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function createProdUser() {
  // Use the same URL as in production
  const uri = 'mongodb+srv://shiv:Admin%40123@eventbooking.4hxsvht.mongodb.net/?retryWrites=true&w=majority&appName=EventBooking';
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
      console.log('User details:', {
        id: existingUser._id,
        email: existingUser.email,
        isActive: existingUser.isActive,
        isMobileAppUser: existingUser.isMobileAppUser,
        isBlocked: existingUser.isBlocked
      });
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
    
    // Verify the user was created
    const createdUser = await users.findOne({ email: 'shiv@whiz-solutions.com' });
    console.log('Verification - User found:', !!createdUser);
    if (createdUser) {
      console.log('User details:', {
        id: createdUser._id,
        email: createdUser.email,
        isActive: createdUser.isActive,
        isMobileAppUser: createdUser.isMobileAppUser,
        isBlocked: createdUser.isBlocked
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

createProdUser();
