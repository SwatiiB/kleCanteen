import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Eye, 
  Filter, 
  Search, 
  RefreshCw, 
  CreditCard, 
  Calendar,
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Table from '../../components/UI/Table';
import Modal from '../../components/UI/Modal';
import Loader from '../../components/UI/Loader';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import { getAllPayments, processRefund } from '../../services/payment';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  
  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getAllPayments();
      setPayments(data);
      setFilteredPayments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments. Please try again.');
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply filters and sorting
    let filtered = [...payments];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.transactionId?.toLowerCase().includes(term) ||
        payment.email?.toLowerCase().includes(term) ||
        payment._id?.toLowerCase().includes(term) ||
        payment.orderId?._id?.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(payment => payment.paymentStatus === statusFilter);
    }
    
    // Apply method filter
    if (methodFilter) {
      filtered = filtered.filter(payment => payment.paymentMethod === methodFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle nested fields
      if (sortField === 'orderId.status' && a.orderId && b.orderId) {
        aValue = a.orderId.status;
        bValue = b.orderId.status;
      }
      
      // Handle dates
      if (sortField === 'createdAt' || sortField === 'paymentDate') {
        return sortDirection === 'asc' 
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
      }
      
      // Handle strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Handle numbers
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
    
    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter, methodFilter, sortField, sortDirection]);

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setIsViewModalOpen(true);
  };

  const handleRefund = (payment) => {
    setSelectedPayment(payment);
    setIsRefundModalOpen(true);
  };

  const confirmRefund = async () => {
    if (!selectedPayment) return;
    
    try {
      setProcessingRefund(true);
      await processRefund(selectedPayment._id);
      toast.success('Refund processed successfully');
      setIsRefundModalOpen(false);
      fetchPayments(); // Refresh the payments list
    } catch (err) {
      console.error('Error processing refund:', err);
      toast.error(err.message || 'Failed to process refund');
    } finally {
      setProcessingRefund(false);
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const columns = [
    {
      header: 'Transaction ID',
      accessor: 'transactionId',
      cell: (row) => (
        <div className="font-medium text-gray-900 truncate max-w-[150px]">
          {row.transactionId || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      cell: (row) => formatDate(row.createdAt),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (row) => (
        <div className="font-medium">
          ₹{row.amount?.toFixed(2) || '0.00'}
        </div>
      ),
    },
    {
      header: 'Method',
      accessor: 'paymentMethod',
      cell: (row) => (
        <div className="capitalize">
          {row.paymentMethod}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'paymentStatus',
      cell: (row) => getStatusBadge(row.paymentStatus),
    },
    {
      header: 'Order Status',
      accessor: 'orderId.status',
      cell: (row) => (
        <div className="capitalize">
          {row.orderId?.status || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewPayment(row);
            }}
          >
            <Eye size={16} />
          </Button>
          {row.paymentStatus === 'completed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRefund(row);
              }}
            >
              <RotateCcw size={16} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading && payments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (error && payments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          variant="primary"
          onClick={fetchPayments}
          className="flex items-center mx-auto"
        >
          <RefreshCw size={16} className="mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
        <p className="text-gray-600">
          View and manage all payment transactions
        </p>
      </div>

      <Card className="mb-6">
        <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search by transaction ID, email or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter size={16} className="mr-2" />
              Filters
            </Button>
            
            <Button
              variant="outline"
              onClick={fetchPayments}
              className="flex items-center"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <Select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full"
              >
                <option value="">All Methods</option>
                <option value="razorpay">Razorpay</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="upi">UPI</option>
                <option value="wallet">Wallet</option>
                <option value="cash">Cash</option>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setMethodFilter('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={filteredPayments}
            onRowClick={handleViewPayment}
            emptyMessage="No payment records found"
          />
        </div>
      </Card>

      {/* Payment Details Modal */}
      {selectedPayment && isViewModalOpen && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Payment Details"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Transaction ID</h3>
                <p className="mt-1 text-sm text-gray-900">{selectedPayment.transactionId || 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
                <p className="mt-1">{getStatusBadge(selectedPayment.paymentStatus)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                <p className="mt-1 text-sm text-gray-900 font-medium">₹{selectedPayment.amount?.toFixed(2) || '0.00'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                <p className="mt-1 text-sm text-gray-900 capitalize">{selectedPayment.paymentMethod}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Payment Date</h3>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPayment.createdAt)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Payment Time</h3>
                <p className="mt-1 text-sm text-gray-900">{formatTime(selectedPayment.paymentTime)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer Email</h3>
                <p className="mt-1 text-sm text-gray-900">{selectedPayment.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Order ID</h3>
                <p className="mt-1 text-sm text-gray-900">{selectedPayment.orderId?._id || 'N/A'}</p>
              </div>
            </div>
            
            {selectedPayment.razorpayDetails && (
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-2">Razorpay Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Razorpay Order ID</h3>
                    <p className="mt-1 text-sm text-gray-900">{selectedPayment.razorpayDetails.orderId || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Razorpay Payment ID</h3>
                    <p className="mt-1 text-sm text-gray-900">{selectedPayment.razorpayDetails.paymentId || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              {selectedPayment.paymentStatus === 'completed' && (
                <Button
                  variant="danger"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setIsRefundModalOpen(true);
                  }}
                >
                  Process Refund
                </Button>
              )}
              <Button
                variant="primary"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Refund Confirmation Modal */}
      {selectedPayment && isRefundModalOpen && (
        <Modal
          isOpen={isRefundModalOpen}
          onClose={() => !processingRefund && setIsRefundModalOpen(false)}
          title="Confirm Refund"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to process a refund for this payment?
            </p>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-medium">{selectedPayment.transactionId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">₹{selectedPayment.amount?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{selectedPayment.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(selectedPayment.createdAt)}</p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-red-600">
              This action cannot be undone. The full amount will be refunded to the customer.
            </p>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsRefundModalOpen(false)}
                disabled={processingRefund}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmRefund}
                disabled={processingRefund}
                className="flex items-center"
              >
                {processingRefund ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  'Confirm Refund'
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PaymentManagement;
