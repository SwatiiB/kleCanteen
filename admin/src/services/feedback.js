import api from './api';

// Get canteen feedback (canteen staff only)
export const getCanteenFeedback = async (canteenId) => {
  try {
    console.log('getCanteenFeedback service - Making API call with canteenId:', canteenId);
    const response = await api.get(`/feedback/canteen/${canteenId}`);
    console.log('getCanteenFeedback service - API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('getCanteenFeedback service - API error:', error);
    console.error('getCanteenFeedback service - Error response:', error.response?.data);
    throw error.response?.data || { message: 'Failed to fetch feedback' };
  }
};

// Respond to feedback (canteen staff only)
export const respondToFeedback = async (feedbackId, responseData) => {
  try {
    const response = await api.put(`/feedback/${feedbackId}/respond`, responseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to submit response' };
  }
};

// Get feedback statistics (admin only)
export const getFeedbackStats = async () => {
  try {
    const response = await api.get('/feedback/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch feedback statistics' };
  }
};

// Get all feedback (admin only)
export const getAllFeedback = async () => {
  try {
    const response = await api.get('/feedback');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch all feedback' };
  }
};
