import api from './api';

// Create Razorpay order
export const createRazorpayOrder = async (orderData) => {
  try {
    const response = await api.post('/payments/create-order', orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create payment order' };
  }
};

// Verify Razorpay payment
export const verifyRazorpayPayment = async (paymentData) => {
  try {
    const response = await api.post('/payments/verify', paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Payment verification failed' };
  }
};

// Get payment information for an order
export const getPaymentByOrderId = async (orderId) => {
  try {
    const response = await api.get(`/payments/order/${orderId}`);
    return response.data;
  } catch (error) {
    // If payment not found, return a default object indicating it's not an online paid order
    if (error.response?.status === 404) {
      return {
        isOnlinePaid: false,
        paymentMethod: 'cash',
        paymentStatus: null
      };
    }
    throw error.response?.data || { message: 'Failed to fetch payment information' };
  }
};

// Get payment by ID
export const getPaymentById = async (paymentId) => {
  try {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch payment details' };
  }
};

// Process payment (legacy method - kept for backward compatibility)
export const processPayment = async (paymentData) => {
  try {
    const response = await api.post('/payments', paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Payment processing failed' };
  }
};

// Get user's payment history
export const getUserPayments = async (email) => {
  try {
    const response = await api.get(`/payments/user/${email}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch payment history' };
  }
};
