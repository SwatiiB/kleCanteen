import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kleCanteen';

async function fixOrderIdIndex() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get the orderdetails collection
    const db = mongoose.connection.db;
    const orderDetailsCollection = db.collection('orderdetails');

    // Get all indexes on the orderdetails collection
    const indexes = await orderDetailsCollection.indexes();
    console.log('Current indexes:', indexes);

    // Find and drop the orderId index if it exists
    for (const index of indexes) {
      if (index.key && index.key.orderId) {
        console.log('Found orderId index:', index);
        try {
          await orderDetailsCollection.dropIndex(index.name);
          console.log(`Dropped index: ${index.name}`);
        } catch (error) {
          console.error(`Error dropping index ${index.name}:`, error);
        }
      }
    }

    // Update all documents with null orderId to have a unique UUID
    const nullOrderIdDocs = await orderDetailsCollection.find({ orderId: null }).toArray();
    console.log(`Found ${nullOrderIdDocs.length} documents with null orderId`);

    for (const doc of nullOrderIdDocs) {
      const newOrderId = uuidv4();
      await orderDetailsCollection.updateOne(
        { _id: doc._id },
        { $set: { orderId: newOrderId } }
      );
      console.log(`Updated document ${doc._id} with new orderId: ${newOrderId}`);
    }

    // Create a new unique index for orderId
    console.log('Creating new unique index for orderId...');
    await orderDetailsCollection.createIndex(
      { orderId: 1 },
      { 
        unique: true,
        sparse: true, // This makes the index ignore null values
        name: 'orderId_unique_index'
      }
    );
    console.log('Created new unique index for orderId');

    // Verify the new index
    const updatedIndexes = await orderDetailsCollection.indexes();
    console.log('Updated indexes:', updatedIndexes);

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    console.log('Index fix completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing orderId index:', error);
    process.exit(1);
  }
}

// Run the function
fixOrderIdIndex();
