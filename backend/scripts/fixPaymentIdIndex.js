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
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'kleCanteen';

async function fixPaymentIdIndex() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get the payments collection
    const db = mongoose.connection.useDb(DB_NAME);
    const paymentsCollection = db.collection('payments');

    // Get all indexes on the payments collection
    const indexes = await paymentsCollection.indexes();
    console.log('Current indexes on payments collection:', indexes);

    // Find and drop the paymentId index if it exists
    for (const index of indexes) {
      if (index.key && index.key.paymentId) {
        console.log('Found paymentId index:', index);
        try {
          await paymentsCollection.dropIndex(index.name);
          console.log(`Dropped index: ${index.name}`);
        } catch (error) {
          console.error(`Error dropping index ${index.name}:`, error);
        }
      }
    }

    // Create a new index on razorpayDetails.paymentId that ignores null values
    console.log('Creating new index for razorpayDetails.paymentId...');
    await paymentsCollection.createIndex(
      { 'razorpayDetails.paymentId': 1 },
      {
        unique: true,
        sparse: true, // This makes the index ignore null values
        name: 'razorpayDetails_paymentId_unique_index'
      }
    );
    console.log('Created new index for razorpayDetails.paymentId');

    // Verify the new index
    const updatedIndexes = await paymentsCollection.indexes();
    console.log('Updated indexes:', updatedIndexes);

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    console.log('Index fix completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing paymentId index:', error);
    process.exit(1);
  }
}

// Run the function
fixPaymentIdIndex();
