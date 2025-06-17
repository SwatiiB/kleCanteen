import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  resetPassword
} from '../controllers/userController.js';
import { protect, userOnly, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', protect, userOnly, getUserProfile);
router.put('/profile', protect, userOnly, updateUserProfile);

// Admin routes
router.get('/', protect, adminOnly, getAllUsers);
router.delete('/:userId', protect, adminOnly, deleteUser);

export default router;
