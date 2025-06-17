import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getCanteenById } from '../services/canteen';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import CartItem from '../components/Cart/CartItem';
import Loader from '../components/UI/Loader';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart, getCartCanteenId } = useCart();
  const [canteen, setCanteen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showClearCartModal, setShowClearCartModal] = useState(false);

  useEffect(() => {
    if (cartItems.length > 0) {
      fetchCanteenDetails();
    }
  }, [cartItems]);

  // Handle body overflow when modal is shown
  useEffect(() => {
    if (showClearCartModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showClearCartModal]);

  const fetchCanteenDetails = async () => {
    const canteenId = getCartCanteenId();
    if (!canteenId) return;

    try {
      setLoading(true);
      const data = await getCanteenById(canteenId);
      setCanteen(data.canteen);
      setError(null);
    } catch (err) {
      setError('Failed to load canteen details. Please try again later.');
      console.error('Error fetching canteen details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handleClearCart = () => {
    console.log('Clear cart button clicked');
    setShowClearCartModal(true);
  };

  const confirmClearCart = () => {
    console.log('Clearing cart...');
    clearCart();
    // Ensure body overflow is reset when modal is closed
    document.body.style.overflow = 'auto';
    setShowClearCartModal(false);
  };

  const cancelClearCart = () => {
    console.log('Cart clearing cancelled by user');
    // Ensure body overflow is reset when modal is closed
    document.body.style.overflow = 'auto';
    setShowClearCartModal(false);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    navigate('/checkout');
  };

  // Calculate delivery fee and total
  const subtotal = cartTotal;
  const deliveryFee = 10; // Fixed delivery fee
  const total = subtotal + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <ShoppingCart size={64} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-600 mb-6">Add items from our canteens to get started.</p>
        <Link to="/canteens">
          <Button variant="primary">
            Browse Canteens
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
            <p className="text-gray-600">
              Review your items before checkout
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center text-red-600 hover:text-red-800"
            onClick={handleClearCart}
          >
            <Trash2 size={16} className="mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <Card className="p-4">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader size="md" />
                </div>
              ) : (
                <>
                  {canteen && (
                    <div className="mb-4 pb-4 border-b">
                      <p className="text-sm text-gray-600">Ordering from</p>
                      <div className="flex items-center">
                        <h3 className="font-medium mr-2">{canteen.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (canteen.isAvailable !== undefined ? canteen.isAvailable : canteen.availability) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {(canteen.isAvailable !== undefined ? canteen.isAvailable : canteen.availability) ? 'Open' : 'Closed'}
                        </span>
                      </div>

                      {!(canteen.isAvailable !== undefined ? canteen.isAvailable : canteen.availability) && (
                        <div className="mt-2 bg-red-50 p-2 rounded-md">
                          <p className="text-red-700 text-sm">
                            This canteen is currently closed. You cannot place orders at this time.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
                    {cartItems.map(item => (
                      <CartItem
                        key={item._id}
                        item={item}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemove={handleRemoveItem}
                      />
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <Link to="/canteens">
                      <Button variant="outline" size="sm" className="flex items-center">
                        <ArrowLeft size={16} className="mr-2" />
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                fullWidth
                disabled={loading || (canteen && !(canteen.isAvailable !== undefined ? canteen.isAvailable : canteen.availability))}
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>

              {canteen && !(canteen.isAvailable !== undefined ? canteen.isAvailable : canteen.availability) && (
                <p className="mt-2 text-center text-sm text-red-600">
                  Cannot checkout while canteen is closed
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-amber-500 mr-3" size={24} />
              <h3 className="text-lg font-semibold">Clear Your Cart?</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={cancelClearCart}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmClearCart}
              >
                Clear Cart
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default Cart;
