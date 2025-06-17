import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Coffee,
  ChefHat,
  ShoppingBag,
  CreditCard,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { isAdmin, isCanteenStaff, role } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  // Auto-expand menus based on current path
  useEffect(() => {
    // Only update if we're on a page that should trigger menu expansion
    if (location.pathname.startsWith('/staff') ||
        location.pathname.startsWith('/canteens') ||
        location.pathname.startsWith('/menu') ||
        location.pathname.startsWith('/menu-item') ||
        location.pathname.startsWith('/exams')) {

      setExpandedMenus(prev => {
        const newExpandedMenus = { ...prev };

        // Auto-expand Canteen Staff menu if on a staff page
        if (location.pathname.startsWith('/staff')) {
          newExpandedMenus['Canteen Staff'] = true;
        }

        // Auto-expand Canteens menu if on a canteens page
        if (location.pathname.startsWith('/canteens')) {
          newExpandedMenus['Canteens'] = true;
        }

        // Auto-expand Menu Items menu if on a menu page
        if (location.pathname.startsWith('/menu')) {
          newExpandedMenus['Menu Items'] = true;
        }

        // Auto-expand Menu Management menu if on a menu-item page
        if (location.pathname.startsWith('/menu-item') || location.pathname.startsWith('/menu-management')) {
          newExpandedMenus['Menu Management'] = true;
        }

        // Auto-expand Exams menu if on an exams page
        if (location.pathname.startsWith('/exams')) {
          newExpandedMenus['Exams'] = true;
        }

        return newExpandedMenus;
      });
    }
  }, [location.pathname]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Toggle submenu
  const toggleSubmenu = (key) => {
    setExpandedMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Check if a route is active
  const isRouteActive = (path) => {
    return location.pathname.startsWith(path);
  };

  // Admin menu items
  const adminMenuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      title: 'Users',
      path: '/users',
      icon: <Users size={20} />,
    },
    {
      title: 'Canteens',
      path: '/canteens',
      icon: <Coffee size={20} />,
      submenu: [
        { title: 'All Canteens', path: '/canteens' },
        { title: 'Add Canteen', path: '/canteens/add' },
      ],
    },
    {
      title: 'Canteen Staff',
      path: '/staff',
      icon: <ChefHat size={20} />,
      submenu: [
        { title: 'All Staff', path: '/staff' },
        { title: 'Add Staff', path: '/staff/add' },
      ],
    },
    {
      title: 'Menu Items',
      path: '/menu',
      icon: <ShoppingBag size={20} />,
      submenu: [
        { title: 'All Menu Items', path: '/menu' },
        { title: 'Add Menu Item', path: '/menu/add' },
      ],
    },
    {
      title: 'Orders',
      path: '/orders',
      icon: <ShoppingBag size={20} />,
    },
    {
      title: 'Payments',
      path: '/payments',
      icon: <CreditCard size={20} />,
    },
    {
      title: 'Exams',
      path: '/exams',
      icon: <FileText size={20} />,
      submenu: [
        { title: 'All Exams', path: '/exams' },
        { title: 'Add Exam', path: '/exams/add' },
      ],
    },
    {
      title: 'Feedback',
      path: '/feedback',
      icon: <MessageSquare size={20} />,
    },
  ];

  // Canteen staff menu items
  const canteenStaffMenuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      title: 'Menu Management',
      path: '/menu-management',
      icon: <ShoppingBag size={20} />,
      submenu: [
        { title: 'All Menu Items', path: '/menu-management' },
        { title: 'Add Menu Item', path: '/menu-item/add' },
      ],
    },
    {
      title: 'Orders',
      path: '/staff-orders',
      icon: <ShoppingBag size={20} />,
    },
    {
      title: 'Canteen Availability',
      path: '/availability',
      icon: <Coffee size={20} />,
    },
    {
      title: 'Canteen Feedback',
      path: '/staff-feedback',
      icon: <MessageSquare size={20} />,
    },
    {
      title: 'Profile',
      path: '/profile',
      icon: <Users size={20} />,
    },
  ];

  // Select menu items based on role

  // Ensure we're using the correct menu items based on role
  const menuItems = role === 'admin' ? adminMenuItems : canteenStaffMenuItems;

  // Render menu item
  const renderMenuItem = (item, index) => {
    const isActive = isRouteActive(item.path);
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedMenus[item.title];

    // Define new styles for menu items
    const baseMenuItemClasses = "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors";
    const activeMenuItemClasses = "bg-primary-700 text-white";
    const inactiveMenuItemClasses = "text-primary-200 hover:bg-primary-800 hover:text-white";

    return (
      <div key={index} className="mb-1">
        {hasSubmenu ? (
          <>
            <button
              onClick={() => toggleSubmenu(item.title)}
              className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-md ${
                isActive ? 'bg-primary-700 text-white' : 'text-primary-200 hover:bg-primary-800 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <span className="mr-3">{item.icon}</span>
                <span>{item.title}</span>
              </div>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {isExpanded && (
              <div className="ml-6 mt-1 space-y-1">
                {item.submenu.map((subItem, subIndex) => (
                  <NavLink
                    key={subIndex}
                    to={subItem.path}
                    className={({ isActive }) =>
                      `block px-4 py-2 text-sm rounded-md ${
                        isActive ? 'bg-primary-700 text-white' : 'text-primary-300 hover:bg-primary-800 hover:text-white'
                      }`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {subItem.title}
                  </NavLink>
                ))}
              </div>
            )}
          </>
        ) : (
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm rounded-md ${
                isActive ? 'bg-primary-700 text-white' : 'text-primary-200 hover:bg-primary-800 hover:text-white'
              }`
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="mr-3">{item.icon}</span>
            <span>{item.title}</span>
          </NavLink>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-20">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar for mobile */}
      <div
        className={`lg:hidden fixed inset-0 z-10 bg-gray-600 bg-opacity-75 transition-opacity ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMobileMenu}
      ></div>

      <aside
        className={`fixed top-0 left-0 z-10 h-full w-64 bg-primary-900 border-r border-primary-800 transition-transform transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:static lg:translate-x-0`}
      >
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-center border-b border-primary-800">
          <h1 className="text-xl font-bold text-primary-100">
            {role === 'admin' ? 'Admin Panel' : 'Canteen Staff'}
          </h1>
        </div>

        {/* Sidebar content */}
        <nav className="mt-4 px-2 space-y-1">
          {menuItems.map(renderMenuItem)}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
