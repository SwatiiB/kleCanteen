import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CreditCard, AlertCircle } from 'lucide-react';
import Button from '../UI/Button';
import Loader from '../UI/Loader';
import OrderSuccessModal from '../UI/OrderSuccessModal';
import { createRazorpayOrder, verifyRazorpayPayment } from '../../services/payment';
import { useCart } from '../../context/CartContext';

const RazorpayPayment = ({
  orderId,
  amount,
  email,
  name,
  phone,
  canteenId,
  onPaymentSuccess,
  onPaymentFailure
}) => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState(null);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = async () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          resolve(true);
        };
        script.onerror = () => {
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create Razorpay order
      const orderResponse = await createRazorpayOrder({
        orderId,
        amount,
        email,
        name,
        phone
      });

      if (!orderResponse || !orderResponse.order || !orderResponse.key_id) {
        throw new Error('Failed to create payment order');
      }

      // Initialize Razorpay options
      const options = {
        key: orderResponse.key_id,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        name: 'KLE Canteen',
        description: 'Food Order Payment',
        order_id: orderResponse.order.id,
        prefill: orderResponse.prefill,
        image: '/logo.png', // Add your logo URL here
        theme: {
          color: '#3399cc'
        },
        handler: async function (response) {
          try {
            // Verify payment with backend
            const verificationData = {
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              paymentTime: new Date().toLocaleTimeString(),
              paymentMethod: 'razorpay',
              email,
              amount
            };

            const verificationResponse = await verifyRazorpayPayment(verificationData);

            // Store the payment response
            setPaymentResponse(verificationResponse);

            // Show success toast
            toast.success('Payment successful!');

            // Show success modal instead of navigating
            console.log('Razorpay payment verified successfully, showing success modal');
            setShowSuccessModal(true);

            // Call success callback
            if (onPaymentSuccess) {
              onPaymentSuccess(verificationResponse);
            }
          } catch (error) {
            console.error('Payment verification failed:', error);

            // Call failure callback
            if (onPaymentFailure) {
              onPaymentFailure(error);
            }

            toast.error(error.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.error('Payment cancelled');

            // Call failure callback
            if (onPaymentFailure) {
              onPaymentFailure({ message: 'Payment cancelled by user' });
            }
          }
        }
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

      // Handle Razorpay checkout errors
      razorpay.on('payment.failed', function (response) {
        setError(`Payment failed: ${response.error.description}`);

        // Call failure callback
        if (onPaymentFailure) {
          onPaymentFailure({
            message: 'Payment failed',
            error: response.error
          });
        }

        toast.error(`Payment failed: ${response.error.description}`);
      });
    } catch (error) {
      console.error('Error initiating payment:', error);
      setError(error.message || 'Failed to initiate payment');

      // Call failure callback
      if (onPaymentFailure) {
        onPaymentFailure(error);
      }

      toast.error(error.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
          <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <Button
        type="button"
        variant="primary"
        onClick={handlePayment}
        disabled={loading}
        className="w-full flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader size="sm" className="mr-2" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard size={16} className="mr-2" />
            Pay with Razorpay
          </>
        )}
      </Button>

      {/* Success Modal */}
      {showSuccessModal && paymentResponse && (
        <OrderSuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            console.log('Closing Razorpay success modal');
            // Ensure body overflow is reset when modal is closed
            document.body.style.overflow = 'auto';
            setShowSuccessModal(false);
          }}
          orderId={orderId}
          canteenId={canteenId}
          items={cartItems}
        />
      )}
    </div>
  );
};

export default RazorpayPayment;
