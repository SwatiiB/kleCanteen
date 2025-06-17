import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Clock, MapPin } from 'lucide-react';
import { getOrderById } from '../services/order';
import { getPaymentById } from '../services/payment';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Loader from '../components/UI/Loader';

const PaymentSuccess = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        const paymentData = await getPaymentById(paymentId);
        setPayment(paymentData);

        // Fetch order details
        if (paymentData.orderId) {
          const orderData = await getOrderById(paymentData.orderId._id);
          setOrder(orderData.order);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching payment details:', err);
        setError('Failed to load payment details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) {
      fetchPaymentDetails();
    }
  }, [paymentId]);

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Payment Error</h1>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/orders')}
          className="flex items-center mx-auto"
        >
          <ArrowLeft size={16} className="mr-2" />
          Go to Orders
        </Button>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Payment Not Found</h1>
          <p className="text-gray-600 mt-2">The payment details could not be found.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/orders')}
          className="flex items-center mx-auto"
        >
          <ArrowLeft size={16} className="mr-2" />
          Go to Orders
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment Successful</h1>
        <p className="text-gray-600">
          Your payment has been processed successfully
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 flex items-center">
        <CheckCircle className="text-green-500 mr-4" size={32} />
        <div>
          <h2 className="text-lg font-semibold text-green-800">Payment Confirmed</h2>
          <p className="text-green-700">
            Thank you for your payment. Your order has been confirmed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Payment ID</span>
              <span className="font-medium">{payment.razorpayDetails?.paymentId || payment._id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount</span>
              <span className="font-medium">₹{payment.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium capitalize">{payment.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Date</span>
              <span className="font-medium">
                {new Date(payment.paymentDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Time</span>
              <span className="font-medium">{payment.paymentTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="font-medium capitalize">{payment.paymentStatus}</span>
            </div>
          </div>
        </Card>

        {order && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Order Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID</span>
                <span className="font-medium">{order.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date</span>
                <span className="font-medium">
                  {new Date(order.orderDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Status</span>
                <span className="font-medium capitalize">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Items</span>
                <span className="font-medium">{order.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-medium">₹{order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center mt-2">
                <Clock size={16} className="text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">
                  Pickup Time: {order.pickupTime}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outline"
          onClick={() => navigate('/orders')}
          className="flex items-center justify-center"
        >
          <ArrowLeft size={16} className="mr-2" />
          View All Orders
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate('/')}
          className="flex items-center justify-center"
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
