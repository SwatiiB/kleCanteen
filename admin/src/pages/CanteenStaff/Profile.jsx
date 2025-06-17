import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/UI/Card';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import Loader from '../../components/UI/Loader';
import { getCanteenStaffProfile, updateCanteenStaffProfile } from '../../services/canteenStaff';
import { getCanteenById } from '../../services/canteen';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [canteen, setCanteen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // Fetch staff profile
      const profileResponse = await getCanteenStaffProfile();
      const staffData = profileResponse.staff || profileResponse;

      // Fetch canteen details
      if (staffData.canteenId) {
        // Ensure canteenId is a string by extracting _id if it's an object
        const canteenIdStr = typeof staffData.canteenId === 'object'
          ? (staffData.canteenId._id ? staffData.canteenId._id.toString() : staffData.canteenId.toString())
          : staffData.canteenId.toString();

        console.log('Fetching canteen with ID:', canteenIdStr);

        const canteenResponse = await getCanteenById(canteenIdStr);
        const canteenData = canteenResponse.canteen || canteenResponse;

        // Ensure we have a consistent property name for availability and image
        setCanteen({
          ...canteenData,
          isAvailable: canteenData.availability !== undefined ? canteenData.availability : canteenData.isAvailable,
          // Handle image object structure from API
          image: canteenData.image?.url || canteenData.image || null
        });
      }

      // Set form data
      setFormData({
        name: staffData.name || '',
        email: staffData.email || '',
        phone: staffData.contactNumber || staffData.phone || '', // Handle different field names
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

    } catch (err) {
      toast.error('Failed to load profile data. Please try again.');
      console.error('Error fetching profile data:', err);
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

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
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
        contactNumber: formData.phone, // Use contactNumber as expected by the API
      };

      // Add password fields only if user is trying to change password
      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await updateCanteenStaffProfile(updateData);

      // Update user in context
      updateUser(response.staff);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canteen Information */}
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Canteen Information</h2>

          {canteen ? (
            <div>
              {canteen.image && (
                <img
                  src={canteen.image}
                  alt={canteen.name}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
              )}

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Canteen Name</p>
                  <p className="font-medium">{canteen.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    canteen.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {canteen.isAvailable ? 'Open' : 'Closed'}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p>{canteen.description}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No canteen information available.</p>
          )}
        </Card>

        {/* Profile Form */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Name"
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
                error={errors.email}
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

              <div className="border-t pt-4 mt-6">
                <h3 className="text-md font-medium mb-4">Change Password</h3>

                <Input
                  label="Current Password"
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  error={errors.currentPassword}
                />

                <Input
                  label="New Password"
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  error={errors.newPassword}
                  className="mt-4"
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  className="mt-4"
                />
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
    </div>
  );
};

export default Profile;
