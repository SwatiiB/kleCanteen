import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Home, Clock, MessageSquare } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import './OrderSuccessModal.css';

// Animated Checkmark SVG Component
const AnimatedCheckmark = () => {
  return (
    <div className="checkmark-container">
      <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
        <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
      </svg>
    </div>
  );
};

// Order Details Component
const OrderDetails = ({ orderId, items }) => {
  return (
    <div className="order-details">
      <div className="order-details-row">
        <span className="order-details-label">Order ID</span>
        <span className="order-details-value">{orderId}</span>
      </div>
      <div className="order-details-row">
        <span className="order-details-label">Estimated Pickup</span>
        <div className="order-details-value pickup-time">
          <Clock size={14} />
          <span>30 minutes</span>
        </div>
      </div>

      {/* Order Items with Images */}
      {items && items.length > 0 && (
        <div className="order-items-container mt-3 pt-3 border-t">
          <div className="order-details-label mb-2">Items</div>
          <div className="order-items-list">
            {items.map((item, index) => (
              <div key={index} className="order-item-row">
                <div className="order-item-image-container">
                  <img
                    src={
                      (item.image && item.image.url) ? item.image.url :
                      (typeof item.image === 'string') ? item.image :
                      'https://via.placeholder.com/40x40?text=Food'
                    }
                    alt={item.name || 'Menu item'}
                    className="order-item-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/40x40?text=Food';
                    }}
                  />
                </div>
                <div className="order-item-details">
                  <div className="order-item-name">{item.name}</div>
                  <div className="order-item-quantity">x{item.quantity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const OrderSuccessModal = ({
  isOpen,
  onClose,
  orderId,
  canteenId,
  items = []
}) => {
  const navigate = useNavigate();
  const [showAnimation, setShowAnimation] = useState(true);

  // Prevent body scroll when modal is open
  useEffect(() => {
    console.log('OrderSuccessModal - isOpen changed:', isOpen, 'orderId:', orderId);

    // Animation timer effect
    let animationTimer;
    if (isOpen) {
      // Show animation for 2 seconds, then show GIF
      animationTimer = setTimeout(() => {
        setShowAnimation(false);
      }, 2000);
    }

    // Cleanup function
    return () => {
      if (animationTimer) clearTimeout(animationTimer);
    };
  }, [isOpen, orderId]);

  // Separate effect for handling body overflow
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Always ensure body overflow is reset when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const viewOrder = () => {
    // Ensure body overflow is reset before navigation
    document.body.style.overflow = 'auto';
    onClose();
    // Use setTimeout to ensure the modal is fully closed before navigation
    setTimeout(() => {
      navigate(`/orders/${orderId}`);
      // Ensure scroll is at the top of the new page
      window.scrollTo(0, 0);
    }, 10);
  };

  const continueShopping = () => {
    // Ensure body overflow is reset before navigation
    document.body.style.overflow = 'auto';
    onClose();

    // Use setTimeout to ensure the modal is fully closed before navigation
    setTimeout(() => {
      // If canteenId is provided, navigate to the canteen page
      // Otherwise, navigate to the home page
      if (canteenId) {
        console.log('Navigating to canteen page:', canteenId);
        navigate(`/canteen/${canteenId}`);
      } else {
        console.log('No canteenId provided, navigating to home page');
        navigate('/');
      }
      // Ensure scroll is at the top of the new page
      window.scrollTo(0, 0);
    }, 10);
  };

  return (
    <div className="order-success-modal">
      <div className="animate-fadeIn">
        <Card className="order-success-card">
          <div className="text-center">
            {/* Animated Checkmark or GIF Animation */}
            {showAnimation ? (
              <div className="animation-container">
                <AnimatedCheckmark />
              </div>
            ) : (
              <div className="order-completed-container">
                <div className="order-completed-text">
                  <div className="check-icon">✓</div>
                  <h2>Order Completed</h2>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="content-container">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Order Placed Successfully!
              </h3>

              <p className="text-gray-600 mb-4">
                Thank you for your order. Your food is being prepared and will be ready for pickup soon.
              </p>

              {/* Order Details */}
              <OrderDetails orderId={orderId} items={items} />

              <div className="mt-4 mb-4 text-sm text-gray-600 p-3 bg-blue-50 rounded-md flex items-start">
                <MessageSquare size={16} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-700">Your feedback matters!</p>
                  <p>Once your order is delivered, you'll be able to rate your experience and help us improve our service.</p>
                </div>
              </div>

              <div className="button-container">
                <Button
                  variant="outline"
                  onClick={viewOrder}
                  className="flex items-center justify-center py-3 px-6 text-base font-semibold shadow-sm hover:bg-gray-50 transition-all duration-200 border-2"
                  fullWidth
                >
                  <ShoppingBag size={18} className="mr-2" />
                  View Order
                </Button>

                <Button
                  variant="primary"
                  onClick={continueShopping}
                  className="continue-shopping-btn flex items-center justify-center py-3 px-6 text-base font-semibold shadow-md transition-all duration-200"
                  fullWidth
                >
                  <Home size={18} className="mr-2" />
                  Explore
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OrderSuccessModal;
