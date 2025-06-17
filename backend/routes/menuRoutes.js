import express from 'express';
import {
  createMenuItem,
  createMenuItems,
  getAllMenuItems,
  getMenuItemsByCanteen,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  updateMenuItemAvailability
} from '../controllers/menuController.js';
import { protect, adminOnly, canteenStaffOnly } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllMenuItems);
router.get('/canteen/:canteenId', getMenuItemsByCanteen);
router.get('/:id', getMenuItemById);

// Admin routes
router.post('/', protect, adminOnly, upload.single('image'), createMenuItem); // Admin can create menu items
router.post('/batch', protect, adminOnly, createMenuItems);

// Canteen staff routes
router.post('/canteen-staff', protect, canteenStaffOnly, upload.single('image'), createMenuItem); // Canteen staff can create menu items
router.put('/:id', protect, upload.single('image'), updateMenuItem); // Both admin and canteen staff can update
router.patch('/:id/availability', protect, canteenStaffOnly, updateMenuItemAvailability);
router.delete('/:id', protect, deleteMenuItem); // Both admin and canteen staff can delete

export default router;
