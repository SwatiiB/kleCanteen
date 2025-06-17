import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, MessageSquare, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { hasSubmittedFeedback } from '../../services/feedback';
import { getPaymentByOrderId } from '../../services/payment';
import Card from '../UI/Card';
import Button from '../UI/Button';

const OrderItem = ({ order, onCancelOrder }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);
  const [checkingFeedback, setCheckingFeedback] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

  const {
    _id,
    items,
    totalAmount,
    status,
    createdAt,
    canteenId,
    specialInstructions,
    priority,
    priorityReason,
    priorityDetails
  } = order;

  // Check if user has already submitted feedback for this order
  useEffect(() => {
    const checkFeedback = async () => {
      // Only check for delivered or completed orders
      if (status !== 'delivered' && status !== 'completed') return;

      try {
        setCheckingFeedback(true);
        const { exists } = await hasSubmittedFeedback(_id);
        setHasFeedback(exists);
      } catch (err) {
        console.error('Error checking feedback status:', err);
      } finally {
        setCheckingFeedback(false);
      }
    };

    checkFeedback();
  }, [_id, status]);

  // Fetch payment information for this order
  useEffect(() => {
    const fetchPaymentInfo = async () => {
      try {
        const info = await getPaymentByOrderId(_id);
        setPaymentInfo(info);

        // Add payment info to the order object for access in other parts of the component
        order.paymentInfo = info;
      } catch (err) {
        console.error('Error fetching payment info:', err);
        // Set default payment info
        const defaultInfo = {
          isOnlinePaid: false,
          paymentMethod: 'cash',
          paymentStatus: null
        };
        setPaymentInfo(defaultInfo);
        order.paymentInfo = defaultInfo;
      }
    };

    fetchPaymentInfo();
  }, [_id, order]);

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
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800' },
      preparing: { bg: 'bg-blue-100', text: 'text-blue-800' },
      ready: { bg: 'bg-green-100', text: 'text-green-800' },
      delivered: { bg: 'bg-purple-100', text: 'text-purple-800' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Check if order can be cancelled
  // For online paid orders, only allow cancellation in pending status
  // For non-online paid orders, allow cancellation in pending, confirmed, or preparing status
  const isOnlinePaid = order.paymentInfo && order.paymentInfo.isOnlinePaid;
  const canBeCancelled = isOnlinePaid
    ? ['pending'].includes(status)
    : ['pending', 'confirmed', 'preparing'].includes(status);

  const handleCancelOrder = () => {
    let confirmMessage = 'Are you sure you want to cancel this order?';

    // Add refund information for online paid orders
    if (isOnlinePaid) {
      confirmMessage = 'Are you sure you want to cancel this order? A refund will be processed to your original payment method.';
    }

    if (window.confirm(confirmMessage)) {
      onCancelOrder(_id);
    }
  };

  return (
    <Card className="mb-4">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold mr-3">Order #{_id.substring(0, 8)}</h3>
              {getStatusBadge(status)}
              {priority && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center">
                  <AlertCircle size={12} className="mr-1" />
                  Priority
                </span>
              )}
              {paymentInfo && paymentInfo.isOnlinePaid && (
                <>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center">
                    <CreditCard size={12} className="mr-1" />
                    Paid Online
                  </span>
                  {paymentInfo.paymentStatus === 'refunded' && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center">
                      Refunded
                    </span>
                  )}
                </>
              )}
              {(status === 'delivered' || status === 'completed') && (
                hasFeedback ? (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center">
                    <MessageSquare size={12} className="mr-1" />
                    Feedback Submitted
                  </span>
                ) : !checkingFeedback && (
                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium flex items-center">
                    <MessageSquare size={12} className="mr-1" />
                    Feedback Needed
                  </span>
                )
              )}
            </div>
            <p className="text-sm text-gray-600">{formatDate(createdAt)}</p>
          </div>

          <div className="mt-3 sm:mt-0">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-lg font-bold">₹{totalAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Order Item Images Preview */}
        <div className="mb-4 flex items-center overflow-x-auto py-2">
          <div className="flex space-x-2">
            {items.slice(0, 3).map((item, index) => (
              <div key={index} className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-md overflow-hidden border border-gray-200">
                  <img
                    src={
                      (item.itemId && item.itemId.image && item.itemId.image.url)
                        ? item.itemId.image.url
                        : (item.itemId && typeof item.itemId.image === 'string')
                          ? item.itemId.image
                          : 'https://via.placeholder.com/56x56?text=Food'
                    }
                    alt={item.itemId ? item.itemId.itemName : 'Food item'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/56x56?text=Food';
                    }}
                  />
                </div>
                {item.quantity > 1 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.quantity}
                  </span>
                )}
              </div>
            ))}
            {items.length > 3 && (
              <div className="w-14 h-14 rounded-md bg-gray-100 flex items-center justify-center text-gray-500 text-sm font-medium">
                +{items.length - 3}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Canteen</p>
            <p className="font-medium">{canteenId?.name || 'Unknown Canteen'}</p>
          </div>

          <div className="flex mt-3 sm:mt-0">
            {canBeCancelled && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-800 mr-2"
                onClick={handleCancelOrder}
              >
                Cancel Order
              </Button>
            )}

            {(status === 'delivered' || status === 'completed') && !hasFeedback && (
              <Link to={`/orders/${_id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2 text-green-600 hover:text-green-800"
                >
                  <MessageSquare size={16} className="mr-1" />
                  Rate Order
                </Button>
              </Link>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={16} className="mr-1" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown size={16} className="mr-1" />
                  View Details
                </>
              )}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">Order Items</h4>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center">
                    <div className="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden border border-gray-200 mr-3">
                      <img
                        src={
                          (item.itemId && item.itemId.image && item.itemId.image.url)
                            ? item.itemId.image.url
                            : (item.itemId && typeof item.itemId.image === 'string')
                              ? item.itemId.image
                              : 'https://via.placeholder.com/40x40?text=Food'
                        }
                        alt={item.itemId ? item.itemId.itemName : 'Food item'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/40x40?text=Food';
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

            {specialInstructions && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Special Instructions</h4>
                <p className="text-sm p-3 bg-gray-50 rounded-md">{specialInstructions}</p>
              </div>
            )}

            {priority && (
              <div className="mt-4">
                <h4 className="font-medium mb-2 flex items-center">
                  <AlertCircle size={16} className="text-blue-600 mr-2" />
                  Priority Order
                </h4>
                <div className="text-sm p-3 bg-blue-50 rounded-md">
                  <p className="font-medium text-blue-800 mb-1">
                    Reason: {priorityReason === 'exam' ? 'Exam' :
                            priorityReason === 'faculty' ? 'Faculty with Exam Duty' :
                            priorityReason === 'medical' ? 'Medical Reasons' : 'Other'}
                  </p>
                  {priorityDetails && (
                    <p className="text-blue-700">{priorityDetails}</p>
                  )}
                </div>
              </div>
            )}

            {/* Payment and Refund Information */}
            {paymentInfo && paymentInfo.isOnlinePaid && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Payment Information</h4>
                <div className="text-sm p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center mb-1">
                    <CreditCard size={16} className="text-green-600 mr-2" />
                    <p className="font-medium text-gray-800">
                      Paid Online via {paymentInfo.paymentMethod === 'razorpay' ? 'Razorpay' : paymentInfo.paymentMethod}
                    </p>
                  </div>

                  {paymentInfo.paymentStatus === 'refunded' && (
                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-100">
                      <p className="text-blue-800 font-medium">Refund Processed</p>
                      <p className="text-sm text-blue-700">
                        Your refund has been processed and will be credited to your original payment method within 5-7 business days.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 pt-2 border-t flex justify-between">
              <p className="font-medium">Total</p>
              <p className="font-bold">₹{totalAmount.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default OrderItem;
