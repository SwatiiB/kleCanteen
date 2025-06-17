import api from './api';

// Get all payments (admin only)
export const getAllPayments = async () => {
  try {
    const response = await api.get('/payments');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch payments' };
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

// Get payment by order ID
export const getPaymentByOrderId = async (orderId) => {
  try {
    console.log(`Fetching payment info for order ID: ${orderId}`);
    const response = await api.get(`/payments/order/${orderId}`);
    console.log(`Payment info received:`, response.data);

    // Ensure we always return an object with the expected structure
    return {
      ...response.data,
      isOnlinePaid: response.data.isOnlinePaid || false,
      paymentMethod: response.data.paymentMethod || 'cash',
      paymentStatus: response.data.paymentStatus || null
    };
  } catch (error) {
    console.error(`Error fetching payment for order ${orderId}:`, error);

    // If payment not found, return a default object indicating it's not an online paid order
    if (error.response?.status === 404) {
      console.log(`No payment found for order ${orderId}, returning default values`);
      return {
        isOnlinePaid: false,
        paymentMethod: 'cash',
        paymentStatus: null
      };
    }

    // For other errors, also return default values but log the error
    console.error(`Error details:`, error.response?.data || error.message);
    return {
      isOnlinePaid: false,
      paymentMethod: 'cash',
      paymentStatus: null,
      error: error.response?.data?.message || error.message || 'Failed to fetch payment information'
    };
  }
};

// Process refund (admin and canteen staff)
export const processRefund = async (paymentId) => {
  try {
    const response = await api.post(`/payments/${paymentId}/refund`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to process refund' };
  }
};
