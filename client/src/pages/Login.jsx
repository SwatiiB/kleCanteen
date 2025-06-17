import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import Loader from '../components/UI/Loader';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const { login, loading, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  // Check for cart redirect in session storage
  useEffect(() => {
    // If already authenticated, process any pending cart redirects
    if (isAuthenticated) {
      const cartRedirect = sessionStorage.getItem('cartRedirect');
      if (cartRedirect) {
        try {
          const { path, itemToAdd } = JSON.parse(cartRedirect);
          // Clear the redirect data
          sessionStorage.removeItem('cartRedirect');

          // Add the item to cart and navigate back
          if (itemToAdd) {
            addToCart(itemToAdd);
            navigate(path);
          }
        } catch (error) {
          console.error('Error processing cart redirect:', error);
          sessionStorage.removeItem('cartRedirect');
        }
      }
    }
  }, [isAuthenticated, addToCart, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      toast.success('Login successful!');

      // Check if there's a cart redirect in session storage
      const cartRedirect = sessionStorage.getItem('cartRedirect');
      if (cartRedirect) {
        try {
          const { path, itemToAdd } = JSON.parse(cartRedirect);
          // Clear the redirect data
          sessionStorage.removeItem('cartRedirect');

          // Add the item to cart and navigate back
          if (itemToAdd) {
            addToCart(itemToAdd);
            navigate(path);
            return;
          }
        } catch (error) {
          console.error('Error processing cart redirect:', error);
          sessionStorage.removeItem('cartRedirect');
        }
      }

      // If no cart redirect, use the default redirect
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Login failed. Please try again.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Login to Your Account</h1>
          <p className="text-gray-600 mt-2">
            Enter your credentials to access your account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              error={errors.email}
              required
            />

            <Input
              label="Password"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              error={errors.password}
              required
            />

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              disabled={loading}
            >
              {loading ? <Loader size="sm" className="mr-2" /> : null}
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
              Register here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
