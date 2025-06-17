import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/user';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Button from '../components/UI/Button';
import Loader from '../components/UI/Loader';

const Profile = () => {
  // Department options
  const departmentOptions = [
    { value: '', label: 'Select your department' },
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
    { value: 'Civil Engineering', label: 'Civil Engineering' },
    { value: 'Electronics & Communication', label: 'Electronics & Communication' },
    { value: 'Electrical & Electronics Engineering', label: 'Electrical & Electronics Engineering' },
    { value: 'Department of Automation & Robotics', label: 'Department of Automation & Robotics' },
    { value: 'Department of Biotechnology', label: 'Department of Biotechnology' },
    { value: 'Architecture', label: 'Architecture' },
    { value: 'Department of Computer Application', label: 'Department of Computer Application' },
    { value: 'Department of Commerce', label: 'Department of Commerce' },
    { value: 'Management Studies and Research', label: 'Management Studies and Research' },
    { value: 'Fashion Design', label: 'Fashion Design' },
    { value: 'MBA', label: 'MBA' },
    { value: 'MCA', label: 'MCA' },
  ];

  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    uniId: '',
    department: '',
    semester: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      // First try to use the user data from context if available
      if (user) {
        console.log('Using user data from context:', user);
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phoneNo || '',
          uniId: user.uniId || '',
          department: user.department || '',
          semester: user.semester || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }

      // Then fetch fresh data from API
      const response = await getUserProfile();
      console.log('Profile API response:', response);

      // Handle different response formats
      const userData = response.user || response;

      if (userData) {
        console.log('Setting form data with user data:', userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phoneNo || '',
          uniId: userData.uniId || '',
          department: userData.department || '',
          semester: userData.semester || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        // Update user in context with fresh data
        updateUser(userData);
      } else {
        throw new Error('User data not found in API response');
      }
    } catch (err) {
      toast.error('Failed to load profile data. Please try again.');
      console.error('Error fetching profile data:', err);

      // If API call fails but we have user data in context, use that
      if (user && !formData.name) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phoneNo || '',
          uniId: user.uniId || '',
          department: user.department || '',
          semester: user.semester || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        // We have fallback data, so don't show error state
      } else {
        // No fallback data available, show error state
        setLoadError(true);
      }
    } finally {
      setLoading(false);
    }
  };

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

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    // Validate uniId
    if (!formData.uniId) {
      newErrors.uniId = 'University ID is required';
    }

    // Validate semester if user is a student
    if (user && user.role === 'student' && formData.semester) {
      // Check if semester is a valid number or a valid semester format (e.g., "1st", "2nd", etc.)
      if (!/^[1-8](st|nd|rd|th)?$/.test(formData.semester) && !/^[1-8]$/.test(formData.semester)) {
        newErrors.semester = 'Please enter a valid semester (1-8)';
      }
    }

    // Password validation only if user is trying to change password
    if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }

      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your new password';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
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
      setUpdating(true);

      // Prepare data for update
      const updateData = {
        name: formData.name,
        phoneNo: formData.phone,
        department: formData.department,
      };

      // Add semester field if user is a student
      if (user && user.role === 'student' && formData.semester) {
        updateData.semester = formData.semester;
      }

      // Add password fields only if user is trying to change password
      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await updateUserProfile(updateData);

      // Update user in context
      updateUser(response.user);

      // Reset password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
    } finally {
      setUpdating(false);
    }
  };

  const [loadError, setLoadError] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <p className="text-red-500 mb-4">Failed to load profile data.</p>
        <Button
          onClick={() => {
            setLoadError(false);
            fetchUserProfile();
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">
          Manage your account information
        </p>
      </div>

      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">User Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Full Name</p>
            <p className="mt-1 text-base">{formData.name}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="mt-1 text-base">{formData.email}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Phone Number</p>
            <p className="mt-1 text-base">{formData.phone}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">University ID</p>
            <p className="mt-1 text-base">{formData.uniId}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Department</p>
            <p className="mt-1 text-base">{formData.department}</p>
          </div>


        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />

              <Input
                label="Email"
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
              />

              <Input
                label="University ID"
                type="text"
                id="uniId"
                name="uniId"
                value={formData.uniId}
                disabled
                error={errors.uniId}
                required
              />

              <Select
                label="Department"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                options={departmentOptions}
                error={errors.department}
                required
              />

              {user && user.role === 'student' && (
                <Input
                  label="Semester"
                  type="text"
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  error={errors.semester}
                />
              )}
            </div>

            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Current Password"
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  error={errors.currentPassword}
                />

                <div className="hidden md:block"></div>

                <Input
                  label="New Password"
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={errors.newPassword}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={updating}
              >
                {updating ? <Loader size="sm" className="mr-2" /> : null}
                {updating ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
