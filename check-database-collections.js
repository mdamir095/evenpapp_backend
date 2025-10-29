const { MongoClient } = require('mongodb');

async function checkDatabaseCollections() {
  const uri = 'mongodb+srv://shiv:Admin%40123@eventbooking.4hxsvht.mongodb.net/?retryWrites=true&w=majority&appName=EventBooking';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('eventbooking');
    
    // List all collections
    console.log('\n📋 All collections in eventbooking database:');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });
    
    // Check each collection for users
    for (const col of collections) {
      const collection = db.collection(col.name);
      const count = await collection.countDocuments();
      console.log(`\n📊 Collection '${col.name}': ${count} documents`);
      
      if (count > 0) {
        const sample = await collection.findOne();
        if (sample && sample.email) {
          console.log(`  - Sample document email: ${sample.email}`);
          if (sample.email === 'shiv@whiz-solutions.com') {
            console.log(`  - ✅ FOUND TARGET USER in collection '${col.name}'`);
          }
        }
      }
    }
    
    // Also check if there's a 'users' collection specifically
    console.log('\n🔍 Checking for users collection specifically:');
    try {
      const usersCollection = db.collection('users');
      const usersCount = await usersCollection.countDocuments();
      console.log(`Users collection count: ${usersCount}`);
      
      if (usersCount > 0) {
        const user = await usersCollection.findOne({ email: 'shiv@whiz-solutions.com' });
        if (user) {
          console.log('✅ FOUND USER in users collection!');
          console.log('User details:', {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          });
        } else {
          console.log('❌ User not found in users collection');
        }
      }
    } catch (error) {
      console.log('Error checking users collection:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkDatabaseCollections();
