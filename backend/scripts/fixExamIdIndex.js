import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kleCanteen';
const DB_NAME = 'kleCanteen';

async function fixExamIdIndex() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get the examdetails collection
    const db = mongoose.connection.db;
    const examDetailsCollection = db.collection('examdetails');

    // Get all indexes on the examdetails collection
    const indexes = await examDetailsCollection.indexes();
    console.log('Current indexes on examdetails collection:', indexes);

    // Find and drop the examId index if it exists
    for (const index of indexes) {
      if (index.key && index.key.examId) {
        console.log('Found examId index:', index);
        try {
          await examDetailsCollection.dropIndex(index.name);
          console.log(`Dropped index: ${index.name}`);
        } catch (error) {
          console.error(`Error dropping index ${index.name}:`, error);
        }
      }
    }

    // Update all documents with null or missing examId to have a unique UUID
    const nullExamIdDocs = await examDetailsCollection.find({
      $or: [
        { examId: null },
        { examId: { $exists: false } }
      ]
    }).toArray();
    console.log(`Found ${nullExamIdDocs.length} documents with null or missing examId`);

    for (const doc of nullExamIdDocs) {
      const newExamId = uuidv4();
      await examDetailsCollection.updateOne(
        { _id: doc._id },
        { $set: { examId: newExamId } }
      );
      console.log(`Updated document ${doc._id} with new examId: ${newExamId}`);
    }

    // Create a new unique index for examId that ignores null values
    console.log('Creating new unique index for examId...');
    await examDetailsCollection.createIndex(
      { examId: 1 },
      {
        unique: true,
        sparse: true, // This makes the index ignore null values
        name: 'examId_unique_sparse_index'
      }
    );
    console.log('Created new unique sparse index for examId');

    // Verify the new index
    const updatedIndexes = await examDetailsCollection.indexes();
    console.log('Updated indexes:', updatedIndexes);

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    console.log('Index fix completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing examId index:', error);
    process.exit(1);
  }
}

// Run the function
fixExamIdIndex();
