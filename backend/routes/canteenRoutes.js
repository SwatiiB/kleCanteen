import express from 'express';
import {
  createCanteen,
  getAllCanteens,
  getCanteenById,
  updateCanteen,
  deleteCanteen,
  updateCanteenAvailability
} from '../controllers/canteenController.js';
import { protect, adminOnly, canteenStaffOnly } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllCanteens);
router.get('/:id', getCanteenById);

// Admin routes
router.post('/', protect, adminOnly, upload.single('image'), createCanteen);
router.put('/:id', protect, adminOnly, upload.single('image'), updateCanteen);
router.delete('/:id', protect, adminOnly, deleteCanteen);

// Canteen staff routes
router.patch('/:id/availability', protect, canteenStaffOnly, updateCanteenAvailability);

export default router;
