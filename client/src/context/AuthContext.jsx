import { createContext, useState, useEffect, useContext } from 'react';
import { isAuthenticated, getCurrentUser, loginUser, logoutUser, registerUser } from '../services/auth';
import { getUserProfile } from '../services/user';

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user data on initial render
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // Check if user is authenticated by verifying token in localStorage
        if (isAuthenticated()) {
          console.log('User is authenticated, loading user data');
          // Get user data from localStorage first for quick loading
          const userData = getCurrentUser();
          setUser(userData);

          // Then fetch fresh data from API
          try {
            const freshUserData = await getUserProfile();
            if (freshUserData && freshUserData.user) {
              console.log('Fresh user data loaded:', freshUserData.user);
              setUser(freshUserData.user);
            }
          } catch (profileError) {
            console.error('Error fetching fresh user data:', profileError);
            // If API call fails, we still have localStorage data
          }
        } else {
          console.log('No valid authentication found');
          setUser(null);
        }
      } catch (err) {
        console.error('Authentication initialization error:', err);
        setError(err.message || 'Authentication failed');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(credentials);
      if (data && data.user) {
        console.log('Login successful, setting user:', data.user);
        setUser(data.user);
      } else {
        console.error('Login response missing user data');
      }
      return data;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await registerUser(userData);
      return data;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    logoutUser();
    setUser(null);
  };

  // Update user data in context
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Derive authentication state from both user object and token
  const authState = !!user && isAuthenticated();

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: authState,
    login,
    register,
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
