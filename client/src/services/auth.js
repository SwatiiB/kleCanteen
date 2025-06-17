import api from './api';

// User registration
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Registration failed' };
  }
};

// User login
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);

    // Store token and user data in localStorage
    if (response.data.token) {
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

// Reset password
export const resetPassword = async (resetData) => {
  try {
    const response = await api.post('/users/reset-password', resetData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Password reset failed' };
  }
};

// User logout
export const logoutUser = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
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

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('userToken');

  // Check if token exists and is not expired
  if (token && !isTokenExpired(token)) {
    return true;
  }

  // If token is expired, clean up localStorage
  if (token && isTokenExpired(token)) {
    console.log('Token expired, cleaning up localStorage');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
  }

  return false;
};

// Get current user data
export const getCurrentUser = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

// Update user data in localStorage
export const updateUserData = (userData) => {
  localStorage.setItem('userData', JSON.stringify(userData));
};
