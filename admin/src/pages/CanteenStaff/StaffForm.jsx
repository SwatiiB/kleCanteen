import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { registerCanteenStaff, getCanteenStaffById, updateCanteenStaffById } from '../../services/canteenStaff';
import { getAllCanteens } from '../../services/canteen';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Loader from '../../components/UI/Loader';

const StaffForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    canteenId: '',
  });

  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const initializeForm = async () => {
      await fetchCanteens();

      if (isEditMode) {
        await fetchStaffData();
      }
    };

    initializeForm();
  }, [id]);

  const fetchCanteens = async () => {
    try {
      setLoading(true);
      const response = await getAllCanteens();

      // Handle canteens data - backend returns array directly
      const canteensData = Array.isArray(response) ? response :
                          (response.canteens ? response.canteens : []);

      setCanteens(canteensData);

      // Set default canteen if available
      if (canteensData.length > 0 && !isEditMode) {
        setFormData(prev => ({
          ...prev,
          canteenId: canteensData[0]._id
        }));
      }

    } catch (err) {
      toast.error('Failed to load canteens. Please try again.');
      console.error('Error fetching canteens:', err);
    } finally {
      if (!isEditMode) {
        setLoading(false);
      }
    }
  };

  const fetchStaffData = async () => {
    try {
      const staffData = await getCanteenStaffById(id);

      // Update form data with staff details
      setFormData({
        name: staffData.name || '',
        email: staffData.email || '',
        contactNumber: staffData.contactNumber || '',
        password: '',
        confirmPassword: '',
        canteenId: staffData.canteenId && typeof staffData.canteenId === 'object'
          ? staffData.canteenId._id
          : staffData.canteenId || '',
      });

    } catch (err) {
      toast.error(err.message || 'Failed to load staff data. Please try again.');
      console.error('Error fetching staff data:', err);
      navigate('/staff'); // Redirect back to staff list on error
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Phone number must be 10 digits';
    }

    if (!isEditMode) {
      // Password validation only for new staff
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (formData.password || formData.confirmPassword) {
      // Password validation for edit mode (only if password is being changed)
      if (formData.password.length > 0 && formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.canteenId) {
      newErrors.canteenId = 'Canteen is required';
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
      setSubmitting(true);

      if (isEditMode) {
        // Prepare data for update
        const updateData = {
          name: formData.name,
          email: formData.email,
          contactNumber: formData.contactNumber,
          canteenId: formData.canteenId
        };

        // Only include password if it's being changed
        if (formData.password) {
          updateData.password = formData.password;
        }

        // Update staff
        await updateCanteenStaffById(id, updateData);
        toast.success('Canteen staff updated successfully');
        navigate('/staff');
      } else {
        // Create new staff
        await registerCanteenStaff(formData);
        toast.success('Canteen staff created successfully');
        navigate('/staff');
      }
    } catch (err) {
      toast.error(err.message || `Failed to ${isEditMode ? 'update' : 'create'} canteen staff. Please try again.`);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} canteen staff:`, err);
    } finally {
      setSubmitting(false);
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/staff')}
          className="flex items-center mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Staff List
        </Button>

        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Staff' : 'Add New Staff'}
        </h1>
        <p className="text-gray-600">
          {isEditMode ? 'Update staff information' : 'Create a new canteen staff account'}
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Staff Information</h3>
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
                  error={errors.email}
                  required
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  error={errors.contactNumber}
                  required
                />

                <div>
                  <label htmlFor="canteenId" className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned Canteen <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="canteenId"
                    name="canteenId"
                    value={formData.canteenId}
                    onChange={handleChange}
                    className={`w-full rounded-md border ${errors.canteenId ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    required
                  >
                    <option value="">Select a canteen</option>
                    {canteens.map(canteen => (
                      <option key={canteen._id} value={canteen._id}>
                        {canteen.name}
                      </option>
                    ))}
                  </select>
                  {errors.canteenId && <p className="mt-1 text-sm text-red-600">{errors.canteenId}</p>}
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {isEditMode ? 'Change Password (Optional)' : 'Account Password'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Password"
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required={!isEditMode}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required={!isEditMode}
                />
              </div>
              {isEditMode && (
                <p className="text-sm text-gray-500 mt-2">
                  Leave password fields empty if you don't want to change the password.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/staff')}
                className="mr-3"
                disabled={submitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
              >
                {submitting ? <Loader size="sm" className="mr-2" /> : null}
                {submitting
                  ? (isEditMode ? 'Updating...' : 'Creating...')
                  : (isEditMode ? 'Update Staff' : 'Create Staff')
                }
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default StaffForm;
