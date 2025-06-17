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
import OrderDetails from '../models/OrderDetails.js';
import Canteen from '../models/Canteen.js';
import User from '../models/User.js';

const addTestFeedback = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGODB_URI}/kleCanteen`);
    console.log('Connected to MongoDB');

    // Get a sample canteen
    const canteen = await Canteen.findOne();
    if (!canteen) {
      console.log('No canteens found. Please add a canteen first.');
      return;
    }
    console.log('Found canteen:', canteen.name, 'ID:', canteen._id);

    // Get a sample user
    const user = await User.findOne();
    if (!user) {
      console.log('No users found. Please add a user first.');
      return;
    }
    console.log('Found user:', user.email);

    // Create a sample order if none exists
    let order = await OrderDetails.findOne({ 
      canteenId: canteen._id,
      email: user.email,
      status: { $in: ['delivered', 'completed'] }
    });

    if (!order) {
      order = new OrderDetails({
        orderId: 'TEST-' + Date.now(),
        email: user.email,
        canteenId: canteen._id,
        items: [{
          itemId: new mongoose.Types.ObjectId(),
          name: 'Test Item',
          quantity: 1,
          price: 50
        }],
        totalAmount: 50,
        paymentMethod: 'cash',
        status: 'completed',
        orderDate: new Date(),
        deliveryTime: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
      });
      await order.save();
      console.log('Created test order:', order.orderId);
    }

    // Check if feedback already exists for this order
    const existingFeedback = await Feedback.findOne({ 
      orderId: order._id, 
      email: user.email 
    });

    if (existingFeedback) {
      console.log('Feedback already exists for this order');
      return;
    }

    // Create test feedback
    const testFeedback = [
      {
        orderId: order._id,
        email: user.email,
        rating: 5,
        comment: 'Excellent food and quick service! Really enjoyed the meal.',
        foodQuality: 5,
        serviceSpeed: 4,
        appExperience: 5,
        canteenId: canteen._id,
        isResolved: false
      },
      {
        orderId: order._id,
        email: user.email,
        rating: 4,
        comment: 'Good food but could be a bit faster with delivery.',
        foodQuality: 4,
        serviceSpeed: 3,
        appExperience: 4,
        canteenId: canteen._id,
        isResolved: true,
        staffResponse: 'Thank you for your feedback! We are working on improving our delivery speed.'
      },
      {
        orderId: order._id,
        email: user.email,
        rating: 3,
        comment: 'Average experience. Food was okay but nothing special.',
        foodQuality: 3,
        serviceSpeed: 3,
        appExperience: 3,
        canteenId: canteen._id,
        isResolved: false
      }
    ];

    // Since we can only have one feedback per order per user, let's create multiple orders
    for (let i = 0; i < testFeedback.length; i++) {
      const feedbackData = testFeedback[i];
      
      // Create a new order for each feedback
      const newOrder = new OrderDetails({
        orderId: 'TEST-' + Date.now() + '-' + i,
        email: user.email,
        canteenId: canteen._id,
        items: [{
          itemId: new mongoose.Types.ObjectId(),
          name: `Test Item ${i + 1}`,
          quantity: 1,
          price: 50 + (i * 10)
        }],
        totalAmount: 50 + (i * 10),
        paymentMethod: 'cash',
        status: 'completed',
        orderDate: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Different dates
        deliveryTime: new Date(Date.now() - (i * 24 * 60 * 60 * 1000) + 15 * 60 * 1000)
      });
      await newOrder.save();

      // Update feedback with new order ID
      feedbackData.orderId = newOrder._id;

      // Create feedback
      const feedback = new Feedback(feedbackData);
      await feedback.save();
      
      console.log(`Created test feedback ${i + 1}:`, {
        orderId: newOrder.orderId,
        rating: feedback.rating,
        comment: feedback.comment.substring(0, 50) + '...',
        canteenId: feedback.canteenId
      });
    }

    console.log('Test feedback data added successfully!');
    console.log(`Added ${testFeedback.length} feedback entries for canteen: ${canteen.name}`);

  } catch (error) {
    console.error('Error adding test feedback:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
addTestFeedback();
