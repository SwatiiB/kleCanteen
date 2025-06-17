import express from 'express';
import {
  registerCanteenStaff,
  loginCanteenStaff,
  getCanteenStaffProfile,
  updateCanteenStaffProfile,
  getAllCanteenStaff,
  deleteCanteenStaff
} from '../controllers/canteenStaffController.js';
import { protect, canteenStaffOnly, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', loginCanteenStaff);

// Admin routes
router.post('/register', protect, adminOnly, registerCanteenStaff);
router.get('/', protect, adminOnly, getAllCanteenStaff);
router.delete('/:id', protect, adminOnly, deleteCanteenStaff);

// Canteen staff routes
router.get('/profile', protect, canteenStaffOnly, getCanteenStaffProfile);
router.put('/profile', protect, canteenStaffOnly, updateCanteenStaffProfile);

export default router;
