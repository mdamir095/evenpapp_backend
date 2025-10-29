const { MongoClient } = require('mongodb');

async function testDatabaseUrls() {
  // Test different possible database URLs
  const urls = [
    'mongodb+srv://shiv:Admin%40123@eventbooking.4hxsvht.mongodb.net/?retryWrites=true&w=majority&appName=EventBooking',
    'mongodb+srv://shiv:Admin%40123@eventbooking.4hxsvht.mongodb.net/eventbooking?retryWrites=true&w=majority&appName=EventBooking',
    'mongodb+srv://shiv:Admin%40123@eventbooking.4hxsvht.mongodb.net/event_booking?retryWrites=true&w=majority&appName=EventBooking'
  ];
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`\n🔍 Testing URL ${i + 1}:`);
    console.log('URL:', url);
    
    const client = new MongoClient(url);
    
    try {
      await client.connect();
      console.log('✅ Connected successfully');
      
      // Get database name from URL
      const dbName = new URL(url).pathname.substring(1) || 'eventbooking';
      console.log('Database name:', dbName);
      
      const db = client.db(dbName);
      
      // List collections
      const collections = await db.listCollections().toArray();
      console.log('Collections:', collections.map(c => c.name));
      
      // Check users collection
      const usersCollection = db.collection('users');
      const userCount = await usersCollection.countDocuments();
      console.log('Users count:', userCount);
      
      if (userCount > 0) {
        const user = await usersCollection.findOne({ email: 'shiv@whiz-solutions.com' });
        if (user) {
          console.log('✅ FOUND TARGET USER!');
          console.log('User email:', user.email);
        } else {
          console.log('❌ Target user not found');
        }
      }
      
    } catch (error) {
      console.log('❌ Connection failed:', error.message);
    } finally {
      await client.close();
    }
  }
}

testDatabaseUrls();
