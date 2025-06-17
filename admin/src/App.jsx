import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Loader from './components/UI/Loader';

// Lazy load admin pages
const UserList = lazy(() => import('./pages/Users/UserList'));
const CanteenList = lazy(() => import('./pages/Canteens/CanteenList'));
const CanteenForm = lazy(() => import('./pages/Canteens/CanteenForm'));
const MenuList = lazy(() => import('./pages/Menu/MenuList'));
const MenuForm = lazy(() => import('./pages/Menu/MenuForm'));
const StaffList = lazy(() => import('./pages/CanteenStaff/StaffList'));
const StaffForm = lazy(() => import('./pages/CanteenStaff/StaffForm'));
const ExamList = lazy(() => import('./pages/Exams/ExamList'));
const ExamForm = lazy(() => import('./pages/Exams/ExamForm'));
const AdminFeedbackManagement = lazy(() => import('./pages/Feedback/FeedbackManagement'));
const AdminOrderManagement = lazy(() => import('./pages/Orders/AdminOrderManagement'));
const PaymentManagement = lazy(() => import('./pages/Payments/PaymentManagement'));

// Lazy load canteen staff pages
const MenuManagement = lazy(() => import('./pages/CanteenStaff/MenuManagement'));
const MenuItemForm = lazy(() => import('./pages/CanteenStaff/MenuItemForm'));
const OrderManagement = lazy(() => import('./pages/CanteenStaff/OrderManagement'));
const CanteenAvailability = lazy(() => import('./pages/CanteenStaff/CanteenAvailability'));
const FeedbackManagement = lazy(() => import('./pages/CanteenStaff/FeedbackManagement'));
const StaffProfile = lazy(() => import('./pages/CanteenStaff/Profile'));

// Protected route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Use role from user object as fallback if context role is not set
  const effectiveRole = role || user?.role;

  const isRoleAllowed = allowedRoles.length === 0 || allowedRoles.includes(effectiveRole);

  // If no specific roles are required or user's role is allowed
  if (isRoleAllowed) {
    return children;
  }

  // If user's role is not allowed, redirect to dashboard
  return <Navigate to="/dashboard" />;
};

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Admin-specific routes */}
        <Route path="users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <UserList />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="canteens" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <CanteenList />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="canteens/add" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <CanteenForm />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="canteens/edit/:id" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <CanteenForm />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="menu" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <MenuList />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="menu/add" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <MenuForm />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="menu/edit/:id" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <MenuForm />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="staff" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <StaffList />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="staff/add" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <StaffForm />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="staff/edit/:id" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <StaffForm />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="exams" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <ExamList />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="exams/add" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <ExamForm />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="exams/edit/:id" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <ExamForm />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="feedback" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <AdminFeedbackManagement />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="orders" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <AdminOrderManagement />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="payments" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <PaymentManagement />
            </Suspense>
          </ProtectedRoute>
        } />

        {/* Canteen staff-specific routes */}
        <Route path="menu-management" element={
          <ProtectedRoute allowedRoles={['canteen_staff']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <MenuManagement />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="menu-item/add" element={
          <ProtectedRoute allowedRoles={['canteen_staff']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <MenuItemForm />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="menu-item/edit/:id" element={
          <ProtectedRoute allowedRoles={['canteen_staff']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <MenuItemForm />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="staff-orders" element={
          <ProtectedRoute allowedRoles={['canteen_staff']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <OrderManagement />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="availability" element={
          <ProtectedRoute allowedRoles={['canteen_staff']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <CanteenAvailability />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="staff-feedback" element={
          <ProtectedRoute allowedRoles={['canteen_staff']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <FeedbackManagement />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="profile" element={
          <ProtectedRoute allowedRoles={['canteen_staff']}>
            <Suspense fallback={<Loader size="lg" className="mx-auto mt-12" />}>
              <StaffProfile />
            </Suspense>
          </ProtectedRoute>
        } />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}