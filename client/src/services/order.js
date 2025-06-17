import api from './api';

// Create a new order
export const createOrder = async (orderData) => {
  try {
    console.log('Order service sending data:', orderData);
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Order creation error:', error.response?.data || error);

    // Handle specific error types
    if (error.response?.data) {
      // Log the error details for debugging
      console.log('Order creation error details:', {
        status: error.response.status,
        data: error.response.data,
        errorType: error.response.data.errorType,
        message: error.response.data.message,
        details: error.response.data.details
      });

      // Check for university ID validation error by errorType or message content
      if (error.response.data.errorType === 'UNIVERSITY_ID_RANGE_ERROR' ||
          (error.response.data.message && error.response.data.message.includes('university ID is not eligible'))) {
        throw {
          ...error.response.data,
          type: 'UNIVERSITY_ID_VALIDATION_ERROR',
          // Format a user-friendly error message
          formattedMessage: error.response.data.examName
            ? `Your university ID (${error.response.data.studentId}) is not eligible for the exam "${error.response.data.examName}".`
            : error.response.data.message
        };
      }

      // Check for university ID format error
      if (error.response.data.errorType === 'UNIVERSITY_ID_FORMAT_ERROR') {
        throw {
          ...error.response.data,
          type: 'UNIVERSITY_ID_VALIDATION_ERROR',
          formattedMessage: `Your university ID (${error.response.data.studentId || 'Unknown'}) format is not valid for this exam. Please ensure it follows the correct format.`
        };
      }

      // Check for missing ID information
      if (error.response.data.errorType === 'MISSING_ID_INFORMATION') {
        throw {
          ...error.response.data,
          type: 'UNIVERSITY_ID_VALIDATION_ERROR',
          formattedMessage: 'Missing university ID information. Please ensure your profile has a valid university ID.'
        };
      }

      // Check for no exam selected error
      if (error.response.data.errorType === 'NO_EXAM_SELECTED_ERROR') {
        throw {
          ...error.response.data,
          type: 'NO_EXAM_SELECTED_ERROR',
          formattedMessage: 'You must select an exam to place a priority order with exam reason.'
        };
      }

      // Check for unavailable items error
      if (error.response.data.unavailableItems) {
        throw {
          ...error.response.data,
          type: 'UNAVAILABLE_ITEMS_ERROR'
        };
      }

      // Check for general validation error
      if (error.response.data.errorType === 'VALIDATION_ERROR') {
        throw {
          ...error.response.data,
          type: 'VALIDATION_ERROR',
          formattedMessage: error.response.data.details || error.response.data.message || 'Validation failed. Please check your input and try again.'
        };
      }

      // Check for authentication error
      if (error.response.data.errorType === 'AUTHENTICATION_ERROR') {
        throw {
          ...error.response.data,
          type: 'AUTHENTICATION_ERROR',
          formattedMessage: 'Authentication error. Please log out and log in again.'
        };
      }

      throw error.response.data;
    }

    throw { message: 'Failed to create order' };
  }
};

// Get user's orders
export const getUserOrders = async (email) => {
  try {
    const response = await api.get(`/orders/user/${email}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch orders' };
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch order details' };
  }
};

// Cancel order
export const cancelOrder = async (orderId) => {
  try {
    const response = await api.patch(`/orders/${orderId}/cancel`);

    // Log refund information if available
    if (response.data.refund) {
      console.log('Refund information:', response.data.refund);
    }

    return response.data;
  } catch (error) {
    // Handle specific error types
    if (error.response?.data) {
      // Check for online paid order cancellation restrictions
      if (error.response.data.message && error.response.data.message.includes('Cannot cancel this order')) {
        throw {
          ...error.response.data,
          formattedMessage: error.response.data.details || 'This order cannot be cancelled because it is already being prepared.'
        };
      }

      throw error.response.data;
    }

    throw { message: 'Failed to cancel order' };
  }
};
