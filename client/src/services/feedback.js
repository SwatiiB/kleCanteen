import api from './api';

// Submit feedback
export const submitFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/feedback', feedbackData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to submit feedback' };
  }
};

// Get user's feedback history
export const getUserFeedback = async () => {
  try {
    const response = await api.get('/feedback/user');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch feedback history' };
  }
};

// Check if user can submit feedback for a canteen
export const canSubmitFeedback = async (canteenId) => {
  try {
    const response = await api.get(`/feedback/canteen/${canteenId}/can-submit`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to check feedback eligibility' };
  }
};

// Check if user has already submitted feedback for an order
export const hasSubmittedFeedback = async (orderId) => {
  try {
    const response = await api.get(`/feedback/order/${orderId}/exists`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to check feedback status' };
  }
};

// Get all feedback (for homepage testimonials)
export const getAllFeedback = async () => {
  try {
    // This is a public endpoint that returns a limited set of feedback for testimonials
    const response = await api.get('/feedback/testimonials');
    return response.data;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return []; // Return empty array on error to prevent breaking the UI
  }
};
