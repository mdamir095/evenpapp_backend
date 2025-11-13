/**
 * Script to verify and create offer collections in MongoDB
 * Run this with: node scripts/create-offer-collections.js
 */

const { MongoClient } = require('mongodb');

// MongoDB connection URL - update this with your connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shiv:Admin@123@eventbooking.4hxsvht.mongodb.net/event_booking?retryWrites=true&w=majority&appName=EventBooking';
const DB_NAME = 'event_booking';

async function createCollections() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(DB_NAME);

    // List of collections to create/verify
    const collections = ['offers', 'vendor_offers', 'admin_offers'];

    for (const collectionName of collections) {
      // Check if collection exists
      const collectionsList = await db.listCollections({ name: collectionName }).toArray();
      
      if (collectionsList.length === 0) {
        // Create collection
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } else {
        console.log(`ℹ️  Collection already exists: ${collectionName}`);
      }

      // Get collection stats
      const stats = await db.collection(collectionName).stats();
      console.log(`   - Documents: ${stats.count}`);
      console.log(`   - Size: ${(stats.size / 1024).toFixed(2)} KB`);
    }

    console.log('\n✅ All collections verified/created successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

createCollections();

