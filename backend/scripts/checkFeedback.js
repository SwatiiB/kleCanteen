import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import Feedback from '../models/Feedback.js';
import Canteen from '../models/Canteen.js';
import CanteenStaff from '../models/CanteenStaff.js';
import OrderDetails from '../models/OrderDetails.js';

const checkFeedback = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGODB_URI}/kleCanteen`);
    console.log('Connected to MongoDB');

    // Get all canteens
    const canteens = await Canteen.find();
    console.log(`\nFound ${canteens.length} canteens:`);

    for (const canteen of canteens) {
      console.log(`\n--- Canteen: ${canteen.name} (ID: ${canteen._id}) ---`);

      // Get feedback for this canteen
      const feedback = await Feedback.find({ canteenId: canteen._id })
        .populate('orderId', 'orderId orderDate')
        .sort({ createdAt: -1 });

      console.log(`Feedback count: ${feedback.length}`);

      if (feedback.length > 0) {
        feedback.forEach((item, index) => {
          console.log(`  ${index + 1}. Rating: ${item.rating}/5, Email: ${item.email}`);
          console.log(`     Comment: ${item.comment || 'No comment'}`);
          console.log(`     Resolved: ${item.isResolved ? 'Yes' : 'No'}`);
          console.log(`     Created: ${item.createdAt}`);
          console.log('');
        });
      } else {
        console.log('  No feedback found for this canteen');
      }

      // Check if there are any canteen staff for this canteen
      const staff = await CanteenStaff.find({ canteenId: canteen._id });
      console.log(`Staff count: ${staff.length}`);
      if (staff.length > 0) {
        staff.forEach((member, index) => {
          console.log(`  ${index + 1}. ${member.name} (${member.email})`);
        });
      }
    }

    // Get total feedback count
    const totalFeedback = await Feedback.countDocuments();
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total feedback in database: ${totalFeedback}`);
    console.log(`Total canteens: ${canteens.length}`);

  } catch (error) {
    console.error('Error checking feedback:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

// Run the script
checkFeedback();
