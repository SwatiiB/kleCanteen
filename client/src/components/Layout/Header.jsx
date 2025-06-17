import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../UI/Button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Function to check if a route is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Debug authentication state
  useEffect(() => {
    console.log('Header auth state:', { isAuthenticated, user });
  }, [isAuthenticated, user]);

  // Handle body overflow when logout modal is shown
  useEffect(() => {
    if (showLogoutConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showLogoutConfirm]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    // Ensure body overflow is reset when modal is closed
    document.body.style.overflow = 'auto';
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    // Ensure body overflow is reset when modal is closed
    document.body.style.overflow = 'auto';
    setShowLogoutConfirm(false);
  };

  return (
    <header className="bg-primary-200 shadow-soft sticky top-0 z-50 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" >
        <div className="flex justify-between h-18">
          {/* Logo and main navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary-600 flex items-center">
                <span className="text-primary-500">KLE</span>
                <span className="text-accent-500 ml-1">Canteen</span>
              </Link>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:ml-8 md:flex md:space-x-6">
              <Link
                to="/"
                className={`inline-flex items-center px-2 py-1 text-sm font-medium border-b-2 transition-colors ${
                  isActive('/')
                    ? 'text-primary-600 border-primary-500 font-semibold'
                    : 'text-neutral-600 border-transparent hover:border-primary-500 hover:text-primary-600'
                }`}
              >
                Home
              </Link>
              <Link
                to="/canteens"
                className={`inline-flex items-center px-2 py-1 text-sm font-medium border-b-2 transition-colors ${
                  isActive('/canteens')
                    ? 'text-primary-600 border-primary-500 font-semibold'
                    : 'text-neutral-600 border-transparent hover:border-primary-500 hover:text-primary-600'
                }`}
              >
                Canteens
              </Link>
              <Link
                to="/menu"
                className={`inline-flex items-center px-2 py-1 text-sm font-medium border-b-2 transition-colors ${
                  isActive('/menu')
                    ? 'text-primary-600 border-primary-500 font-semibold'
                    : 'text-neutral-600 border-transparent hover:border-primary-500 hover:text-primary-600'
                }`}
              >
                Menu
              </Link>
              <Link
                to="/about"
                className={`inline-flex items-center px-2 py-1 text-sm font-medium border-b-2 transition-colors ${
                  isActive('/about')
                    ? 'text-primary-600 border-primary-500 font-semibold'
                    : 'text-neutral-600 border-transparent hover:border-primary-500 hover:text-primary-600'
                }`}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`inline-flex items-center px-2 py-1 text-sm font-medium border-b-2 transition-colors ${
                  isActive('/contact')
                    ? 'text-primary-600 border-primary-500 font-semibold'
                    : 'text-neutral-600 border-transparent hover:border-primary-500 hover:text-primary-600'
                }`}
              >
                Contact
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/orders"
                    className={`inline-flex items-center px-2 py-1 text-sm font-medium border-b-2 transition-colors ${
                      isActive('/orders')
                        ? 'text-primary-600 border-primary-500 font-semibold'
                        : 'text-neutral-600 border-transparent hover:border-primary-500 hover:text-primary-600'
                    }`}
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/feedback"
                    className={`inline-flex items-center px-2 py-1 text-sm font-medium border-b-2 transition-colors ${
                      isActive('/feedback')
                        ? 'text-primary-600 border-primary-500 font-semibold'
                        : 'text-neutral-600 border-transparent hover:border-primary-500 hover:text-primary-600'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Feedback
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* User navigation */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/cart" className="p-2 rounded-full text-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-colors relative">
                  <ShoppingCart className="h-6 w-6" />
                  {/* Cart badge would go here */}
                </Link>
                <div className="relative ml-3">
                  <div className="flex">
                    <Link to="/profile" className="flex items-center space-x-2 text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors">
                      <div className="bg-primary-100 p-1.5 rounded-full">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <span>{user?.name || 'Profile'}</span>
                    </Link>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogoutClick}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-primary-500 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-xl overflow-hidden animate-fadeIn">
          <div className="pt-2 pb-3 space-y-0.5">
            <Link
              to="/"
              className={`block pl-4 pr-4 py-2.5 text-base font-medium border-l-4 transition-colors ${
                isActive('/')
                  ? 'text-primary-600 border-primary-500 bg-primary-50 font-semibold'
                  : 'text-neutral-600 border-transparent hover:bg-primary-50 hover:border-primary-400 hover:text-primary-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/canteens"
              className={`block pl-4 pr-4 py-2.5 text-base font-medium border-l-4 transition-colors ${
                isActive('/canteens')
                  ? 'text-primary-600 border-primary-500 bg-primary-50 font-semibold'
                  : 'text-neutral-600 border-transparent hover:bg-primary-50 hover:border-primary-400 hover:text-primary-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Canteens
            </Link>
            <Link
              to="/menu"
              className={`block pl-4 pr-4 py-2.5 text-base font-medium border-l-4 transition-colors ${
                isActive('/menu')
                  ? 'text-primary-600 border-primary-500 bg-primary-50 font-semibold'
                  : 'text-neutral-600 border-transparent hover:bg-primary-50 hover:border-primary-400 hover:text-primary-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Menu
            </Link>
            <Link
              to="/about"
              className={`block pl-4 pr-4 py-2.5 text-base font-medium border-l-4 transition-colors ${
                isActive('/about')
                  ? 'text-primary-600 border-primary-500 bg-primary-50 font-semibold'
                  : 'text-neutral-600 border-transparent hover:bg-primary-50 hover:border-primary-400 hover:text-primary-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`block pl-4 pr-4 py-2.5 text-base font-medium border-l-4 transition-colors ${
                isActive('/contact')
                  ? 'text-primary-600 border-primary-500 bg-primary-50 font-semibold'
                  : 'text-neutral-600 border-transparent hover:bg-primary-50 hover:border-primary-400 hover:text-primary-600'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/orders"
                  className={`block pl-4 pr-4 py-2.5 text-base font-medium border-l-4 transition-colors ${
                    isActive('/orders')
                      ? 'text-primary-600 border-primary-500 bg-primary-50 font-semibold'
                      : 'text-neutral-600 border-transparent hover:bg-primary-50 hover:border-primary-400 hover:text-primary-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Orders
                </Link>
                <Link
                  to="/feedback"
                  className={`block pl-4 pr-4 py-2.5 text-base font-medium border-l-4 transition-colors ${
                    isActive('/feedback')
                      ? 'text-primary-600 border-primary-500 bg-primary-50 font-semibold'
                      : 'text-neutral-600 border-transparent hover:bg-primary-50 hover:border-primary-400 hover:text-primary-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-primary-500" />
                    Feedback
                  </div>
                </Link>
              </>
            )}
          </div>

          <div className="pt-4 pb-3 border-t border-neutral-200 bg-neutral-50">
            {isAuthenticated ? (
              <div className="space-y-0.5">
                <Link
                  to="/profile"
                  className={`block pl-4 pr-4 py-2.5 text-base font-medium border-l-4 transition-colors ${
                    isActive('/profile')
                      ? 'text-primary-600 border-primary-500 bg-primary-50 font-semibold'
                      : 'text-neutral-600 border-transparent hover:bg-primary-50 hover:border-primary-400 hover:text-primary-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary-500" />
                    Profile
                  </div>
                </Link>
                <Link
                  to="/cart"
                  className={`block pl-4 pr-4 py-2.5 text-base font-medium border-l-4 transition-colors ${
                    isActive('/cart')
                      ? 'text-primary-600 border-primary-500 bg-primary-50 font-semibold'
                      : 'text-neutral-600 border-transparent hover:bg-primary-50 hover:border-primary-400 hover:text-primary-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2 text-primary-500" />
                    Cart
                  </div>
                </Link>
                <button
                  className="w-full text-left block pl-4 pr-4 py-2.5 text-base font-medium text-neutral-600 border-l-4 border-transparent hover:bg-primary-50 hover:border-primary-400 hover:text-primary-600 transition-colors"
                  onClick={() => {
                    handleLogoutClick();
                    setIsMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-4 py-3 space-y-3">
                <Link
                  to="/login"
                  className="block w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button variant="outline" fullWidth>Login</Button>
                </Link>
                <Link
                  to="/register"
                  className="block w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button fullWidth>Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-hover">
            <h3 className="text-xl font-semibold mb-4 text-neutral-800">Confirm Logout</h3>
            <p className="text-neutral-600 mb-6">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogoutCancel}
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={handleLogoutConfirm}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
