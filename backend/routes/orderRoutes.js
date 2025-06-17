import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrdersByUser,
  getOrdersByCanteen,
  getPriorityOrdersByCanteen,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} from '../controllers/orderController.js';
import { protect, userOnly, canteenStaffOnly, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// User routes
router.post('/', protect, userOnly, createOrder);
router.get('/user/:email', protect, userOnly, getOrdersByUser);
router.patch('/:id/cancel', protect, userOnly, cancelOrder);

// Canteen staff routes
router.get('/canteen/:canteenId', protect, canteenStaffOnly, getOrdersByCanteen);
router.get('/canteen/:canteenId/priority', protect, canteenStaffOnly, getPriorityOrdersByCanteen);
router.patch('/:id/status', protect, canteenStaffOnly, updateOrderStatus);

// Admin routes
router.get('/', protect, adminOnly, getAllOrders);
router.get('/user/:email/all', protect, adminOnly, getOrdersByUser);
router.patch('/:id/status/admin', protect, adminOnly, updateOrderStatus); // Admin route for updating order status
router.patch('/:id/cancel/admin', protect, adminOnly, cancelOrder); // Admin route for cancelling orders

// Common routes
router.get('/:id', protect, getOrderById);

export default router;
