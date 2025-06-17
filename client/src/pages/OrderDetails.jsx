import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Clock, MapPin, CheckCircle, MessageSquare, CreditCard } from 'lucide-react';
import { getOrderById, cancelOrder } from '../services/order';
import { getUserFeedback, hasSubmittedFeedback } from '../services/feedback';
import { getPaymentByOrderId } from '../services/payment';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Loader from '../components/UI/Loader';
import FeedbackForm from '../components/Feedback/FeedbackForm';
import StarRating from '../components/Feedback/StarRating';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  useEffect(() => {
    if (order && (order.status === 'delivered' || order.status === 'completed')) {
      fetchOrderFeedback();
    }
  }, [order]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await getOrderById(id);
      console.log('Order details:', data);

      // Handle different response formats
      const orderData = data.order || data;

      // Fetch payment information for this order
      try {
        const paymentInfo = await getPaymentByOrderId(id);
        console.log('Payment info:', paymentInfo);
        // Add payment info to the order object
        orderData.paymentInfo = paymentInfo;
      } catch (paymentErr) {
        console.error('Error fetching payment info:', paymentErr);
        // Set default payment info if fetch fails
        orderData.paymentInfo = {
          isOnlinePaid: false,
          paymentMethod: 'cash',
          paymentStatus: null
        };
      }

      setOrder(orderData);
      setError(null);
    } catch (err) {
      setError('Failed to load order details. Please try again later.');
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderFeedback = async () => {
    try {
      setLoadingFeedback(true);
      console.log('Fetching feedback for order:', id, 'with status:', order.status);

      // First check if user has already submitted feedback for this order
      const { exists, feedback: existingFeedback } = await hasSubmittedFeedback(id);
      console.log('Feedback exists check result:', exists);

      if (exists && existingFeedback) {
        console.log('Existing feedback found:', existingFeedback);
        setFeedback(existingFeedback);
        setShowFeedbackForm(false);
      } else {
        // If no feedback exists for this order, check all user feedback
        const allFeedback = await getUserFeedback();
        console.log('All user feedback:', allFeedback);

        // Find feedback for this order (as a fallback)
        const orderFeedback = allFeedback.find(item =>
          item.orderId === id ||
          (item.orderId && item.orderId._id === id)
        );

        if (orderFeedback) {
          console.log('Found feedback in user history:', orderFeedback);
          setFeedback(orderFeedback);
          setShowFeedbackForm(false);
        } else {
          console.log('No feedback found, showing feedback form');
          setFeedback(null);
          setShowFeedbackForm(true);
        }
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
      // Don't show error toast as this is not critical
      setShowFeedbackForm(true);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleFeedbackSubmitted = () => {
    // Refresh feedback data
    fetchOrderFeedback();
    setShowFeedbackForm(false);
  };

  const handleCancelOrder = async () => {
    // Check if this is an online paid order
    const isOnlinePaid = order.paymentInfo && order.paymentInfo.isOnlinePaid;

    // Customize confirmation message based on payment method
    let confirmMessage = 'Are you sure you want to cancel this order?';
    if (isOnlinePaid) {
      confirmMessage = 'Are you sure you want to cancel this order? A refund will be processed to your original payment method.';
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setCancelling(true);
      const response = await cancelOrder(id);

      // Update local state
      setOrder(prev => ({
        ...prev,
        status: 'cancelled'
      }));

      // Check if a refund was processed
      if (response.refund && response.refund.processed) {
        toast.success('Order cancelled and refund processed successfully. The refund will be credited to your original payment method within 5-7 business days.');
      } else {
        toast.success('Order cancelled successfully');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order. Please try again.');
      console.error('Error cancelling order:', err);
    } finally {
      setCancelling(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      preparing: { color: 'bg-purple-100 text-purple-800', label: 'Preparing' },
      ready: { color: 'bg-green-100 text-green-800', label: 'Ready for Pickup' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Check if order can be cancelled
  // For online paid orders, only allow cancellation in pending status
  // For non-online paid orders, allow cancellation in pending, confirmed, or preparing status
  const isOnlinePaid = order && order.paymentInfo && order.paymentInfo.isOnlinePaid;
  const canBeCancelled = order && (
    isOnlinePaid
      ? ['pending'].includes(order.status)
      : ['pending', 'confirmed', 'preparing'].includes(order.status)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={fetchOrderDetails}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Order not found.</p>
        <Link to="/orders">
          <Button variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600">
              Order #{order._id.substring(0, 8)}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link to="/orders">
              <Button variant="outline" size="sm">
                <ArrowLeft size={16} className="mr-2" />
                Back to Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Order Status</p>
                  <div className="mt-1">{getStatusBadge(order.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Time</p>
                  <p className="font-medium">{order.orderTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pickup Time</p>
                  <p className="font-medium">{order.pickupTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <div className="flex items-center">
                    <p className="font-medium capitalize">
                      {order.paymentInfo && order.paymentInfo.isOnlinePaid
                        ? (order.paymentInfo.paymentMethod === 'razorpay'
                           ? 'Razorpay (Online)'
                           : order.paymentInfo.paymentMethod)
                        : (order.paymentMethod || 'Cash on Delivery')}
                    </p>
                    {order.paymentInfo && order.paymentInfo.isOnlinePaid && (
                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center">
                        <CreditCard size={12} className="mr-1" />
                        Paid Online
                      </span>
                    )}
                  </div>
                </div>

                {order.paymentInfo && order.paymentInfo.isOnlinePaid && order.paymentInfo.paymentStatus === 'refunded' && (
                  <div>
                    <p className="text-sm text-gray-500">Refund Status</p>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      Refunded
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Canteen Information</h3>
              <div className="space-y-3">
                {order.canteenId && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Canteen</p>
                      <p className="font-medium">{order.canteenId.name}</p>
                    </div>
                    {order.canteenId.location && (
                      <div className="flex items-start">
                        <MapPin size={16} className="text-gray-500 mt-0.5 mr-1 flex-shrink-0" />
                        <p className="text-gray-700">{order.canteenId.location}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b">
                  <div className="flex items-center">
                    <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden mr-4 border border-gray-200">
                      <img
                        src={
                          (item.itemId && item.itemId.image && item.itemId.image.url)
                            ? item.itemId.image.url
                            : (item.itemId && typeof item.itemId.image === 'string')
                              ? item.itemId.image
                              : 'https://via.placeholder.com/64x64?text=Food'
                        }
                        alt={item.itemId ? item.itemId.itemName : 'Food item'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/64x64?text=Food';
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{item.itemId ? item.itemId.itemName : 'Unknown Item'}</p>
                      <p className="text-sm text-gray-600">₹{item.price.toFixed(2)} x {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {order.specialInstructions && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">Special Instructions</h4>
                <p className="text-sm p-3 bg-gray-50 rounded-md">{order.specialInstructions}</p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">Total Amount</p>
                  <p className="text-sm text-gray-500">Including all taxes and fees</p>
                </div>
                <p className="text-xl font-bold">₹{order.totalAmount.toFixed(2)}</p>
              </div>
            </div>

            {canBeCancelled && (
              <div className="mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-800"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Feedback Section - Only show for delivered or completed orders */}
      {(order.status === 'delivered' || order.status === 'completed') && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <MessageSquare className="mr-2" size={20} />
            Feedback
          </h2>

          {loadingFeedback ? (
            <div className="flex justify-center items-center h-32">
              <Loader size="md" />
            </div>
          ) : feedback ? (
            <Card className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Your Rating</h3>
                <StarRating rating={feedback.rating} size="lg" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Food Quality</p>
                  <StarRating rating={feedback.foodQuality} size="sm" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Service Speed</p>
                  <StarRating rating={feedback.serviceSpeed} size="sm" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">App Experience</p>
                  <StarRating rating={feedback.appExperience} size="sm" />
                </div>
              </div>

              {feedback.comment && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Your Comment</h4>
                  <p className="text-sm p-3 bg-gray-50 rounded-md">{feedback.comment}</p>
                </div>
              )}

              {feedback.staffResponse && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Canteen Response</h4>
                  <div className="text-sm p-3 bg-blue-50 rounded-md">
                    <p className="text-blue-800">{feedback.staffResponse}</p>
                  </div>
                </div>
              )}

              <div className="mt-4 text-sm text-gray-500">
                Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
              </div>
            </Card>
          ) : showFeedbackForm ? (
            <FeedbackForm
              orderId={id}
              canteenId={order.canteenId._id || order.canteenId}
              onFeedbackSubmitted={handleFeedbackSubmitted}
            />
          ) : (
            <Card className="p-6 text-center">
              <p className="text-gray-600 mb-4">You haven't provided feedback for this order yet.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => setShowFeedbackForm(true)}
                >
                  <MessageSquare size={16} className="mr-2" />
                  Rate Your Experience
                </Button>
                <Link to="/feedback">
                  <Button variant="outline">
                    View All Feedback
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
