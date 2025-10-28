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
        isBlocked: existingUser.isBlocked,
        roleIds: existingUser.roleIds
      });
      
      // Check if user has roles
      if (!existingUser.roleIds || existingUser.roleIds.length === 0) {
        console.log('User has no roles, updating...');
        const roles = db.collection('role');
        const userRole = await roles.findOne({ name: 'USER' });
        
        if (userRole) {
          await users.updateOne(
            { _id: existingUser._id },
            { $set: { roleIds: [userRole._id], updatedAt: new Date() } }
          );
          console.log('User updated with role:', userRole._id);
        } else {
          console.log('USER role not found, creating it...');
          // Create role and feature if they don't exist
          const features = db.collection('feature');
          let userFeature = await features.findOne({ name: 'USER' });
          
          if (!userFeature) {
            userFeature = await features.insertOne({
              name: 'USER',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            userFeature = await features.findOne({ name: 'USER' });
          }
          
          const newRole = await roles.insertOne({
            name: 'USER',
            featureIds: [userFeature._id],
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await users.updateOne(
            { _id: existingUser._id },
            { $set: { roleIds: [newRole.insertedId], updatedAt: new Date() } }
          );
          console.log('USER role created and assigned to user');
        }
      }
      return;
    }
    
    // First, let's check if roles exist
    const roles = db.collection('role');
    const userRole = await roles.findOne({ name: 'USER' });
    console.log('User role found:', !!userRole);
    
    if (!userRole) {
      console.log('Creating USER role...');
      const features = db.collection('feature');
      let userFeature = await features.findOne({ name: 'USER' });
      
      if (!userFeature) {
        userFeature = await features.insertOne({
          name: 'USER',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        userFeature = await features.findOne({ name: 'USER' });
      }
      
      const newRole = await roles.insertOne({
        name: 'USER',
        featureIds: [userFeature._id],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('USER role created:', newRole.insertedId);
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
      roleIds: userRole ? [userRole._id] : [],
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
