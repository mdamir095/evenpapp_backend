const { MongoClient } = require('mongodb');

async function verifyDatabaseState() {
  const uri = 'mongodb+srv://shiv:Admin%40123@eventbooking.4hxsvht.mongodb.net/?retryWrites=true&w=majority&appName=EventBooking';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('eventbooking');
    
    // Check all collections
    console.log('\n📋 All collections in eventbooking database:');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });
    
    // Check each collection for our user
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
            
            // Show full user details
            console.log('\n👤 User details:');
            console.log('ID:', sample._id);
            console.log('Email:', sample.email);
            console.log('First Name:', sample.firstName);
            console.log('Last Name:', sample.lastName);
            console.log('Is Active:', sample.isActive);
            console.log('Is Mobile App User:', sample.isMobileAppUser);
            console.log('Is Blocked:', sample.isBlocked);
            console.log('User Type:', sample.userType);
            console.log('Role IDs:', sample.roleIds);
          }
        }
      }
    }
    
    // Also check if there are any users in other databases
    console.log('\n🔍 Checking other databases...');
    const possibleDbs = ['event_booking', 'eventbookingapp', 'evenpapp'];
    for (const dbName of possibleDbs) {
      try {
        const testDb = client.db(dbName);
        const collections = await testDb.listCollections().toArray();
        if (collections.length > 0) {
          console.log(`\n📊 Database '${dbName}':`);
          for (const col of collections) {
            const collection = testDb.collection(col.name);
            const count = await collection.countDocuments();
            if (count > 0) {
              const sample = await collection.findOne();
              if (sample && sample.email === 'shiv@whiz-solutions.com') {
                console.log(`  - ✅ FOUND TARGET USER in ${dbName}.${col.name}`);
              }
            }
          }
        }
      } catch (error) {
        // Database doesn't exist or no access
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

verifyDatabaseState();
