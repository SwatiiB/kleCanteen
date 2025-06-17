import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kleCanteen';

async function fixUniIdIndex() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get all indexes on the users collection
    const indexes = await usersCollection.indexes();
    console.log('Current indexes:', indexes);

    // Find and drop the uniId index if it exists
    for (const index of indexes) {
      if (index.key && index.key.uniId) {
        console.log('Found uniId index:', index);
        try {
          await usersCollection.dropIndex(index.name);
          console.log(`Dropped index: ${index.name}`);
        } catch (error) {
          console.error(`Error dropping index ${index.name}:`, error);
        }
      }
    }

    // Create a new partial index for uniId
    console.log('Creating new partial index for uniId...');
    await usersCollection.createIndex(
      { uniId: 1 },
      { 
        unique: true,
        partialFilterExpression: { uniId: { $type: 'string', $ne: '' } },
        name: 'uniId_partial_index'
      }
    );
    console.log('Created new partial index for uniId');

    // Verify the new index
    const updatedIndexes = await usersCollection.indexes();
    console.log('Updated indexes:', updatedIndexes);

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    console.log('Index fix completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing uniId index:', error);
    process.exit(1);
  }
}

// Run the function
fixUniIdIndex();
