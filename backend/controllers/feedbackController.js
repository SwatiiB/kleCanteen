import Feedback from '../models/Feedback.js';
import OrderDetails from '../models/OrderDetails.js';
import Canteen from '../models/Canteen.js';
import mongoose from 'mongoose';

// Submit feedback for an order
export const submitFeedback = async (req, res) => {
  try {
    const {
      orderId,
      rating,
      comment,
      foodQuality,
      serviceSpeed,
      appExperience
    } = req.body;

    // Check if order exists and belongs to the user
    const order = await OrderDetails.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.email !== req.user.email) {
      return res.status(403).json({ message: 'You can only provide feedback for your own orders' });
    }

    // Check if order is delivered or completed (can only provide feedback for delivered or completed orders)
    if (order.status !== 'delivered' && order.status !== 'completed') {
      return res.status(400).json({ message: 'You can only provide feedback for delivered or completed orders' });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ orderId, email: req.user.email });
    if (existingFeedback) {
      return res.status(400).json({ message: 'You have already provided feedback for this order' });
    }

    // Create new feedback
    const newFeedback = new Feedback({
      orderId,
      email: req.user.email,
      rating,
      comment,
      foodQuality,
      serviceSpeed,
      appExperience,
      canteenId: order.canteenId
    });

    // Save feedback to database
    await newFeedback.save();

    // Update canteen ratings
    await updateCanteenRatings(order.canteenId);

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: newFeedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to update canteen ratings
const updateCanteenRatings = async (canteenId) => {
  try {
    // Get all feedback for this canteen
    const feedbacks = await Feedback.find({ canteenId });

    if (feedbacks.length === 0) {
      return;
    }

    // Calculate average ratings
    let totalRating = 0;
    let totalFoodQuality = 0;
    let totalServiceSpeed = 0;
    let totalAppExperience = 0;
    let validFoodQualityCount = 0;
    let validServiceSpeedCount = 0;
    let validAppExperienceCount = 0;

    feedbacks.forEach(feedback => {
      totalRating += feedback.rating;

      if (feedback.foodQuality) {
        totalFoodQuality += feedback.foodQuality;
        validFoodQualityCount++;
      }

      if (feedback.serviceSpeed) {
        totalServiceSpeed += feedback.serviceSpeed;
        validServiceSpeedCount++;
      }

      if (feedback.appExperience) {
        totalAppExperience += feedback.appExperience;
        validAppExperienceCount++;
      }
    });

    const count = feedbacks.length;

    // Update canteen with new ratings
    await Canteen.findByIdAndUpdate(canteenId, {
      ratings: {
        averageRating: (totalRating / count).toFixed(1),
        totalRatings: count,
        foodQuality: validFoodQualityCount > 0 ? (totalFoodQuality / validFoodQualityCount).toFixed(1) : 0,
        serviceSpeed: validServiceSpeedCount > 0 ? (totalServiceSpeed / validServiceSpeedCount).toFixed(1) : 0,
        appExperience: validAppExperienceCount > 0 ? (totalAppExperience / validAppExperienceCount).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Error updating canteen ratings:', error);
  }
};

// Get all feedback for a canteen
export const getCanteenFeedback = async (req, res) => {
  try {
    const canteenId = req.params.canteenId;
    console.log('getCanteenFeedback - Requested canteenId:', canteenId);
    console.log('getCanteenFeedback - User from token:', req.user);
    console.log('getCanteenFeedback - CanteenId from middleware:', req.canteenId);

    const feedback = await Feedback.find({ canteenId: canteenId })
      .populate('orderId', 'orderId orderDate')
      .sort({ createdAt: -1 });

    console.log('getCanteenFeedback - Found feedback count:', feedback.length);
    console.log('getCanteenFeedback - Feedback data:', feedback);

    // Calculate average ratings
    let totalRating = 0;
    let totalFoodQuality = 0;
    let totalServiceSpeed = 0;
    let totalAppExperience = 0;
    let count = feedback.length;

    feedback.forEach(item => {
      totalRating += item.rating;
      totalFoodQuality += item.foodQuality || 0;
      totalServiceSpeed += item.serviceSpeed || 0;
      totalAppExperience += item.appExperience || 0;
    });

    const averageRatings = {
      overallRating: count > 0 ? (totalRating / count).toFixed(1) : 0,
      foodQuality: count > 0 ? (totalFoodQuality / count).toFixed(1) : 0,
      serviceSpeed: count > 0 ? (totalServiceSpeed / count).toFixed(1) : 0,
      appExperience: count > 0 ? (totalAppExperience / count).toFixed(1) : 0
    };

    console.log('getCanteenFeedback - Calculated averages:', averageRatings);

    res.status(200).json({
      feedback,
      averageRatings,
      totalFeedback: count
    });
  } catch (error) {
    console.error('Error getting canteen feedback:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get feedback by user
export const getUserFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ email: req.user.email })
      .populate('orderId', 'orderId orderDate')
      .populate('canteenId', 'name location')
      .sort({ createdAt: -1 });

    res.status(200).json(feedback);
  } catch (error) {
    console.error('Error getting user feedback:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Respond to feedback (canteen staff)
export const respondToFeedback = async (req, res) => {
  try {
    const { staffResponse } = req.body;

    // Find the feedback
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if staff belongs to the canteen
    if (feedback.canteenId.toString() !== req.user.canteenId.toString()) {
      return res.status(403).json({ message: 'You can only respond to feedback for your canteen' });
    }

    // Update feedback
    feedback.staffResponse = staffResponse;
    feedback.isResolved = true;
    await feedback.save();

    res.status(200).json({
      message: 'Response submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('Error responding to feedback:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get feedback statistics for admin
export const getFeedbackStats = async (req, res) => {
  try {
    // Get all canteens
    const canteens = await Canteen.find();

    // Get feedback stats for each canteen
    const stats = await Promise.all(canteens.map(async (canteen) => {
      const feedback = await Feedback.find({ canteenId: canteen._id });

      let totalRating = 0;
      let count = feedback.length;

      feedback.forEach(item => {
        totalRating += item.rating;
      });

      return {
        canteenId: canteen._id,
        canteenName: canteen.name,
        location: canteen.location,
        averageRating: count > 0 ? (totalRating / count).toFixed(1) : 0,
        totalFeedback: count
      };
    }));

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error getting feedback stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all feedback for admin
export const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('orderId', 'orderId orderDate')
      .populate('canteenId', 'name location')
      .sort({ createdAt: -1 });

    // Calculate overall stats
    let totalRating = 0;
    let totalFoodQuality = 0;
    let totalServiceSpeed = 0;
    let totalAppExperience = 0;
    let count = feedback.length;
    let resolvedCount = 0;

    feedback.forEach(item => {
      totalRating += item.rating;
      totalFoodQuality += item.foodQuality || 0;
      totalServiceSpeed += item.serviceSpeed || 0;
      totalAppExperience += item.appExperience || 0;
      if (item.isResolved) resolvedCount++;
    });

    const stats = {
      totalFeedback: count,
      resolvedFeedback: resolvedCount,
      averageRating: count > 0 ? (totalRating / count).toFixed(1) : 0,
      foodQuality: count > 0 ? (totalFoodQuality / count).toFixed(1) : 0,
      serviceSpeed: count > 0 ? (totalServiceSpeed / count).toFixed(1) : 0,
      appExperience: count > 0 ? (totalAppExperience / count).toFixed(1) : 0
    };

    res.status(200).json({
      feedback,
      stats
    });
  } catch (error) {
    console.error('Error getting all feedback:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check if user has submitted feedback for an order
export const checkOrderFeedback = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const email = req.user.email;

    // Check if feedback exists
    const feedback = await Feedback.findOne({ orderId, email });

    res.status(200).json({
      exists: !!feedback,
      feedback: feedback
    });
  } catch (error) {
    console.error('Error checking order feedback:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check if user can submit feedback for a canteen
export const canSubmitFeedback = async (req, res) => {
  try {
    const canteenId = req.params.canteenId;
    const email = req.user.email;

    // Check if user has placed any orders from this canteen that are delivered or completed
    const orders = await OrderDetails.find({
      email,
      canteenId,
      status: { $in: ['delivered', 'completed'] }
    });

    res.status(200).json({
      canSubmit: orders.length > 0
    });
  } catch (error) {
    console.error('Error checking feedback eligibility:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get testimonials for public display (no authentication required)
export const getTestimonials = async (req, res) => {
  try {
    // Get feedback with high ratings (4-5 stars) and comments - limit to 3 latest reviews
    const testimonials = await Feedback.find({
      rating: { $gte: 4 },
      comment: { $exists: true, $ne: '' }
    })
      .populate('canteenId', 'name')
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json(testimonials);
  } catch (error) {
    console.error('Error getting testimonials:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
