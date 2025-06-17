import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Coffee,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  ArrowRight,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Package,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/UI/Card';
import Loader from '../components/UI/Loader';
import { getAllUsers } from '../services/user';
import { getAllCanteens } from '../services/canteen';
import { getAllMenuItems, getMenuItemsByCanteen } from '../services/menu';
import { getAllOrders, getOrdersByCanteen } from '../services/order';
import { getAllExamDetails } from '../services/exam';
import { getAllFeedback } from '../services/feedback';

const Dashboard = () => {
  const { user, isAdmin, isCanteenStaff } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    canteens: 0,
    menuItems: 0,
    orders: 0,
    exams: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        if (isAdmin) {
          // Fetch admin dashboard data
          const [usersData, canteensData, menuItemsData, ordersData, examsData, feedbackData] = await Promise.all([
            getAllUsers(),
            getAllCanteens(),
            getAllMenuItems(),
            getAllOrders(),
            getAllExamDetails(),
            getAllFeedback(),
          ]);

          // Safely handle API responses that might not have the expected structure
          const usersCount = Array.isArray(usersData) ? usersData.length :
                            (usersData?.users && Array.isArray(usersData.users) ? usersData.users.length : 0);

          const canteensCount = Array.isArray(canteensData) ? canteensData.length :
                               (canteensData?.canteens && Array.isArray(canteensData.canteens) ? canteensData.canteens.length : 0);

          const menuItemsCount = Array.isArray(menuItemsData) ? menuItemsData.length :
                                (menuItemsData?.menuItems && Array.isArray(menuItemsData.menuItems) ? menuItemsData.menuItems.length : 0);

          const ordersCount = Array.isArray(ordersData) ? ordersData.length :
                             (ordersData?.orders && Array.isArray(ordersData.orders) ? ordersData.orders.length : 0);

          const examsCount = Array.isArray(examsData) ? examsData.length :
                            (examsData?.exams && Array.isArray(examsData.exams) ? examsData.exams.length : 0);

          setStats({
            users: usersCount,
            canteens: canteensCount,
            menuItems: menuItemsCount,
            orders: ordersCount,
            exams: examsCount,
          });

          // Process recent activities
          const activities = [];

          // Add recent orders
          if (Array.isArray(ordersData) && ordersData.length > 0) {
            // Sort orders by creation date (newest first)
            const recentOrders = [...ordersData].sort((a, b) =>
              new Date(b.createdAt) - new Date(a.createdAt)
            ).slice(0, 5); // Get 5 most recent orders

            recentOrders.forEach(order => {
              activities.push({
                type: 'order',
                id: order._id,
                orderId: order.orderId,
                email: order.email,
                status: order.status,
                date: order.createdAt,
                canteen: order.canteenId?.name || 'Unknown Canteen',
                totalAmount: order.totalAmount,
                priority: order.priority
              });
            });
          }

          // Add recent feedback if available
          if (feedbackData?.feedback && Array.isArray(feedbackData.feedback) && feedbackData.feedback.length > 0) {
            const recentFeedback = feedbackData.feedback
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 3); // Get 3 most recent feedback

            recentFeedback.forEach(feedback => {
              activities.push({
                type: 'feedback',
                id: feedback._id,
                email: feedback.email,
                rating: feedback.rating,
                date: feedback.createdAt,
                canteen: feedback.canteenId?.name || 'Unknown Canteen',
                isResolved: feedback.isResolved
              });
            });
          }

          // Sort all activities by date
          activities.sort((a, b) => new Date(b.date) - new Date(a.date));
          setRecentActivity(activities.slice(0, 5)); // Limit to 5 most recent activities

        } else if (isCanteenStaff) {
          // Fetch canteen staff dashboard data
          // For canteen staff, we only need canteen-specific data
          const canteenId = user?.canteenId;

          if (!canteenId) {
            throw new Error('Canteen ID not found for staff user');
          }

          const [menuItemsData, ordersData] = await Promise.all([
            getMenuItemsByCanteen(canteenId),
            getOrdersByCanteen(canteenId),
          ]);

          // Safely handle API responses
          const menuItemsCount = Array.isArray(menuItemsData) ? menuItemsData.length :
                                (menuItemsData?.menuItems && Array.isArray(menuItemsData.menuItems) ? menuItemsData.menuItems.length : 0);

          const ordersCount = Array.isArray(ordersData) ? ordersData.length :
                             (ordersData?.orders && Array.isArray(ordersData.orders) ? ordersData.orders.length : 0);

          setStats({
            users: 0, // Not relevant for canteen staff
            canteens: 1, // The canteen they manage
            menuItems: menuItemsCount,
            orders: ordersCount,
            exams: 0, // Not relevant for canteen staff
          });

          // Process recent activities for canteen staff
          if (Array.isArray(ordersData) && ordersData.length > 0) {
            // Sort orders by creation date (newest first)
            const recentOrders = [...ordersData].sort((a, b) =>
              new Date(b.createdAt) - new Date(a.createdAt)
            ).slice(0, 5); // Get 5 most recent orders

            const activities = recentOrders.map(order => ({
              type: 'order',
              id: order._id,
              orderId: order.orderId,
              email: order.email,
              status: order.status,
              date: order.createdAt,
              totalAmount: order.totalAmount,
              priority: order.priority
            }));

            setRecentActivity(activities);
          }
        }

        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin, isCanteenStaff, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-indigo-100 text-indigo-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Helper function to get activity icon
  const getActivityIcon = (activity) => {
    if (activity.type === 'order') {
      switch (activity.status) {
        case 'pending':
          return <Clock size={18} className="text-yellow-500" />;
        case 'confirmed':
        case 'preparing':
          return <Package size={18} className="text-blue-500" />;
        case 'ready':
        case 'delivered':
        case 'completed':
          return <CheckCircle size={18} className="text-green-500" />;
        case 'cancelled':
          return <AlertCircle size={18} className="text-red-500" />;
        default:
          return <Package size={18} className="text-gray-500" />;
      }
    } else if (activity.type === 'feedback') {
      return <User size={18} className="text-purple-500" />;
    }

    return <Clock size={18} className="text-gray-500" />;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user?.name || (isAdmin ? 'Admin' : 'Staff')}!
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isAdmin && (
          <Card className="p-6 bg-primary-50 border border-primary-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-200 text-primary-700 mr-4">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-primary-700">Total Users</p>
                <h3 className="text-2xl font-bold text-primary-800">{stats.users}</h3>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/users" className="text-primary-600 hover:text-primary-800 text-sm flex items-center">
                View all users
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </Card>
        )}

        <Card className="p-6 bg-secondary-50 border border-secondary-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-secondary-200 text-secondary-700 mr-4">
              <Coffee size={24} />
            </div>
            <div>
              <p className="text-sm text-secondary-700">
                {isAdmin ? 'Total Canteens' : 'Your Canteen'}
              </p>
              <h3 className="text-2xl font-bold text-secondary-800">{stats.canteens}</h3>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to={isAdmin ? "/canteens" : "/availability"}
              className="text-secondary-600 hover:text-secondary-800 text-sm flex items-center"
            >
              {isAdmin ? 'View all canteens' : 'Manage availability'}
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </Card>

        <Card className="p-6 bg-accent-50 border border-accent-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-accent-200 text-accent-700 mr-4">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm text-accent-700">Menu Items</p>
              <h3 className="text-2xl font-bold text-accent-800">{stats.menuItems}</h3>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to={isAdmin ? "/menu" : "/menu-management"}
              className="text-accent-600 hover:text-accent-800 text-sm flex items-center"
            >
              {isAdmin ? 'View all menu items' : 'Manage menu'}
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </Card>

        <Card className="p-6 bg-primary-50 border border-primary-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-200 text-primary-700 mr-4">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-sm text-primary-700">Orders</p>
              <h3 className="text-2xl font-bold text-primary-800">{stats.orders}</h3>
            </div>
          </div>
          <div className="mt-4">
            <Link to={isAdmin ? "/orders" : "/staff-orders"} className="text-primary-600 hover:text-primary-800 text-sm flex items-center">
              View all orders
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </Card>

        {isAdmin && (
          <Card className="p-6 bg-secondary-50 border border-secondary-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-secondary-200 text-secondary-700 mr-4">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm text-secondary-700">Exams</p>
                <h3 className="text-2xl font-bold text-secondary-800">{stats.exams}</h3>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/exams" className="text-secondary-600 hover:text-secondary-800 text-sm flex items-center">
                View all exams
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </Card>
        )}
      </div>

      {/* Recent activity section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <div className="p-4 border-b">
            <p className="text-gray-600">
              {isAdmin
                ? 'Recent system activity across all canteens.'
                : 'Recent activity for your canteen.'}
            </p>
          </div>

          {recentActivity.length > 0 ? (
            <div className="divide-y">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      {getActivityIcon(activity)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          {activity.type === 'order' ? (
                            <Link
                              to={`/orders/${activity.id}`}
                              className="font-medium text-blue-600 hover:text-blue-800"
                            >
                              Order #{activity.orderId}
                            </Link>
                          ) : (
                            <Link
                              to={`/feedback`}
                              className="font-medium text-purple-600 hover:text-purple-800"
                            >
                              New Feedback
                            </Link>
                          )}
                          <p className="text-sm text-gray-600">
                            {activity.type === 'order' ? (
                              <>
                                <span className="font-medium">{activity.email}</span> placed an order
                                {activity.canteen && isAdmin ? ` at ${activity.canteen}` : ''}
                                {activity.priority && <span className="ml-2 text-xs font-medium text-red-600">PRIORITY</span>}
                              </>
                            ) : (
                              <>
                                <span className="font-medium">{activity.email}</span> submitted feedback
                                {activity.canteen && isAdmin ? ` for ${activity.canteen}` : ''}
                                {activity.rating && (
                                  <span className="ml-2 text-xs font-medium">
                                    Rating: {activity.rating}/5
                                  </span>
                                )}
                              </>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                          {activity.type === 'order' && (
                            <div className="mt-1">{getStatusBadge(activity.status)}</div>
                          )}
                          {activity.type === 'feedback' && (
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.isResolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {activity.isResolved ? 'Resolved' : 'Pending'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {activity.type === 'order' && (
                        <p className="text-sm mt-1">
                          <span className="font-medium">₹{activity.totalAmount.toFixed(2)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No recent activity to display.
            </div>
          )}

          <div className="p-4 border-t bg-gray-50">
            <Link
              to={isAdmin ? "/orders" : "/staff-orders"}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center justify-center"
            >
              View all orders
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isAdmin ? (
            <>
              <Card className="p-6 hover:shadow-md transition-shadow bg-primary-50 border border-primary-200">
                <h3 className="font-semibold mb-2 text-primary-800">Add New Canteen</h3>
                <p className="text-primary-700 text-sm mb-4">Create a new canteen in the system.</p>
                <Link to="/canteens/add" className="text-primary-600 hover:text-primary-800 text-sm flex items-center">
                  Add Canteen
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </Card>

              <Card className="p-6 hover:shadow-md transition-shadow bg-secondary-50 border border-secondary-200">
                <h3 className="font-semibold mb-2 text-secondary-800">Add Canteen Staff</h3>
                <p className="text-secondary-700 text-sm mb-4">Register new canteen staff members.</p>
                <Link to="/staff/add" className="text-secondary-600 hover:text-secondary-800 text-sm flex items-center">
                  Add Staff
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </Card>

              <Card className="p-6 hover:shadow-md transition-shadow bg-accent-50 border border-accent-200">
                <h3 className="font-semibold mb-2 text-accent-800">Add Menu Item</h3>
                <p className="text-accent-700 text-sm mb-4">Create new menu items for canteens.</p>
                <Link to="/menu/add" className="text-accent-600 hover:text-accent-800 text-sm flex items-center">
                  Add Menu Item
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </Card>

              <Card className="p-6 hover:shadow-md transition-shadow bg-secondary-50 border border-secondary-200">
                <h3 className="font-semibold mb-2 text-secondary-800">Manage Exams</h3>
                <p className="text-secondary-700 text-sm mb-4">View and manage student exam details.</p>
                <Link to="/exams" className="text-secondary-600 hover:text-secondary-800 text-sm flex items-center">
                  View Exams
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </Card>
            </>
          ) : (
            <>
              <Card className="p-6 hover:shadow-md transition-shadow bg-accent-50 border border-accent-200">
                <h3 className="font-semibold mb-2 text-accent-800">Manage Menu</h3>
                <p className="text-accent-700 text-sm mb-4">Update menu items and availability.</p>
                <Link to="/menu-management" className="text-accent-600 hover:text-accent-800 text-sm flex items-center">
                  Manage Menu
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </Card>

              <Card className="p-6 hover:shadow-md transition-shadow bg-primary-50 border border-primary-200">
                <h3 className="font-semibold mb-2 text-primary-800">Process Orders</h3>
                <p className="text-primary-700 text-sm mb-4">View and update order statuses.</p>
                <Link to="/staff-orders" className="text-primary-600 hover:text-primary-800 text-sm flex items-center">
                  Process Orders
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </Card>

              <Card className="p-6 hover:shadow-md transition-shadow bg-secondary-50 border border-secondary-200">
                <h3 className="font-semibold mb-2 text-secondary-800">Update Availability</h3>
                <p className="text-secondary-700 text-sm mb-4">Set your canteen's availability status.</p>
                <Link to="/availability" className="text-secondary-600 hover:text-secondary-800 text-sm flex items-center">
                  Update Status
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
