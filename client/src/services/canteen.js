import api from './api';

// Get all canteens
export const getAllCanteens = async () => {
  try {
    const response = await api.get('/canteens');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch canteens' };
  }
};

// Get canteen by ID
export const getCanteenById = async (canteenId) => {
  try {
    const response = await api.get(`/canteens/${canteenId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch canteen details' };
  }
};
