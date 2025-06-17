import { createContext, useState, useEffect, useContext } from 'react';
import {
  isAuthenticated,
  isAdminAuthenticated,
  isCanteenStaffAuthenticated,
  getCurrentUser,
  getCurrentRole,
  loginAdmin,
  loginCanteenStaff,
  logoutAdmin,
  logoutCanteenStaff,
  getAdminProfile,
  getCanteenStaffProfile
} from '../services/auth';

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data on initial render
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        if (isAuthenticated()) {
          // Get user data from localStorage first for quick loading
          const userData = getCurrentUser();
          const userRole = getCurrentRole();

          // Set user data from localStorage immediately to maintain session
          setUser(userData);
          setRole(userRole);

          // Then fetch fresh data from API
          try {
            if (isAdminAuthenticated()) {
              const freshUserData = await getAdminProfile();
              if (freshUserData && freshUserData.admin) {
                setUser(freshUserData.admin);
              }
            } else if (isCanteenStaffAuthenticated()) {
              const freshUserData = await getCanteenStaffProfile();
              // Handle different response formats
              if (freshUserData) {
                const staffData = freshUserData.staff || freshUserData;
                if (staffData) {
                  // Ensure canteenId is a string by using canteenIdStr if available
                  if (staffData.canteenIdStr) {
                    staffData.canteenId = staffData.canteenIdStr;
                  } else if (staffData.canteenId && typeof staffData.canteenId === 'object') {
                    // If canteenId is an object, convert it to a string
                    staffData.canteenId = staffData.canteenId._id
                      ? staffData.canteenId._id.toString()
                      : staffData.canteenId.toString();
                  }
                  // Ensure the role is set correctly for canteen staff
                  staffData.role = 'canteen_staff';
                  console.log('Setting user with canteenId:', staffData.canteenId);
                  console.log('Setting user with role:', staffData.role);
                  setUser(staffData);
                }
              }
            }
          } catch (profileError) {
            console.error('Error fetching fresh user data:', profileError);
            // Important: Don't clear user data on API error
            // We'll continue using the localStorage data to maintain the session
          }
        } else {
          // No valid authentication found in localStorage
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error('Authentication initialization error:', err);
        // Don't clear user data for general errors in the initialization process
        // Only clear if isAuthenticated() returned false
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Admin login function
  const adminLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginAdmin(credentials);
      setUser(data.admin);
      setRole('admin');
      return data;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Canteen staff login function
  const canteenStaffLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginCanteenStaff(credentials);
      // Handle different response formats
      const staffData = data.staff || data;

      // Ensure canteenId is a string
      if (staffData.canteenId && typeof staffData.canteenId === 'object') {
        staffData.canteenId = staffData.canteenId._id
          ? staffData.canteenId._id.toString()
          : staffData.canteenId.toString();
      }

      // Ensure the role is set correctly for canteen staff
      staffData.role = 'canteen_staff';

      console.log('Login successful with canteenId:', staffData.canteenId);
      console.log('Login successful with role:', staffData.role);
      setUser(staffData);
      setRole('canteen_staff');
      return data;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    if (role === 'admin') {
      logoutAdmin();
    } else if (role === 'canteen_staff') {
      logoutCanteenStaff();
    }
    setUser(null);
    setRole(null);
  };

  // Update user data in context
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Check if user is admin
  const isAdmin = () => {
    return role === 'admin';
  };

  // Check if user is canteen staff
  const isCanteenStaff = () => {
    return role === 'canteen_staff';
  };



  // Context value
  const value = {
    user,
    role,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: role === 'admin',
    isCanteenStaff: role === 'canteen_staff',
    adminLogin,
    canteenStaffLogin,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
