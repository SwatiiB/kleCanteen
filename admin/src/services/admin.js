import api from './api';
import { updateAdminData } from './auth';

// Get admin profile
export const getAdminProfile = async () => {
  try {
    const response = await api.get('/admin/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch admin profile' };
  }
};

// Update admin profile
export const updateAdminProfile = async (adminData) => {
  try {
    const response = await api.put('/admin/profile', adminData);
    
    // Update admin data in localStorage
    if (response.data.admin) {
      updateAdminData(response.data.admin);
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update admin profile' };
  }
};
