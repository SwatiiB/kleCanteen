import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, CreditCard, AlertCircle, Clock, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getCanteenById } from '../services/canteen';
import { createOrder } from '../services/order';

import { getExamsNext24Hours } from '../services/exam';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import Loader from '../components/UI/Loader';
import OrderSuccessModal from '../components/UI/OrderSuccessModal';
import RazorpayPayment from '../components/Payment/RazorpayPayment';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems, cartTotal, clearCart, getCartCanteenId } = useCart();

  const [canteen, setCanteen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState(null);
  const [orderCompleted, setOrderCompleted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    deliveryAddress: '',
    specialInstructions: '',
    paymentMethod: 'cash', // 'cash' or 'razorpay'
    priority: false,
    priorityReason: '',
    priorityDetails: '',
    examId: '',
  });

  // State for order ID after creation (needed for Razorpay)
  const [createdOrderId, setCreatedOrderId] = useState(null);

  const [formErrors, setFormErrors] = useState({});
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);

  // Redirect if not authenticated or cart is empty (unless order was just completed)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    // Only redirect to cart if cart is empty AND no order has been completed
    // This prevents redirection after successful order placement
    if (cartItems.length === 0 && !orderCompleted) {
      console.log('Cart is empty and no order completed, redirecting to cart page');
      navigate('/cart');
      return;
    }

    // Pre-fill user data
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }

    fetchCanteenDetails();
    fetchUpcomingExams();
  }, [isAuthenticated, cartItems, user, navigate, orderCompleted]);

  const fetchUpcomingExams = async () => {
    if (!isAuthenticated) return;

    try {
      setLoadingExams(true);
      console.log('Fetching upcoming exams for checkout...');
      const data = await getExamsNext24Hours();
      console.log('Received exams data:', data);

      if (data && data.length > 0) {
        console.log('Found upcoming exams:', data.length);
        data.forEach(exam => {
          console.log('Exam:', exam.examName, 'Date:', new Date(exam.examDate).toLocaleDateString(), 'Time:', exam.examTime);
        });
      } else {
        console.log('No upcoming exams found');
      }

      setUpcomingExams(data || []);

      // No longer auto-selecting priority when exams are found
      // Always keep priority as false by default
    } catch (err) {
      console.error('Error fetching upcoming exams:', err);
      // Don't show error toast as this is not critical for checkout
    } finally {
      setLoadingExams(false);
    }
  };

  const fetchCanteenDetails = async () => {
    const canteenId = getCartCanteenId();
    if (!canteenId) return;

    try {
      setLoading(true);
      const data = await getCanteenById(canteenId);
      setCanteen(data.canteen);

      // Redirect if canteen is closed
      const canteenAvailable = data.canteen.isAvailable !== undefined ?
        data.canteen.isAvailable : data.canteen.availability;

      if (!canteenAvailable) {
        toast.error('This canteen is currently closed. You cannot place orders at this time.');
        navigate('/cart');
      }

      setError(null);
    } catch (err) {
      setError('Failed to load canteen details. Please try again later.');
      console.error('Error fetching canteen details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      errors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.deliveryAddress.trim()) {
      errors.deliveryAddress = 'Delivery address is required';
    } else if (formData.deliveryAddress.trim().length < 10) {
      errors.deliveryAddress = 'Please enter a complete delivery address';
    }

    // Validate priority order fields if priority is selected
    if (formData.priority) {
      if (!formData.priorityReason) {
        errors.priorityReason = 'Please select a reason for priority';
      }

      // For student users who select 'exam' as the reason
      if (formData.priorityReason === 'exam' && user?.role !== 'faculty') {
        // Check if there are any exams available

        if (upcomingExams.length === 0) {
          errors.priorityReason = 'There are no exams scheduled in the next 24 hours. Please place an order without Priority.';
        }
        // If exams are available but none selected
        else if (!formData.examId) {
          errors.examId = 'Please select an exam';
        }
      }

      if (!formData.priorityDetails.trim()) {
        errors.priorityDetails = 'Please provide details for your priority request';
      }

      // Validate university ID range for priority orders with exam reason
      if (formData.priorityReason === 'exam' && formData.examId && user?.uniId) {
        const selectedExam = upcomingExams.find(exam => exam._id === formData.examId);

        if (selectedExam) {
          // Convert to uppercase for case-insensitive comparison
          const userUniId = user.uniId.toUpperCase();
          console.log('Frontend validation - User ID:', userUniId);
          console.log('Frontend validation - Exam range:', selectedExam.startUniversityId, '-', selectedExam.endUniversityId);

          // Use dynamic exam range validation instead of hardcoded ranges
          const startUniId = selectedExam.startUniversityId.toUpperCase();
          const endUniId = selectedExam.endUniversityId.toUpperCase();

          console.log('Frontend validation - Exam range:', {
            userUniId,
            startUniId,
            endUniId
          });

          // Parse university ID format to extract components for comparison
          const universityIdPattern = /^(\d{2})([A-Z]{2})(\d{2})([A-Z]{2,3})(\d{3})$/i;
          const userIdMatch = userUniId.match(universityIdPattern);
          const startIdMatch = startUniId.match(universityIdPattern);
          const endIdMatch = endUniId.match(universityIdPattern);

          if (userIdMatch && startIdMatch && endIdMatch) {
            // Extract components: [full, year, fe, batch, dept, number]
            const [, userYear, userFE, userBatch, userDept, userNumber] = userIdMatch;
            const [, startYear, startFE, startBatch, startDept, startNumber] = startIdMatch;
            const [, endYear, endFE, endBatch, endDept, endNumber] = endIdMatch;

            // Check if the base components match (year, FE, batch, department)
            const baseComponentsMatch =
              userYear === startYear && userYear === endYear &&
              userFE === startFE && userFE === endFE &&
              userBatch === startBatch && userBatch === endBatch &&
              userDept === startDept && userDept === endDept;

            if (!baseComponentsMatch) {
              errors.examId = `Your university ID (${user.uniId}) has different base components than the exam range (${selectedExam.startUniversityId} - ${selectedExam.endUniversityId})`;
            } else {
              // Check if the numeric part is within range
              const userNumericPart = parseInt(userNumber, 10);
              const startNumericPart = parseInt(startNumber, 10);
              const endNumericPart = parseInt(endNumber, 10);

              if (userNumericPart < startNumericPart || userNumericPart > endNumericPart) {
                errors.examId = `Your university ID (${user.uniId}) is outside the valid range (${selectedExam.startUniversityId} - ${selectedExam.endUniversityId})`;
              }
            }
          } else {
            // Fall back to string comparison if parsing fails
            if (userUniId < startUniId || userUniId > endUniId) {
              errors.examId = `Your university ID (${user.uniId}) is outside the valid range (${selectedExam.startUniversityId} - ${selectedExam.endUniversityId})`;
            }
          }

        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Razorpay payment success
  const handlePaymentSuccess = (response) => {
    console.log('Razorpay payment success, order ID:', createdOrderId);

    // Clear cart
    clearCart();

    // Show success message
    toast.success('Payment successful! Your order has been placed.');

    // Set success order ID (modal is shown by the RazorpayPayment component)
    setSuccessOrderId(createdOrderId);
    setOrderCompleted(true); // Mark order as completed to prevent redirection

    // Note: The modal is shown by the RazorpayPayment component itself
    // We don't need to set showSuccessModal here
  };

  // Handle Razorpay payment failure
  const handlePaymentFailure = (error) => {
    toast.error(error.message || 'Payment failed. Please try again or choose a different payment method.');
    setSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform frontend validation
    if (!validateForm()) {
      console.log('Frontend validation failed, preventing form submission');
      return;
    }

    // Additional validation for priority orders
    if (formData.priority && formData.priorityReason === 'exam' && formData.examId && user?.uniId) {
      console.log('Performing additional priority order validation');
      const selectedExam = upcomingExams.find(exam => exam._id === formData.examId);

      if (selectedExam) {
        // Log validation attempt for debugging
        console.log('Priority order validation check:', {
          userUniId: user.uniId,
          examRange: {
            start: selectedExam.startUniversityId,
            end: selectedExam.endUniversityId
          }
        });

        // Validation will be handled by the backend using dynamic exam ranges
      }
    }

    try {
      setSubmitting(true);

      // Check if canteen is still available
      if (canteen) {
        const canteenAvailable = canteen.isAvailable !== undefined ?
          canteen.isAvailable : canteen.availability;

        if (!canteenAvailable) {
          toast.error('This canteen is currently closed. You cannot place orders at this time.');
          navigate('/cart');
          return;
        }
      }

      // Calculate totals
      const subtotal = cartTotal;
      const deliveryFee = 10;
      const priorityFee = formData.priority ? 5 : 0; // ₹5 additional charge for priority orders
      const total = subtotal + deliveryFee + priorityFee;

      // Get current time in format "HH:MM AM/PM"
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      const currentTime = `${formattedHours}:${formattedMinutes} ${ampm}`;

      // Default pickup time is 30 minutes from now
      const pickupDate = new Date(now.getTime() + 30 * 60000);
      const pickupHours = pickupDate.getHours();
      const pickupMinutes = pickupDate.getMinutes();
      const pickupAmpm = pickupHours >= 12 ? 'PM' : 'AM';
      const formattedPickupHours = pickupHours % 12 || 12;
      const formattedPickupMinutes = pickupMinutes < 10 ? `0${pickupMinutes}` : pickupMinutes;
      const pickupTime = `${formattedPickupHours}:${formattedPickupMinutes} ${pickupAmpm}`;

      // Prepare order data
      const orderData = {
        email: formData.email, // Add email field
        orderTime: currentTime, // Add orderTime field
        pickupTime: pickupTime, // Add pickupTime field
        items: cartItems.map(item => ({
          itemId: item._id, // Use itemId instead of menuItemId
          quantity: item.quantity,
          price: item.price,
        })),
        canteenId: getCartCanteenId(),
        totalAmount: total,
        specialInstructions: formData.specialInstructions,
        paymentMethod: formData.paymentMethod,
        priority: formData.priority,
        deliveryAddress: formData.deliveryAddress,
      };

      // Add priority-related fields if priority is selected
      if (formData.priority) {
        orderData.priorityReason = formData.priorityReason;
        orderData.priorityDetails = formData.priorityDetails;

        // Add examId if priority reason is exam and an exam is selected
        if (formData.priorityReason === 'exam' && formData.examId) {
          orderData.examId = formData.examId;
        }
      }

      // Log order data for debugging
      console.log('Sending order data:', orderData);

      // Create order
      const orderResponse = await createOrder(orderData);
      console.log('Order response:', orderResponse);

      // If payment method is Razorpay, store the order ID and don't redirect yet
      if (formData.paymentMethod === 'razorpay') {
        setCreatedOrderId(orderResponse.order._id);
        return; // Don't proceed with cart clearing and redirection yet
      }

      // For cash and card payments, proceed with order completion
      // Clear cart
      clearCart();

      // Show success message
      toast.success('Order placed successfully!');

      // Set success order ID and show success modal instead of redirecting
      console.log('Order completed successfully, showing modal with order ID:', orderResponse.order._id);
      setSuccessOrderId(orderResponse.order._id);
      setShowSuccessModal(true);
      setOrderCompleted(true); // Mark order as completed to prevent redirection

    } catch (err) {
      console.error('Error placing order:', err);

      // Handle different error types
      if (err.type === 'UNIVERSITY_ID_VALIDATION_ERROR' || err.errorType === 'UNIVERSITY_ID_RANGE_ERROR') {
        // Display a detailed error message for university ID validation errors
        const errorMessage = err.formattedMessage || err.message || 'Your university ID is not eligible for priority status for the selected exam.';
        const details = err.details || '';

        // Create a more user-friendly error message with the details
        const fullErrorMessage = err.formattedMessage
          ? errorMessage // Already formatted nicely
          : details
            ? `${errorMessage}\n${details}`
            : errorMessage;

        toast.error(fullErrorMessage, {
          duration: 6000, // Show for longer (6 seconds) since this is important information
          style: {
            maxWidth: '500px', // Wider toast for more detailed message
          },
        });

        // Also set the error in the form for better visibility
        setFormErrors(prev => ({
          ...prev,
          examId: fullErrorMessage
        }));
      }
      // Check if the error is related to no exam selected
      else if (err.type === 'NO_EXAM_SELECTED_ERROR') {
        const errorMessage = err.formattedMessage || 'You must select an exam to place a priority order with exam reason.';

        toast.error(errorMessage, {
          duration: 6000,
          style: {
            maxWidth: '500px',
          },
        });

        // Set the error in the form
        setFormErrors(prev => ({
          ...prev,
          examId: errorMessage
        }));
      }
      // Check if the error is due to unavailable items
      else if (err.type === 'UNAVAILABLE_ITEMS_ERROR' && err.unavailableItems && err.unavailableItems.length > 0) {
        // Format the unavailable items for display
        const itemNames = err.unavailableItems.map(item => item.name).join(', ');
        toast.error(`Some items in your cart are no longer available: ${itemNames}. Please remove them and try again.`);
      }
      // Check if the error is related to university ID format
      else if (err.errorType === 'UNIVERSITY_ID_FORMAT_ERROR') {
        const errorMessage = `Your university ID format is not valid for this exam. Please check that your ID follows the correct format.`;
        toast.error(errorMessage, {
          duration: 6000,
          style: {
            maxWidth: '500px',
          },
        });

        // Set the error in the form
        setFormErrors(prev => ({
          ...prev,
          examId: errorMessage
        }));
      }
      // Check for general validation errors
      else if (err.type === 'VALIDATION_ERROR') {
        const errorMessage = err.formattedMessage || err.message || 'Validation failed. Please check your input and try again.';
        toast.error(errorMessage, {
          duration: 6000,
          style: {
            maxWidth: '500px',
          },
        });

        // Set the error in the form if it's related to priority/exam
        if (err.message && (err.message.includes('priority') || err.message.includes('exam'))) {
          setFormErrors(prev => ({
            ...prev,
            examId: errorMessage
          }));
        }
      }
      // Check for authentication errors
      else if (err.type === 'AUTHENTICATION_ERROR') {
        const errorMessage = err.formattedMessage || 'Authentication error. Please log out and log in again.';
        toast.error(errorMessage, {
          duration: 6000,
          style: {
            maxWidth: '500px',
          },
        });

        // Redirect to login after a short delay
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 3000);
      }
      else {
        // Generic error message for other errors
        console.error('Unhandled order error:', err);
        toast.error(err.message || 'Failed to place order. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate totals
  const subtotal = cartTotal;
  const deliveryFee = 10; // Fixed delivery fee
  const priorityFee = formData.priority ? 5 : 0; // ₹5 additional charge for priority orders
  const total = subtotal + deliveryFee + priorityFee;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-600">
          Complete your order
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checkout form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={formErrors.name}
                      required
                    />

                    <Input
                      label="Phone Number"
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      error={formErrors.phone}
                      required
                    />

                    <div className="md:col-span-2">
                      <Input
                        label="Email"
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={formErrors.email}
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Input
                        label="Delivery Address"
                        type="text"
                        id="deliveryAddress"
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleChange}
                        error={formErrors.deliveryAddress}
                        placeholder="Enter your complete delivery address"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Order Details</h3>
                  <div>
                    <label
                      htmlFor="specialInstructions"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      id="specialInstructions"
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleChange}
                      rows="3"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any special instructions for your order..."
                    ></textarea>
                  </div>
                </div>

                {/* Priority Order Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Priority Order</h3>
                  <div className="bg-blue-50 p-4 rounded-md mb-4">
                    <div className="flex items-start">
                      <AlertCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={18} />
                      <p className="text-sm text-blue-700">
                        Priority orders are processed first and are available for students with exams,
                        faculty with exam duties, or other urgent situations. Please provide valid details.
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center">
                      <input
                        id="priority"
                        name="priority"
                        type="checkbox"
                        checked={formData.priority}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            priority: e.target.checked,
                            // Reset priority fields if unchecked
                            ...(e.target.checked ? {} : {
                              priorityReason: '',
                              priorityDetails: '',
                              examId: ''
                            })
                          }));
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="priority" className="ml-2 block text-sm font-medium text-gray-700">
                        Request Priority Processing
                      </label>
                    </div>
                  </div>

                  {formData.priority && (
                    <div className="space-y-4 pl-4 border-l-2 border-blue-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reason for Priority <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          {/* Filter priority reasons based on user role */}
                          {['exam', 'faculty', 'medical', 'other']
                            .filter(reason => {
                              // Remove 'faculty' option for students
                              if (reason === 'faculty' && user?.role === 'student') {
                                return false;
                              }
                              // Remove 'exam' option for faculty
                              if (reason === 'exam' && user?.role === 'faculty') {
                                return false;
                              }
                              return true;
                            })
                            .map((reason) => (
                              <div key={reason} className="flex items-center">
                                <input
                                  id={`reason-${reason}`}
                                  name="priorityReason"
                                  type="radio"
                                  value={reason}
                                  checked={formData.priorityReason === reason}
                                  onChange={handleChange}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <label htmlFor={`reason-${reason}`} className="ml-2 block text-sm text-gray-700 capitalize">
                                  {reason === 'exam' ? 'I have an exam today' :
                                   reason === 'faculty' ? 'I am faculty with exam duty' :
                                   reason === 'medical' ? 'Medical reasons' : 'Other urgent reason'}
                                </label>
                              </div>
                            ))}
                        </div>
                        {formErrors.priorityReason && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.priorityReason}</p>
                        )}
                      </div>

                      {formData.priorityReason === 'exam' && (
                        <div>
                          <label htmlFor="examId" className="block text-sm font-medium text-gray-700 mb-1">
                            Select Your Exam <span className="text-red-500">*</span>
                          </label>

                          {loadingExams ? (
                            <div className="flex items-center space-x-2">
                              <Loader size="sm" />
                              <span className="text-sm text-gray-500">Loading exams...</span>
                            </div>
                          ) : upcomingExams.length > 0 ? (
                            <div>
                              <div className="bg-yellow-50 p-3 rounded-md mb-3">
                                <div className="flex items-start">
                                  <Clock className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                                  <p className="text-xs text-yellow-700">
                                    These are exams scheduled within the next 24 hours. Selecting an exam will automatically mark your order as priority.
                                  </p>
                                </div>
                              </div>



                              <div className="space-y-2">
                                {upcomingExams.map((exam) => (
                                  <div key={exam._id} className="border rounded-md p-3 hover:border-blue-500 transition-colors">
                                    <div className="flex items-start">
                                      <input
                                        id={`exam-${exam._id}`}
                                        type="radio"
                                        name="examId"
                                        value={exam._id}
                                        checked={formData.examId === exam._id}
                                        onChange={handleChange}
                                        className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300"
                                      />
                                      <label htmlFor={`exam-${exam._id}`} className="ml-2 block text-sm">
                                        <div className="font-medium text-gray-900">
                                          {exam.examName || `${exam.department} Exam`}
                                        </div>
                                        <div className="text-gray-600 text-xs mt-1">
                                          <div className="flex items-center">
                                            <Clock size={12} className="mr-1" />
                                            {new Date(exam.examDate).toLocaleDateString()} at {exam.examTime}
                                          </div>
                                        <div className="mt-1">
                                          Department: {exam.department}, Semester: {exam.semester}
                                        </div>
                                        {exam.startUniversityId && exam.endUniversityId && (
                                          <div className="mt-1 text-xs text-amber-700">
                                            <span className="font-medium">Valid ID Range:</span> {exam.startUniversityId} - {exam.endUniversityId}
                                          </div>
                                        )}
                                      </div>
                                    </label>
                                  </div>
                                </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-red-500 p-3 bg-red-50 rounded border border-red-200">
                              <p className="font-medium">No exams scheduled within the next 24 hours.</p>
                              <p className="mt-1 text-xs">You cannot place a priority order with exam reason when there are no exams. Please select another reason for priority or place a standard order.</p>
                            </div>
                          )}

                          {formErrors.examId && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.examId}</p>
                          )}
                        </div>
                      )}

                      <div>
                        <label htmlFor="priorityDetails" className="block text-sm font-medium text-gray-700 mb-1">
                          Additional Details <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="priorityDetails"
                          name="priorityDetails"
                          value={formData.priorityDetails}
                          onChange={handleChange}
                          rows="2"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={
                            // Show appropriate placeholder based on selected reason and user role
                            formData.priorityReason === 'exam' && user?.role !== 'faculty'
                              ? "Provide exam details (subject, time, etc.)"
                              : formData.priorityReason === 'faculty' && user?.role !== 'student'
                                ? "Provide details about your exam duty"
                                : formData.priorityReason === 'medical'
                                  ? "Provide brief medical reason"
                                  : "Explain why you need priority processing"
                          }
                        ></textarea>
                        {formErrors.priorityDetails && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.priorityDetails}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        id="cash"
                        name="paymentMethod"
                        type="radio"
                        value="cash"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="cash" className="ml-2 block text-sm text-gray-700">
                        Cash on Delivery
                      </label>
                    </div>



                    <div className="flex items-center">
                      <input
                        id="razorpay"
                        name="paymentMethod"
                        type="radio"
                        value="razorpay"
                        checked={formData.paymentMethod === 'razorpay'}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="razorpay" className="ml-2 flex items-center text-sm text-gray-700">
                        <Wallet size={16} className="mr-1" />
                        Razorpay (UPI, Cards, Wallets)
                        <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">Recommended</span>
                      </label>
                    </div>

                    {formData.paymentMethod === 'razorpay' && createdOrderId && (
                      <div className="mt-4 p-4 border rounded-md">
                        <RazorpayPayment
                          orderId={createdOrderId}
                          amount={total}
                          email={formData.email}
                          name={formData.name}
                          phone={formData.phone}
                          canteenId={getCartCanteenId()}
                          onPaymentSuccess={handlePaymentSuccess}
                          onPaymentFailure={handlePaymentFailure}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/cart')}
                    className="flex items-center"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Cart
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting || (formData.paymentMethod === 'razorpay' && createdOrderId)}
                    className="flex items-center"
                  >
                    {submitting ? (
                      <>
                        <Loader size="sm" className="mr-2" />
                        Processing...
                      </>
                    ) : formData.paymentMethod === 'razorpay' && !createdOrderId ? (
                      <>
                        <Wallet size={16} className="mr-2" />
                        Continue to Payment
                      </>
                    ) : formData.paymentMethod === 'razorpay' && createdOrderId ? (
                      <>
                        <CreditCard size={16} className="mr-2" />
                        Pay with Razorpay Above
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} className="mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

            {canteen && (
              <div className="mb-4 pb-4 border-b">
                <p className="text-sm text-gray-600">Ordering from</p>
                <h4 className="font-medium">{canteen.name}</h4>
              </div>
            )}

            <div className="space-y-3 mb-4">
              {cartItems.map(item => (
                <div key={item._id} className="flex justify-between">
                  <span className="text-gray-600">
                    {item.name} x {item.quantity}
                  </span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>

              {formData.priority && (
                <div className="flex justify-between text-blue-700">
                  <span>Priority Fee</span>
                  <span>₹{priorityFee.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              {formData.priority ? (
                <div className="mt-3 bg-blue-50 p-3 rounded-md">
                  <div className="flex items-center">
                    <AlertCircle size={16} className="text-blue-600 mr-2" />
                    <span className="text-sm text-blue-700 font-medium">Priority Order</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Your order will be processed with priority and delivered in 5-10 minutes.
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Additional fee: ₹{priorityFee.toFixed(2)}
                  </p>
                </div>
              ) : (
                <div className="mt-3 bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-600">
                    Standard delivery time: 10-20 minutes
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Success Modal for non-Razorpay payments */}
      {console.log('Checkout render - showSuccessModal:', showSuccessModal, 'successOrderId:', successOrderId)}
      {showSuccessModal && successOrderId && (
        <OrderSuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            // Ensure body overflow is reset when modal is closed
            document.body.style.overflow = 'auto';
            setShowSuccessModal(false);
            // Don't reset orderCompleted here to prevent redirection
          }}
          orderId={successOrderId}
          canteenId={getCartCanteenId()}
          items={cartItems}
        />
      )}
    </div>
  );
};

export default Checkout;
