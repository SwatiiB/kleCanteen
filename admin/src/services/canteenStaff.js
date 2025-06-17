import api from './api';
import { updateCanteenStaffData } from './auth';

// Register canteen staff (admin only)
export const registerCanteenStaff = async (staffData) => {
  try {
    const response = await api.post('/canteen-staff/register', staffData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to register canteen staff' };
  }
};

// Get all canteen staff (admin only)
export const getAllCanteenStaff = async () => {
  try {
    const response = await api.get('/canteen-staff');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch canteen staff' };
  }
};

// Get canteen staff by ID (admin only)
export const getCanteenStaffById = async (staffId) => {
  try {
    // Since there's no direct endpoint, we'll get all staff and filter
    const response = await getAllCanteenStaff();
    const staffList = Array.isArray(response) ? response :
                     (response.staff ? response.staff : []);

    const staff = staffList.find(s => s._id === staffId);

    if (!staff) {
      throw { message: 'Canteen staff not found' };
    }

    return staff;
  } catch (error) {
    throw error.response?.data || error || { message: 'Failed to fetch canteen staff details' };
  }
};

// Get canteen staff profile
export const getCanteenStaffProfile = async () => {
  try {
    const response = await api.get('/canteen-staff/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch canteen staff profile' };
  }
};

// Update canteen staff profile
export const updateCanteenStaffProfile = async (staffData) => {
  try {
    const response = await api.put('/canteen-staff/profile', staffData);

    // Update canteen staff data in localStorage
    if (response.data.staff) {
      updateCanteenStaffData(response.data.staff);
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update canteen staff profile' };
  }
};

// Update canteen staff by ID (admin only)
export const updateCanteenStaffById = async (staffId, staffData) => {
  try {
    // Since there's no direct endpoint for admin to update staff,
    // we'll implement a workaround by registering a new staff with the same ID
    // This is a temporary solution until a proper backend endpoint is created
    const response = await api.post('/canteen-staff/register', {
      ...staffData,
      _id: staffId, // Include the ID to indicate this is an update
      isUpdate: true // Flag to indicate this is an update operation
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update canteen staff' };
  }
};

// Delete canteen staff by ID (admin only)
export const deleteCanteenStaff = async (staffId) => {
  try {
    const response = await api.delete(`/canteen-staff/${staffId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete canteen staff' };
  }
};
