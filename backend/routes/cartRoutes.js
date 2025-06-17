import express from 'express';
import {
  getUserCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from '../controllers/cartController.js';
import { protect, userOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All cart routes require authentication
router.use(protect);
router.use(userOnly);

// Get user's cart
router.get('/', getUserCart);

// Add item to cart
router.post('/add', addToCart);

// Update cart item quantity
router.put('/update', updateCartItem);

// Remove item from cart
router.delete('/remove/:itemId', removeCartItem);

// Clear cart
router.delete('/clear', clearCart);

export default router;
