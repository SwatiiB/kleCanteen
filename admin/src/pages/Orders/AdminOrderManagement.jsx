import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Eye, Filter, Search, RefreshCw, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Table from '../../components/UI/Table';
import Modal from '../../components/UI/Modal';
import Loader from '../../components/UI/Loader';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import { getAllOrders, updateOrderStatusAdmin, cancelOrderAdmin } from '../../services/order';
import { getAllCanteens } from '../../services/canteen';
import { getPaymentByOrderId } from '../../services/payment';

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [canteenFilter, setCanteenFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchCanteens();
  }, []);

  const fetchCanteens = async () => {
    try {
      const response = await getAllCanteens();
      const canteensData = Array.isArray(response) ? response : (response?.canteens || []);
      setCanteens(canteensData);
    } catch (err) {
      console.error('Error fetching canteens:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders();
      // Handle different response formats
      const ordersData = response.orders || response;

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
        setOrders(ordersWithPaymentInfo);
      } else {
        setOrders([]);
      }

      setError(null);
    } catch (err) {
      setError('Failed to fetch orders. Please try again.');
      console.error('Error fetching orders:', err);
      toast.error('Failed to fetch orders');
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
    console.log('Payment info:', order.paymentInfo);

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
      if (status === 'cancelled') {
        let confirmMessage = 'Are you sure you want to cancel this order?';

        if (isOnlinePaid) {
          confirmMessage = 'This will cancel the order and process a refund to the customer. Continue?';
        }

        if (!window.confirm(confirmMessage)) {
          setUpdatingStatus(false);
          return;
        }
      } else {
        // For other status changes, show a simple confirmation
        if (!window.confirm(`Are you sure you want to change the order status to ${status}?`)) {
          setUpdatingStatus(false);
          return;
        }
      }

      // Use the admin-specific function for updating order status
      const response = await updateOrderStatusAdmin(orderId, status);

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

  const handleCancelOrder = async (orderId) => {
    try {
      setUpdatingStatus(true);

      // Find the order to check if it's an online paid order
      const order = orders.find(o => o._id === orderId);
      const isOnlinePaid = order?.paymentInfo && order.paymentInfo.isOnlinePaid;

      // Show confirmation dialog
      let confirmMessage = 'Are you sure you want to cancel this order?';

      if (isOnlinePaid) {
        confirmMessage = 'This will cancel the order and process a refund to the customer. Continue?';
      }

      if (!window.confirm(confirmMessage)) {
        setUpdatingStatus(false);
        return;
      }

      // Use the admin-specific function for cancelling orders
      const response = await cancelOrderAdmin(orderId);

      // Update local state
      setOrders(orders.map(order =>
        order._id === orderId
          ? {
              ...order,
              status: 'cancelled',
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
      if (isOnlinePaid && response.refund && response.refund.processed) {
        toast.success('Order cancelled and refund processed successfully');
      } else {
        toast.success('Order cancelled successfully');
      }

      // Close modal if open
      if (isViewModalOpen) {
        setIsViewModalOpen(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order. Please try again.');
      console.error('Error cancelling order:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

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

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

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

  const filteredOrders = orders.filter(order => {
    // Search term filter (check order ID, customer email, etc.)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      (order._id && order._id.toLowerCase().includes(searchLower)) ||
      (order.email && order.email.toLowerCase().includes(searchLower)) ||
      (order.orderId && order.orderId.toLowerCase().includes(searchLower));

    // Status filter
    const matchesStatus = !statusFilter || order.status === statusFilter;

    // Canteen filter
    const matchesCanteen = !canteenFilter ||
      (order.canteenId && order.canteenId._id === canteenFilter) ||
      (order.canteenId && order.canteenId.toString() === canteenFilter);

    // Priority filter
    const matchesPriority = priorityFilter === '' ||
      (priorityFilter === 'priority' && order.priority === true) ||
      (priorityFilter === 'standard' && (order.priority === false || order.priority === undefined));

    return matchesSearch && matchesStatus && matchesCanteen && matchesPriority;
  });

  const columns = [
    {
      header: 'Order ID',
      accessor: '_id',
      cell: (row) => row._id.substring(0, 8),
    },
    {
      header: 'Customer',
      accessor: 'email',
      cell: (row) => row.email || 'Unknown',
    },
    {
      header: 'Canteen',
      accessor: 'canteenId.name',
      cell: (row) => {
        if (row.canteenId && typeof row.canteenId === 'object') {
          return row.canteenId.name || 'Unknown';
        }
        const canteen = canteens.find(c => c._id === row.canteenId);
        return canteen ? canteen.name : 'Unknown';
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
          View and monitor all orders across all canteens
        </p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={18} />}
            className="w-full sm:w-64"
          />
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <Filter size={16} className="mr-1" />
           Filters
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={fetchOrders}
          className="flex items-center"
        >
          <RefreshCw size={16} className="mr-1" />
          Refresh
        </Button>
      </div>

      {showFilters && (
        <Card className="mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Canteen
              </label>
              <Select
                value={canteenFilter}
                onChange={(e) => setCanteenFilter(e.target.value)}
                className="w-full"
              >
                <option value="">All Canteens</option>
                {canteens.map((canteen) => (
                  <option key={canteen._id} value={canteen._id}>
                    {canteen.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full"
              >
                <option value="">All Orders</option>
                <option value="priority">Priority Orders</option>
                <option value="standard">Standard Orders</option>
              </Select>
            </div>
          </div>
        </Card>
      )}

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
          <Table
            columns={columns}
            data={filteredOrders}
            emptyMessage="No orders found."
          />
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
                <p className="font-medium">{selectedOrder.email || 'Unknown'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Canteen</p>
                <p className="font-medium">
                  {selectedOrder.canteenId && typeof selectedOrder.canteenId === 'object'
                    ? selectedOrder.canteenId.name
                    : canteens.find(c => c._id === selectedOrder.canteenId)?.name || 'Unknown'}
                </p>
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
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Priority Reason</p>
                  <p className="font-medium">
                    {selectedOrder.priorityReason === 'exam' ? 'Exam' :
                     selectedOrder.priorityReason === 'faculty' ? 'Faculty with Exam Duty' :
                     selectedOrder.priorityReason === 'medical' ? 'Medical Reasons' : 'Other'}
                    {selectedOrder.priorityDetails && `: ${selectedOrder.priorityDetails}`}
                  </p>
                </div>
              )}

              <div className="col-span-2">
                <p className="text-sm text-gray-500">Delivery Address</p>
                <p className="font-medium">{selectedOrder.deliveryAddress || 'Not specified'}</p>
              </div>

              {selectedOrder.specialInstructions && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Special Instructions</p>
                  <p className="font-medium">{selectedOrder.specialInstructions}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Order Items</p>
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {item.itemId && typeof item.itemId === 'object'
                            ? item.itemId.itemName
                            : 'Unknown Item'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          ₹{item.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-right font-medium">
                        Total:
                      </td>
                      <td className="px-4 py-3 font-bold">
                        ₹{selectedOrder.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                    {selectedOrder.priority && selectedOrder.priorityFee > 0 && (
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-right text-xs text-gray-500">
                          Includes priority fee:
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          ₹{selectedOrder.priorityFee.toFixed(2)}
                        </td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminOrderManagement;
