import api from './api';

// Get all orders (admin only)
export const getAllOrders = async () => {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch orders' };
  }
};

// Get orders by user (admin only)
export const getOrdersByUser = async (email) => {
  try {
    const response = await api.get(`/orders/user/${email}/all`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user orders' };
  }
};

// Get orders by canteen (canteen staff only)
// The backend API sorts orders by creation date (newest first)
export const getOrdersByCanteen = async (canteenId) => {
  try {
    // Ensure canteenId is a string
    const canteenIdStr = canteenId ? canteenId.toString() : null;

    if (!canteenIdStr) {
      throw new Error('Invalid canteen ID');
    }

    console.log('Fetching orders for canteen ID:', canteenIdStr);
    const response = await api.get(`/orders/canteen/${canteenIdStr}`);
    // Orders are returned sorted by createdAt (-1) from the backend (newest first)
    return response.data;
  } catch (error) {
    console.error('Error fetching orders by canteen:', error);
    throw error.response?.data || { message: 'Failed to fetch canteen orders' };
  }
};

// Get priority orders by canteen (canteen staff only)
export const getPriorityOrdersByCanteen = async (canteenId) => {
  try {
    // Ensure canteenId is a string
    const canteenIdStr = canteenId ? canteenId.toString() : null;

    if (!canteenIdStr) {
      throw new Error('Invalid canteen ID');
    }

    console.log('Fetching priority orders for canteen ID:', canteenIdStr);
    const response = await api.get(`/orders/canteen/${canteenIdStr}/priority`);
    return response.data;
  } catch (error) {
    console.error('Error fetching priority orders by canteen:', error);
    throw error.response?.data || { message: 'Failed to fetch priority orders' };
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

// Update order status (canteen staff only)
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.patch(`/orders/${orderId}/status`, { status });

    // If the response includes refund information, return it
    if (status === 'cancelled' && response.data.refund) {
      console.log('Refund processed:', response.data.refund);
    }

    return response.data;
  } catch (error) {
    // If there's a specific error message from the server, use it
    if (error.response?.data?.message) {
      throw {
        message: error.response.data.message,
        details: error.response.data.details || error.response.data.error
      };
    }

    throw { message: 'Failed to update order status' };
  }
};

// Update order status (admin only)
export const updateOrderStatusAdmin = async (orderId, status) => {
  try {
    const response = await api.patch(`/orders/${orderId}/status/admin`, { status });

    // If the response includes refund information, return it
    if (status === 'cancelled' && response.data.refund) {
      console.log('Refund processed by admin:', response.data.refund);
    }

    return response.data;
  } catch (error) {
    // If there's a specific error message from the server, use it
    if (error.response?.data?.message) {
      throw {
        message: error.response.data.message,
        details: error.response.data.details || error.response.data.error
      };
    }

    throw { message: 'Failed to update order status' };
  }
};

// Cancel order (admin only)
export const cancelOrderAdmin = async (orderId) => {
  try {
    const response = await api.patch(`/orders/${orderId}/cancel/admin`);

    // Log refund information if available
    if (response.data.refund) {
      console.log('Refund processed by admin:', response.data.refund);
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
