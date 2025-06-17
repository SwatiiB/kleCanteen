import api from './api';
import { getAdminProfile as fetchAdminProfile } from './admin';
import { getCanteenStaffProfile as fetchCanteenStaffProfile } from './canteenStaff';

// Admin login
export const loginAdmin = async (credentials) => {
  try {
    const response = await api.post('/admin/login', credentials);

    // Store token and admin data in localStorage
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminData', JSON.stringify(response.data.admin));
      localStorage.setItem('userRole', 'admin');
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

// Canteen staff login
export const loginCanteenStaff = async (credentials) => {
  try {
    const response = await api.post('/canteen-staff/login', credentials);

    // Store token and staff data in localStorage
    if (response.data.token) {
      localStorage.setItem('canteenStaffToken', response.data.token);

      // Handle different response formats
      const staffData = response.data.staff || response.data;

      // Ensure canteenId is a string before storing in localStorage
      if (staffData.canteenId && typeof staffData.canteenId === 'object') {
        staffData.canteenId = staffData.canteenId._id
          ? staffData.canteenId._id.toString()
          : staffData.canteenId.toString();
      }

      // Ensure the role is set correctly for canteen staff
      staffData.role = 'canteen_staff';

      console.log('Storing staff data with canteenId:', staffData.canteenId);
      console.log('Storing staff data with role:', staffData.role);
      localStorage.setItem('canteenStaffData', JSON.stringify(staffData));
      localStorage.setItem('userRole', 'canteen_staff');
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

// Admin logout
export const logoutAdmin = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminData');
  localStorage.removeItem('userRole');
};

// Canteen staff logout
export const logoutCanteenStaff = () => {
  localStorage.removeItem('canteenStaffToken');
  localStorage.removeItem('canteenStaffData');
  localStorage.removeItem('userRole');
};

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    // JWT tokens are in format: header.payload.signature
    const payload = token.split('.')[1];
    // Decode the base64 payload
    const decodedPayload = JSON.parse(atob(payload));
    // Check if token is expired
    return decodedPayload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if we can't decode
  }
};

// Check if admin is authenticated
export const isAdminAuthenticated = () => {
  const token = localStorage.getItem('adminToken');
  const role = localStorage.getItem('userRole');

  // Check if token exists, role is admin, and token is not expired
  if (token && role === 'admin' && !isTokenExpired(token)) {
    return true;
  }

  // If token is expired, clean up localStorage
  if (token && isTokenExpired(token)) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    // Only remove userRole if there's no valid canteen staff token
    const canteenStaffToken = localStorage.getItem('canteenStaffToken');
    if (!canteenStaffToken || isTokenExpired(canteenStaffToken)) {
      localStorage.removeItem('userRole');
    }
  }

  return false;
};

// Check if canteen staff is authenticated
export const isCanteenStaffAuthenticated = () => {
  const token = localStorage.getItem('canteenStaffToken');
  const role = localStorage.getItem('userRole');

  // Check if token exists, role is canteen_staff, and token is not expired
  if (token && role === 'canteen_staff' && !isTokenExpired(token)) {
    return true;
  }

  // If token is expired, clean up localStorage
  if (token && isTokenExpired(token)) {
    localStorage.removeItem('canteenStaffToken');
    localStorage.removeItem('canteenStaffData');
    // Only remove userRole if there's no valid admin token
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken || isTokenExpired(adminToken)) {
      localStorage.removeItem('userRole');
    }
  }

  return false;
};

// Check if any admin user is authenticated (admin or canteen staff)
export const isAuthenticated = () => {
  return isAdminAuthenticated() || isCanteenStaffAuthenticated();
};

// Get current admin data
export const getCurrentAdmin = () => {
  const adminData = localStorage.getItem('adminData');
  return adminData ? JSON.parse(adminData) : null;
};

// Get current canteen staff data
export const getCurrentCanteenStaff = () => {
  const staffData = localStorage.getItem('canteenStaffData');
  if (!staffData) return null;

  const parsedData = JSON.parse(staffData);

  // Ensure canteenId is a string
  if (parsedData.canteenId && typeof parsedData.canteenId === 'object') {
    parsedData.canteenId = parsedData.canteenId._id
      ? parsedData.canteenId._id.toString()
      : parsedData.canteenId.toString();
  }

  // Ensure the role is set correctly for canteen staff
  parsedData.role = 'canteen_staff';

  return parsedData;
};

// Get current user data (admin or canteen staff)
export const getCurrentUser = () => {
  const role = localStorage.getItem('userRole');

  if (role === 'admin') {
    return getCurrentAdmin();
  } else if (role === 'canteen_staff') {
    return getCurrentCanteenStaff();
  }

  return null;
};

// Get current user role
export const getCurrentRole = () => {
  return localStorage.getItem('userRole');
};

// Update admin data in localStorage
export const updateAdminData = (adminData) => {
  localStorage.setItem('adminData', JSON.stringify(adminData));
};

// Update canteen staff data in localStorage
export const updateCanteenStaffData = (staffData) => {
  localStorage.setItem('canteenStaffData', JSON.stringify(staffData));
};

// Re-export getAdminProfile from admin.js
export const getAdminProfile = async () => {
  return await fetchAdminProfile();
};

// Re-export getCanteenStaffProfile from canteenStaff.js
export const getCanteenStaffProfile = async () => {
  return await fetchCanteenStaffProfile();
};
