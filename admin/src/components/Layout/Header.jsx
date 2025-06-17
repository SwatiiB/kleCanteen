import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout, isAdmin, isCanteenStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Function to get the current page title based on the path
  const getCurrentPageTitle = () => {
    const path = location.pathname;

    // Base title
    const baseTitle = isAdmin ? 'KLE Canteen Admin' : 'Canteen Staff Portal';

    // If we're on the dashboard, just return the base title
    if (path === '/dashboard' || path === '/') {
      return baseTitle;
    }

    // Map paths to titles
    const pathTitles = {
      '/users': 'Users',
      '/canteens': 'Canteens',
      '/canteens/add': 'Add Canteen',
      '/staff': 'Staff Management',
      '/staff/add': 'Add Staff',
      '/menu': 'Menu Items',
      '/menu/add': 'Add Menu Item',
      '/exams': 'Exam Management',
      '/exams/add': 'Add Exam',
      '/feedback': 'Feedback',
      '/orders': 'Orders',
      '/payments': 'Payments',
      '/menu-management': 'Menu Management',
      '/menu-item/add': 'Add Menu Item',
      '/staff-orders': 'Orders',
      '/availability': 'Canteen Availability',
      '/staff-feedback': 'Feedback Management',
      '/profile': 'Profile',
    };

    // Check for edit paths
    if (path.includes('/edit/')) {
      if (path.includes('/canteens/edit/')) return 'Edit Canteen';
      if (path.includes('/menu/edit/')) return 'Edit Menu Item';
      if (path.includes('/staff/edit/')) return 'Edit Staff';
      if (path.includes('/exams/edit/')) return 'Edit Exam';
      if (path.includes('/menu-item/edit/')) return 'Edit Menu Item';
    }

    // Find the matching path
    for (const [pathPrefix, title] of Object.entries(pathTitles)) {
      if (path.startsWith(pathPrefix)) {
        return `${baseTitle} - ${title}`;
      }
    }

    // Default to base title if no match
    return baseTitle;
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-primary-800 border-b border-primary-700 h-16">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left side - Title */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-white">
            {getCurrentPageTitle()}
          </h1>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center space-x-4">

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={toggleProfileMenu}
              className="flex items-center space-x-2 p-1 rounded-full text-white hover:text-gray-900 hover:bg-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User size={18} />
              </div>
              <span className="hidden md:inline-block font-medium">
                {user?.name || (isAdmin ? 'Admin' : 'Staff')}
              </span>
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/profile');
                  }}
                >
                  <User size={16} className="mr-2" />
                  Profile
                </a>

                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
