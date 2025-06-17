import express from 'express';
import {
  submitFeedback,
  getCanteenFeedback,
  getUserFeedback,
  respondToFeedback,
  getFeedbackStats,
  checkOrderFeedback,
  canSubmitFeedback,
  getAllFeedback,
  getTestimonials
} from '../controllers/feedbackController.js';
import { protect, userOnly, canteenStaffOnly, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/testimonials', getTestimonials);

// User routes
router.post('/', protect, userOnly, submitFeedback);
router.get('/user', protect, userOnly, getUserFeedback);
router.get('/order/:orderId/exists', protect, userOnly, checkOrderFeedback);
router.get('/canteen/:canteenId/can-submit', protect, userOnly, canSubmitFeedback);

// Canteen staff routes
router.get('/canteen/:canteenId', protect, canteenStaffOnly, getCanteenFeedback);
router.put('/:id/respond', protect, canteenStaffOnly, respondToFeedback);

// Admin routes
router.get('/stats', protect, adminOnly, getFeedbackStats);
router.get('/', protect, adminOnly, getAllFeedback);

export default router;
