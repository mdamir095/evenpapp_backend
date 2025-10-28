const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function testProductionLogin() {
  const uri = 'mongodb+srv://shiv:Admin%40123@eventbooking.4hxsvht.mongodb.net/?retryWrites=true&w=majority&appName=EventBooking';
  const client = new MongoClient(uri);
  
  try {
    console.log('🔗 Connecting to production database...');
    await client.connect();
    console.log('✅ Connected to production database successfully');
    
    const db = client.db('eventbooking');
    const users = db.collection('user');
    
    // Test 1: Check if database is accessible
    console.log('\n📊 Test 1: Database accessibility');
    const userCount = await users.countDocuments();
    console.log(`Total users in database: ${userCount}`);
    
    // Test 2: Check if our test user exists
    console.log('\n👤 Test 2: User existence check');
    const testEmail = 'shiv@whiz-solutions.com';
    const testPassword = 'Test@123';
    
    const user = await users.findOne({ email: testEmail });
    console.log(`User found: ${!!user}`);
    
    if (user) {
      console.log('User details:', {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        isMobileAppUser: user.isMobileAppUser,
        isBlocked: user.isBlocked,
        hasPassword: !!user.password,
        roleIds: user.roleIds
      });
      
      // Test 3: Password verification
      console.log('\n🔐 Test 3: Password verification');
      const passwordMatch = await bcrypt.compare(testPassword, user.password);
      console.log(`Password match: ${passwordMatch}`);
      
      // Test 4: User eligibility
      console.log('\n✅ Test 4: User eligibility check');
      const isEligible = !user.isBlocked && (user.isMobileAppUser || (user.isActive && !user.isMobileAppUser));
      console.log(`User eligible: ${isEligible}`);
      console.log(`- isBlocked: ${user.isBlocked}`);
      console.log(`- isMobileAppUser: ${user.isMobileAppUser}`);
      console.log(`- isActive: ${user.isActive}`);
      
      if (passwordMatch && isEligible) {
        console.log('\n🎉 LOGIN SHOULD WORK - All conditions met');
      } else {
        console.log('\n❌ LOGIN WILL FAIL - Conditions not met');
        console.log(`- Password match: ${passwordMatch}`);
        console.log(`- User eligible: ${isEligible}`);
      }
    } else {
      console.log('\n❌ USER NOT FOUND - Login will fail');
      
      // List all users to see what exists
      console.log('\n📋 All users in database:');
      const allUsers = await users.find({}).limit(10).toArray();
      allUsers.forEach((u, index) => {
        console.log(`${index + 1}. Email: ${u.email}, Type: ${u.userType || 'N/A'}, Active: ${u.isActive || false}`);
      });
    }
    
    // Test 5: Create user if not exists
    if (!user) {
      console.log('\n🔧 Test 5: Creating test user');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      const newUser = {
        email: testEmail,
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
      
      const result = await users.insertOne(newUser);
      console.log(`User created: ${result.insertedId}`);
      
      // Verify the created user
      const createdUser = await users.findOne({ email: testEmail });
      const passwordTest = await bcrypt.compare(testPassword, createdUser.password);
      console.log(`Created user password test: ${passwordTest}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

testProductionLogin();
