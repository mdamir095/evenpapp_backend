const { MongoClient } = require('mongodb');

async function debugDatabaseStructure() {
  const uri = 'mongodb+srv://shiv:Admin%40123@eventbooking.4hxsvht.mongodb.net/?retryWrites=true&w=majority&appName=EventBooking';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    // List all databases
    const admin = client.db().admin();
    const databases = await admin.listDatabases();
    console.log('\n📊 Available databases:');
    databases.databases.forEach(db => {
      console.log(`- ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Check eventbooking database
    const db = client.db('eventbooking');
    console.log('\n📋 Collections in eventbooking database:');
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
        // Check if this collection has user-like documents
        const sample = await collection.findOne();
        if (sample && sample.email) {
          console.log(`  - Sample document has email: ${sample.email}`);
          if (sample.email === 'shiv@whiz-solutions.com') {
            console.log(`  - ✅ FOUND TARGET USER in collection '${col.name}'`);
          }
        }
      }
    }
    
    // Also check if there's a different database name
    const possibleDbs = ['eventbooking', 'event_booking', 'eventbookingapp', 'evenpapp'];
    for (const dbName of possibleDbs) {
      try {
        const testDb = client.db(dbName);
        const collections = await testDb.listCollections().toArray();
        if (collections.length > 0) {
          console.log(`\n🔍 Database '${dbName}' has ${collections.length} collections`);
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

debugDatabaseStructure();
