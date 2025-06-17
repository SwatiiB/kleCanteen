import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getUserOrders, cancelOrder } from '../services/order';
import { getPaymentByOrderId } from '../services/payment';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import OrderItem from '../components/Order/OrderItem';
import Loader from '../components/UI/Loader';

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'completed'

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user || !user.email) return;

    try {
      setLoading(true);
      const data = await getUserOrders(user.email);
      // Handle different response formats - the API might return an array directly or an object with orders property
      const ordersData = Array.isArray(data) ? data : data.orders || [];
      console.log('Orders data received:', ordersData);

      // Fetch payment information for each order
      if (ordersData.length > 0) {
        const ordersWithPaymentInfo = await Promise.all(
          ordersData.map(async (order) => {
            try {
              const paymentInfo = await getPaymentByOrderId(order._id);
              return {
                ...order,
                paymentInfo
              };
            } catch (err) {
              console.error(`Error fetching payment info for order ${order._id}:`, err);
              return {
                ...order,
                paymentInfo: {
                  isOnlinePaid: false,
                  paymentMethod: 'cash',
                  paymentStatus: null
                }
              };
            }
          })
        );

        setOrders(ordersWithPaymentInfo);
      } else {
        setOrders([]);
      }

      setError(null);
    } catch (err) {
      setError('Failed to load orders. Please try again later.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      setLoading(true);
      const response = await cancelOrder(orderId);

      // Find the order to update payment info if it's an online paid order
      const orderToUpdate = orders.find(order => order._id === orderId);
      const isOnlinePaid = orderToUpdate?.paymentInfo && orderToUpdate.paymentInfo.isOnlinePaid;

      // Update local state
      setOrders(orders.map(order => {
        if (order._id === orderId) {
          // If this is an online paid order and a refund was processed, update payment status
          if (isOnlinePaid && response.refund && response.refund.processed) {
            return {
              ...order,
              status: 'cancelled',
              paymentInfo: {
                ...order.paymentInfo,
                paymentStatus: 'refunded'
              }
            };
          }
          return { ...order, status: 'cancelled' };
        }
        return order;
      }));

      // Check if a refund was processed
      if (response.refund && response.refund.processed) {
        toast.success('Order cancelled and refund processed successfully. The refund will be credited to your original payment method within 5-7 business days.');
      } else {
        toast.success('Order cancelled successfully');
      }
    } catch (err) {
      // Check for formatted error message
      if (err.formattedMessage) {
        toast.error(err.formattedMessage);
      } else {
        toast.error(err.message || 'Failed to cancel order. Please try again.');
      }
      console.error('Error cancelling order:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['pending', 'confirmed', 'preparing', 'ready', 'delivered'].includes(order.status);
    if (activeTab === 'completed') return ['completed', 'cancelled'].includes(order.status);
    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
        <p className="text-gray-600">
          View and manage your orders
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All Orders
            </button>
            <button
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('active')}
            >
              Active Orders
            </button>
            <button
              className={`py-2 px-4 text-center border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('completed')}
            >
              Completed Orders
            </button>
          </nav>
        </div>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={fetchOrders}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {filteredOrders.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500 mb-4">No orders found.</p>
              <Button
                variant="primary"
                onClick={() => window.location.href = '/canteens'}
              >
                Browse Canteens
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <OrderItem
                  key={order._id}
                  order={order}
                  onCancelOrder={handleCancelOrder}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderHistory;
