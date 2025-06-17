import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Eye, Clock, CheckCircle, XCircle, AlertCircle, CreditCard, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Table from '../../components/UI/Table';
import Modal from '../../components/UI/Modal';
import Loader from '../../components/UI/Loader';
import { getOrdersByCanteen, updateOrderStatus } from '../../services/order';
import { getPaymentByOrderId } from '../../services/payment';

const OrderManagement = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Get canteen ID from user data and ensure it's a string
  const canteenId = user?.canteenId ? user.canteenId.toString() : null;

  // Log the canteenId for debugging
  useEffect(() => {
    console.log('OrderManagement - canteenId:', canteenId);
  }, [canteenId]);

  useEffect(() => {
    fetchOrders();

    // Set up polling for new orders
    const interval = setInterval(fetchOrders, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [canteenId]);

  const fetchOrders = async () => {
    if (!canteenId) return;

    try {
      setLoading(true);
      const response = await getOrdersByCanteen(canteenId);
      // Handle different response formats
      const ordersData = response.orders || response;

      console.log('Orders data received:', ordersData);

      // Log the first order for debugging
      if (Array.isArray(ordersData) && ordersData.length > 0) {
        console.log('Sample order data:', ordersData[0]);
        console.log('Customer info:', ordersData[0].user);
        console.log('Email:', ordersData[0].email);
        console.log('Order creation date:', ordersData[0].createdAt);
        console.log('Order status:', ordersData[0].status);

        // Log item structure for debugging
        if (ordersData[0].items && ordersData[0].items.length > 0) {
          console.log('First item in first order:', ordersData[0].items[0]);
          console.log('Item ID object:', ordersData[0].items[0].itemId);
          console.log('Item name from itemId:', ordersData[0].items[0].itemId?.itemName);
        }
      }

      // Fetch payment information for each order to determine if it's an online paid order
      if (Array.isArray(ordersData) && ordersData.length > 0) {
        console.log(`Fetching payment info for ${ordersData.length} orders...`);

        // Create a new array to store orders with payment info
        const ordersWithPaymentInfo = [];

        // Process orders sequentially to avoid race conditions
        for (const order of ordersData) {
          try {
            console.log(`Fetching payment info for order ${order._id} with status ${order.status}...`);
            const paymentInfo = await getPaymentInfoForOrder(order._id);

            // Add the order with payment info to our array
            ordersWithPaymentInfo.push({
              ...order,
              paymentInfo: paymentInfo || {
                isOnlinePaid: false,
                paymentMethod: 'cash',
                paymentStatus: null
              }
            });
          } catch (err) {
            console.error(`Error processing payment info for order ${order._id}:`, err);
            // Still add the order but with default payment info
            ordersWithPaymentInfo.push({
              ...order,
              paymentInfo: {
                isOnlinePaid: false,
                paymentMethod: 'cash',
                paymentStatus: null
              }
            });
          }
        }

        console.log('Orders with payment info:', ordersWithPaymentInfo);

        // The backend API sorts orders by creation date (newest first)
        // This ensures that the most recent orders always appear at the top
        setOrders(ordersWithPaymentInfo);
      } else {
        setOrders([]);
      }

      setError(null);
    } catch (err) {
      setError('Failed to fetch orders. Please try again.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to get payment info for an order using the real API
  const getPaymentInfoForOrder = async (orderId) => {
    try {
      // Call the real API to get payment information
      const paymentInfo = await getPaymentByOrderId(orderId);
      console.log(`Payment info for order ${orderId}:`, paymentInfo);

      // Ensure we always return an object with the expected structure
      return {
        ...paymentInfo,
        isOnlinePaid: paymentInfo.isOnlinePaid || false,
        paymentMethod: paymentInfo.paymentMethod || 'cash',
        paymentStatus: paymentInfo.paymentStatus || null
      };
    } catch (error) {
      console.error(`Error fetching payment info for order ${orderId}:`, error);
      // Return default values if API call fails
      return {
        isOnlinePaid: false,
        paymentMethod: 'cash',
        paymentStatus: null
      };
    }
  };

  const handleViewOrder = (order) => {
    // Log the full order structure for debugging
    console.log('Viewing order details:', order);
    console.log('Order items:', order.items);
    console.log('Priority status:', order.priority);
    console.log('Priority reason:', order.priorityReason);
    console.log('Priority details:', order.priorityDetails);

    // Check if items have the expected structure
    if (order.items && order.items.length > 0) {
      const firstItem = order.items[0];
      console.log('First item structure:', firstItem);
      console.log('Item ID object:', firstItem.itemId);
      console.log('Item name from itemId:', firstItem.itemId?.itemName);
    }

    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      setUpdatingStatus(true);

      // Find the order to check if it's an online paid order
      const order = orders.find(o => o._id === orderId);
      const isOnlinePaid = order?.paymentInfo && order.paymentInfo.isOnlinePaid;

      // If cancelling an online paid order, show a confirmation dialog
      // The backend will automatically process a refund for online paid orders that are cancelled
      if (status === 'cancelled' && isOnlinePaid) {
        if (!window.confirm('This will cancel the order and process a refund to the customer. Continue?')) {
          setUpdatingStatus(false);
          return;
        }
      }

      const response = await updateOrderStatus(orderId, status);

      // Update local state while preserving payment information
      setOrders(orders.map(order =>
        order._id === orderId
          ? {
              ...order,
              status,
              // Ensure payment info is preserved
              paymentInfo: order.paymentInfo || {
                isOnlinePaid: false,
                paymentMethod: 'cash',
                paymentStatus: null
              }
            }
          : order
      ));

      // Show appropriate success message
      if (status === 'cancelled' && isOnlinePaid && response.refund && response.refund.processed) {
        toast.success('Order cancelled and refund processed successfully');
      } else {
        toast.success(`Order status updated to ${status}`);
      }

      // Close modal if open
      if (isViewModalOpen) {
        setIsViewModalOpen(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update order status. Please try again.');
      console.error('Error updating order status:', err);
    } finally {
      setUpdatingStatus(false);
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
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
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

  // Get priority badge
  const getPriorityBadge = (isPriority) => {
    return isPriority ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Priority
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Standard
      </span>
    );
  };



  const columns = [
    {
      header: 'Order ID',
      accessor: '_id',
      cell: (row) => row._id.substring(0, 8),
    },
    {
      header: 'Customer',
      accessor: 'user.name',
      cell: (row) => {
        // Check if user object exists
        if (row.user && row.user.name) {
          return row.user.name;
        }
        // Fallback to email
        return row.email || 'Unknown';
      },
    },
    {
      header: 'Items',
      cell: (row) => row.items.length,
    },
    {
      header: 'Total',
      accessor: 'totalAmount',
      cell: (row) => `₹${row.totalAmount.toFixed(2)}`,
    },
    {
      header: 'Priority',
      accessor: 'priority',
      cell: (row) => getPriorityBadge(row.priority),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      cell: (row) => formatDate(row.createdAt),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Actions',
      cell: (row) => {
        // Check if this is an online paid order
        const isOnlinePaid = row.paymentInfo && row.paymentInfo.isOnlinePaid;

        // Debug log to check row data
        console.log(`Rendering actions for order ${row._id}, status: ${row.status}, isOnlinePaid: ${isOnlinePaid}`);

        return (
          <div className="flex flex-wrap gap-2">
            {/* View Button - Always show */}
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleViewOrder(row);
              }}
            >
              <Eye size={16} />
            </Button>

            {/* Prepare Button - Show for pending orders (regardless of payment method) */}
            {row.status === 'pending' && (
              <Button
                variant="primary"
                size="sm"
                disabled={updatingStatus}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(row._id, 'preparing');
                }}
              >
                <Clock size={16} className="mr-1" />
                Prepare
              </Button>
            )}

            {/* Ready Button - Show for preparing orders (regardless of payment method) */}
            {row.status === 'preparing' && (
              <Button
                variant="success"
                size="sm"
                disabled={updatingStatus}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(row._id, 'ready');
                }}
              >
                <CheckCircle size={16} className="mr-1" />
                Ready
              </Button>
            )}

            {/* Delivered Button - Show for ready orders (regardless of payment method) */}
            {row.status === 'ready' && (
              <Button
                variant="success"
                size="sm"
                disabled={updatingStatus}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(row._id, 'delivered');
                }}
              >
                <CheckCircle size={16} className="mr-1" />
                Delivered
              </Button>
            )}

            {/* Cancel Button - Show based on payment type and status */}
            {/* For online paid orders: only show Cancel button in pending status */}
            {/* For non-online paid orders: show Cancel button in pending or preparing status */}
            {/* This ensures users can only cancel and receive a refund for online paid orders before preparation begins */}
            {(((row.status === 'pending' || row.status === 'preparing') && !isOnlinePaid) ||
              (row.status === 'pending' && isOnlinePaid)) && (
              <Button
                variant="danger"
                size="sm"
                disabled={updatingStatus}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(row._id, 'cancelled');
                }}
              >
                {isOnlinePaid ? (
                  <>
                    <RotateCcw size={16} className="mr-1" />
                    Cancel & Refund
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="mr-1" />
                    Cancel
                  </>
                )}
              </Button>
            )}

            {/* Payment Badge - Show for online paid orders */}
            {isOnlinePaid && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center">
                Paid Online
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600">
          Manage and process customer orders
        </p>
      </div>

      <Card>
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
            {/*
              Orders are displayed in the order they are received from the API:
              Sorted by creation date (newest first) so the most recent orders appear at the top
              Priority orders are still highlighted with yellow background for visibility
            */}
            <Table
              columns={columns}
              data={orders}
              emptyMessage="No orders found for this canteen."
            />
          </>
        )}
      </Card>

      {/* View Order Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Order Details"
          size="lg"
          footer={
            <>
              {/* Modal Footer Buttons */}
              {(() => {
                // Check if this is an online paid order
                const isOnlinePaid = selectedOrder.paymentInfo && selectedOrder.paymentInfo.isOnlinePaid;

                // Debug log to check selected order data
                console.log('Modal footer - Selected order:', {
                  id: selectedOrder._id,
                  status: selectedOrder.status,
                  isOnlinePaid,
                  paymentInfo: selectedOrder.paymentInfo
                });

                return (
                  <div className="flex flex-wrap gap-2">
                    {/* Prepare Button - Show for pending orders (regardless of payment method) */}
                    {selectedOrder.status === 'pending' && (
                      <Button
                        variant="primary"
                        disabled={updatingStatus}
                        onClick={() => handleUpdateStatus(selectedOrder._id, 'preparing')}
                      >
                        <Clock size={16} className="mr-1" />
                        Start Preparing
                      </Button>
                    )}

                    {/* Ready Button - Show for preparing orders (regardless of payment method) */}
                    {selectedOrder.status === 'preparing' && (
                      <Button
                        variant="success"
                        disabled={updatingStatus}
                        onClick={() => handleUpdateStatus(selectedOrder._id, 'ready')}
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Mark as Ready
                      </Button>
                    )}

                    {/* Delivered Button - Show for ready orders (regardless of payment method) */}
                    {selectedOrder.status === 'ready' && (
                      <Button
                        variant="success"
                        disabled={updatingStatus}
                        onClick={() => handleUpdateStatus(selectedOrder._id, 'delivered')}
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Mark as Delivered
                      </Button>
                    )}

                    {/* Cancel Button - Show based on payment type and status */}
                    {/* For online paid orders: only show Cancel button in pending status */}
                    {/* For non-online paid orders: show Cancel button in pending or preparing status */}
                    {/* This ensures users can only cancel and receive a refund for online paid orders before preparation begins */}
                    {(((selectedOrder.status === 'pending' || selectedOrder.status === 'preparing') && !isOnlinePaid) ||
                      (selectedOrder.status === 'pending' && isOnlinePaid)) && (
                      <Button
                        variant="danger"
                        disabled={updatingStatus}
                        onClick={() => handleUpdateStatus(selectedOrder._id, 'cancelled')}
                      >
                        {isOnlinePaid ? (
                          <>
                            <RotateCcw size={16} className="mr-1" />
                            Cancel Order & Process Refund
                          </>
                        ) : (
                          <>
                            <XCircle size={16} className="mr-1" />
                            Cancel Order
                          </>
                        )}
                      </Button>
                    )}

                    {/* Close Button - Always show */}
                    <Button
                      variant="outline"
                      onClick={() => setIsViewModalOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                );
              })()}
            </>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-medium">{selectedOrder._id}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">
                  {selectedOrder.user && selectedOrder.user.name
                    ? selectedOrder.user.name
                    : (selectedOrder.email || 'Unknown')}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
              </div>

              {/* Payment Information */}
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">
                  {selectedOrder.paymentInfo && selectedOrder.paymentInfo.isOnlinePaid
                    ? (selectedOrder.paymentInfo.paymentMethod === 'razorpay'
                       ? 'Razorpay (Online)'
                       : selectedOrder.paymentInfo.paymentMethod)
                    : 'Cash on Delivery'}
                </p>
                {selectedOrder.paymentInfo && selectedOrder.paymentInfo.isOnlinePaid && (
                  <div className="mt-1 space-y-1">
                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Paid Online
                    </span>

                    {/* Show refund status if applicable */}
                    {selectedOrder.paymentInfo.paymentStatus === 'refunded' && (
                      <div className="flex items-center mt-1">
                        <RotateCcw size={14} className="text-orange-500 mr-1" />
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                          Refunded
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">Priority</p>
                <div className="mt-1">{getPriorityBadge(selectedOrder.priority)}</div>
              </div>

              {selectedOrder.priority && (
                <div>
                  <p className="text-sm text-gray-500">Priority Reason</p>
                  <p className="font-medium">
                    {selectedOrder.priorityReason === 'exam' ? 'Exam' :
                     selectedOrder.priorityReason === 'faculty' ? 'Faculty with Exam Duty' :
                     selectedOrder.priorityReason === 'medical' ? 'Medical Reasons' : 'Other'}
                    {selectedOrder.priorityDetails && `: ${selectedOrder.priorityDetails}`}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-2">Order Items</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.items.map((item, index) => {
                      // Log item structure for debugging
                      console.log(`Order item ${index}:`, item);

                      // Get item name from itemId object if available
                      const itemName = item.itemId && item.itemId.itemName
                        ? item.itemId.itemName
                        : (item.name || 'Unknown Item');

                      return (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{itemName}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{item.quantity}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">₹{item.price.toFixed(2)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">₹{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="3" className="px-4 py-2 text-sm font-medium text-right">Total Amount:</td>
                      <td className="px-4 py-2 text-sm font-medium">₹{selectedOrder.totalAmount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {selectedOrder.specialInstructions && (
              <div>
                <h3 className="font-medium mb-2">Special Instructions</h3>
                <p className="text-sm p-3 bg-gray-50 rounded-md">{selectedOrder.specialInstructions}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrderManagement;
