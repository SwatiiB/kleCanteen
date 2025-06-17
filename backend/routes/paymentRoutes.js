import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getAllPayments,
  getPaymentsByUser,
  getPaymentById,
  getPaymentByOrderId,
  processRefund
} from '../controllers/paymentController.js';
import { protect, userOnly, adminOnly, canteenStaffOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// User routes
router.post('/create-order', protect, userOnly, createPaymentOrder);
router.post('/verify', protect, userOnly, verifyPayment);
router.get('/user/:email', protect, userOnly, getPaymentsByUser);
router.get('/order/:orderId', protect, getPaymentByOrderId); // Available to users and staff

// Admin routes
router.get('/', protect, adminOnly, getAllPayments);
router.post('/:id/refund', protect, processRefund); // Allow both admin and canteen staff to process refunds

// Common routes
router.get('/:id', protect, getPaymentById);

export default router;
