const { MongoClient } = require('mongodb');

async function checkUser() {
  const uri = 'mongodb+srv://shiv:Admin%40123@eventbooking.4hxsvht.mongodb.net/eventbooking?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('eventbooking');
    const users = db.collection('user');
    
    // Check for the specific user
    const user = await users.findOne({ email: 'shiv@whiz-solutions.com' });
    console.log('User found:', user);
    
    if (user) {
      console.log('User details:');
      console.log('- ID:', user._id);
      console.log('- Email:', user.email);
      console.log('- Password hash exists:', !!user.password);
      console.log('- isBlocked:', user.isBlocked);
      console.log('- isMobileAppUser:', user.isMobileAppUser);
      console.log('- isActive:', user.isActive);
      console.log('- userType:', user.userType);
    } else {
      console.log('No user found with email: shiv@whiz-solutions.com');
    }
    
    // List all users to see what exists
    console.log('\nAll users in database:');
    const allUsers = await users.find({}).toArray();
    allUsers.forEach((u, index) => {
      console.log(`${index + 1}. Email: ${u.email}, Type: ${u.userType || 'N/A'}, Active: ${u.isActive || false}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkUser();
