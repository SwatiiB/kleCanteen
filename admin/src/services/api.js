import axios from 'axios';

// Create axios instance with base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    const staffToken = localStorage.getItem('canteenStaffToken');

    // Use admin token if available and not expired, otherwise use staff token
    let token = null;

    if (adminToken && !isTokenExpired(adminToken)) {
      token = adminToken;
    } else if (staffToken && !isTokenExpired(staffToken)) {
      token = staffToken;
    } else if (adminToken || staffToken) {
      // If we have tokens but they're expired, clear them
      // This prevents sending expired tokens with requests
      if (adminToken && isTokenExpired(adminToken)) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
      }

      if (staffToken && isTokenExpired(staffToken)) {
        localStorage.removeItem('canteenStaffToken');
        localStorage.removeItem('canteenStaffData');
      }

      // Only clear userRole if both tokens are expired
      if ((adminToken && isTokenExpired(adminToken)) &&
          (staffToken && isTokenExpired(staffToken))) {
        localStorage.removeItem('userRole');
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      const isLoginPage = currentPath === '/login';
      const isApiProfileCall = error.config && (
        error.config.url.includes('/admin/profile') ||
        error.config.url.includes('/canteen-staff/profile')
      );

      // If it's a profile API call and we're not on the login page,
      // don't clear tokens or redirect - this allows the app to continue
      // using localStorage data even if the API call fails
      if (isApiProfileCall && !isLoginPage) {
        console.warn('Profile API call failed with 401, but keeping session active');
        return Promise.reject(error);
      }

      // For other 401 errors, clear auth data and redirect to login
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      localStorage.removeItem('canteenStaffToken');
      localStorage.removeItem('canteenStaffData');
      localStorage.removeItem('userRole');

      // Redirect to login if not already there
      if (!isLoginPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
