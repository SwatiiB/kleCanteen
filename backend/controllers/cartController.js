import Cart from '../models/Cart.js';
import Menu from '../models/Menu.js';

// Get user's cart
export const getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find cart for user
    let cart = await Cart.findOne({ userId })
      .populate('items.itemId', 'itemName price availability image')
      .populate('items.canteenId', 'name location availability');

    if (!cart) {
      // If no cart exists, create an empty one
      cart = new Cart({
        userId,
        items: []
      });
      await cart.save();
    }

    res.status(200).json({
      message: 'Cart retrieved successfully',
      cart
    });
  } catch (error) {
    console.error('Error getting user cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid item data. Please provide itemId and quantity.' });
    }

    // Get menu item details
    const menuItem = await Menu.findById(itemId).populate('canteenId', 'name location availability');
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Check if item is available
    if (!menuItem.availability) {
      return res.status(400).json({ message: 'This item is currently unavailable' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({
        userId,
        items: []
      });
    }

    // Check if cart already has items from a different canteen
    if (cart.items.length > 0) {
      // Log the canteen IDs for debugging
      console.log('Existing canteen ID in cart:', cart.items[0].canteenId);
      console.log('New item canteen ID:', menuItem.canteenId);

      // Convert both IDs to strings for proper comparison
      const existingCanteenId = cart.items[0].canteenId.toString();
      const newCanteenId = menuItem.canteenId._id ? menuItem.canteenId._id.toString() : menuItem.canteenId.toString();

      console.log('Existing canteen ID (string):', existingCanteenId);
      console.log('New canteen ID (string):', newCanteenId);

      if (existingCanteenId !== newCanteenId) {
        return res.status(400).json({
          message: 'Cannot add items from different canteens. Please clear your cart first.',
          existingCanteenId,
          newCanteenId
        });
      }
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.itemId.toString() === itemId
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      // Ensure we're storing the canteen ID correctly
      const canteenId = menuItem.canteenId._id ? menuItem.canteenId._id : menuItem.canteenId;

      cart.items.push({
        itemId: menuItem._id,
        quantity,
        price: menuItem.price,
        name: menuItem.itemName,
        image: menuItem.image,
        canteenId: canteenId
      });
    }

    // Save cart
    await cart.save();
    console.log('Cart saved successfully');

    // Return updated cart
    const updatedCart = await Cart.findOne({ userId })
      .populate('items.itemId', 'itemName price availability image')
      .populate('items.canteenId', 'name location availability');

    console.log('Updated cart:', JSON.stringify(updatedCart, null, 2));

    res.status(200).json({
      message: 'Item added to cart successfully',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid item data. Please provide itemId and quantity.' });
    }

    // Find cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      item => item.itemId.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;

    // Save cart
    await cart.save();

    // Return updated cart
    const updatedCart = await Cart.findOne({ userId })
      .populate('items.itemId', 'itemName price availability image')
      .populate('items.canteenId', 'name location availability');

    res.status(200).json({
      message: 'Cart item updated successfully',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove item from cart
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required' });
    }

    // Find cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remove item from cart
    cart.items = cart.items.filter(
      item => item.itemId.toString() !== itemId
    );

    // Save cart
    await cart.save();

    // Return updated cart
    const updatedCart = await Cart.findOne({ userId })
      .populate('items.itemId', 'itemName price availability image')
      .populate('items.canteenId', 'name location availability');

    res.status(200).json({
      message: 'Item removed from cart successfully',
      cart: updatedCart
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Clear items
    cart.items = [];

    // Save cart
    await cart.save();

    res.status(200).json({
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
