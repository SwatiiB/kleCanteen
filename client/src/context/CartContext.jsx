import { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getUserCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem,
         removeCartItem as apiRemoveCartItem, clearCart as apiClearCart } from '../services/cart';

// Create context
const CartContext = createContext();

// Cart provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Load cart data on initial render and when auth state changes
  useEffect(() => {
    const loadCart = async () => {
      // For authenticated users, try to load cart from the database
      if (isAuthenticated) {
        try {
          const response = await getUserCart();
          if (response && response.cart && response.cart.items) {
            // Transform the cart items to match the expected format
            const transformedItems = response.cart.items.map(item => {
              const transformedItem = {
                _id: item.itemId._id,
                name: item.name || item.itemId.itemName, // Use stored name or populated itemName
                price: item.price,
                quantity: item.quantity,
                canteenId: item.canteenId._id,
                image: item.image
              };

              // Debug log to verify name is being set correctly
              console.log('CartContext: Transforming cart item:', {
                originalName: item.name,
                populatedName: item.itemId.itemName,
                finalName: transformedItem.name,
                itemId: item.itemId._id
              });

              return transformedItem;
            });
            setCartItems(transformedItems);
            return;
          }
        } catch (error) {
          console.error('Error loading cart from database:', error);
          // Fall back to localStorage if API call fails
        }
      }

      // For non-authenticated users or if API call fails, load from localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(parsedCart);
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
          localStorage.removeItem('cart');
        }
      }
    };

    loadCart();
  }, [isAuthenticated]);

  // Update cart count and total whenever cartItems changes
  useEffect(() => {
    // Calculate total items in cart
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    setCartCount(itemCount);

    // Calculate total price
    const totalPrice = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    setCartTotal(totalPrice);

    // Always save to localStorage as a fallback
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = async (item, currentPath = '') => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Store the current path and item in sessionStorage for redirect after login
      if (currentPath) {
        const redirectData = {
          path: currentPath,
          itemToAdd: item
        };
        sessionStorage.setItem('cartRedirect', JSON.stringify(redirectData));
      }

      // Show message and redirect to login
      toast.error('Please log in to add items to your cart');
      navigate('/login');
      return;
    }

    try {
      // For authenticated users, sync with database
      await apiAddToCart({
        itemId: item._id,
        quantity: item.quantity
      });

      // Check if item already exists in cart before updating state
      const existingItemIndex = cartItems.findIndex(cartItem => cartItem._id === item._id);
      const isExistingItem = existingItemIndex !== -1;

      // Update local state without showing toast notification here
      setCartItems(prevItems => {
        // Check if item already exists in cart
        const existingItemIndex = prevItems.findIndex(cartItem => cartItem._id === item._id);

        if (existingItemIndex !== -1) {
          // Item exists, update quantity
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + item.quantity
          };

          return updatedItems;
        } else {
          // Item doesn't exist, add new item
          return [...prevItems, item];
        }
      });

      // Show a single toast notification after state update
      if (isExistingItem) {
        toast.success(`Updated ${item.name || item.itemName} quantity in cart`);
      } else {
        toast.success(`Added ${item.name || item.itemName} to cart`);
      }
    } catch (error) {
      // Log the full error for debugging
      console.error('Error adding item to cart (full error):', error);

      // Handle errors (e.g., item from different canteen)
      if (error.message && error.message.includes('different canteens')) {
        toast.error('Cannot add items from different canteens. Please clear your cart first.');
      } else {
        toast.error(error.message || 'Failed to add item to cart');
        console.error('Error adding item to cart:', error.message);
      }
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, newQuantity) => {
    // Update local state immediately for better UX
    setCartItems(prevItems =>
      prevItems.map(item =>
        item._id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    // For authenticated users, sync with database
    if (isAuthenticated) {
      try {
        await apiUpdateCartItem(itemId, newQuantity);
      } catch (error) {
        toast.error(error.message || 'Failed to update cart item');
        console.error('Error updating cart item:', error);

        // Reload cart from database if update fails
        try {
          const response = await getUserCart();
          if (response && response.cart && response.cart.items) {
            const transformedItems = response.cart.items.map(item => ({
              _id: item.itemId._id,
              name: item.name || item.itemId.itemName, // Use stored name or populated itemName
              price: item.price,
              quantity: item.quantity,
              canteenId: item.canteenId._id,
              image: item.image
            }));
            setCartItems(transformedItems);
          }
        } catch (reloadError) {
          console.error('Error reloading cart:', reloadError);
        }
      }
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    // Get item name before removing for toast message
    const itemToRemove = cartItems.find(item => item._id === itemId);
    const itemName = itemToRemove ? itemToRemove.name : 'Item';

    // Update local state immediately for better UX
    setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));

    // Show success message
    toast.success(`Removed ${itemName} from cart`);

    // For authenticated users, sync with database
    if (isAuthenticated) {
      try {
        await apiRemoveCartItem(itemId);
      } catch (error) {
        toast.error(error.message || 'Failed to remove item from cart');
        console.error('Error removing item from cart:', error);

        // Reload cart from database if removal fails
        try {
          const response = await getUserCart();
          if (response && response.cart && response.cart.items) {
            const transformedItems = response.cart.items.map(item => ({
              _id: item.itemId._id,
              name: item.name || item.itemId.itemName, // Use stored name or populated itemName
              price: item.price,
              quantity: item.quantity,
              canteenId: item.canteenId._id,
              image: item.image
            }));
            setCartItems(transformedItems);
          }
        } catch (reloadError) {
          console.error('Error reloading cart:', reloadError);
        }
      }
    }
  };

  // Clear cart
  const clearCart = async () => {
    // Update local state immediately for better UX
    setCartItems([]);
    toast.success('Cart cleared');

    // For authenticated users, sync with database
    if (isAuthenticated) {
      try {
        await apiClearCart();
      } catch (error) {
        toast.error(error.message || 'Failed to clear cart on server');
        console.error('Error clearing cart on server:', error);
      }
    }
  };

  // Check if cart has items from multiple canteens
  const hasMultipleCanteens = () => {
    if (cartItems.length <= 1) return false;

    const canteenIds = new Set(cartItems.map(item => item.canteenId));
    return canteenIds.size > 1;
  };

  // Get canteen ID of items in cart
  const getCartCanteenId = () => {
    if (cartItems.length === 0) return null;
    return cartItems[0].canteenId;
  };

  // Context value
  const value = {
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    hasMultipleCanteens,
    getCartCanteenId
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
