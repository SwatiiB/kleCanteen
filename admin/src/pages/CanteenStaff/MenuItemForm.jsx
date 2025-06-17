import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { getMenuItemById, createMenuItem, updateMenuItem } from '../../services/menu';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Loader from '../../components/UI/Loader';

const MenuItemForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    preparationTime: '10',
    isVegetarian: true,
    isAvailable: true,
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // If in edit mode, fetch menu item details
      if (isEditMode) {
        const response = await getMenuItemById(id);
        const menuItem = response;

        // Map backend field names to frontend field names
        setFormData({
          name: menuItem.itemName || '',
          description: menuItem.description || '',
          price: menuItem.price.toString() || '',
          category: menuItem.category || '',
          preparationTime: menuItem.preparationTime?.toString() || '10',
          isVegetarian: menuItem.isVegetarian !== undefined ? menuItem.isVegetarian : true,
          isAvailable: menuItem.availability !== undefined ? menuItem.availability : true,
          image: null, // We don't load the image file, just the URL
        });

        // Handle image from API response
        if (menuItem.image && menuItem.image.url) {
          setImagePreview(menuItem.image.url);
        } else if (menuItem.image && typeof menuItem.image === 'string') {
          // Handle case where image might be a direct URL string
          setImagePreview(menuItem.image);
        }
      }
    } catch (err) {
      toast.error('Failed to load menu item data. Please try again.');
      console.error('Error fetching menu item data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setFormData(prev => ({
      ...prev,
      image: file
    }));

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.preparationTime.trim()) {
      newErrors.preparationTime = 'Preparation time is required';
    } else if (isNaN(parseInt(formData.preparationTime)) || parseInt(formData.preparationTime) <= 0) {
      newErrors.preparationTime = 'Preparation time must be a positive number';
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

      // Map frontend field names to backend expected field names
      const submissionData = {
        itemName: formData.name,
        canteenId: user.canteenId, // Use the canteen ID from the authenticated user
        category: formData.category,
        price: parseFloat(formData.price),
        description: formData.description,
        preparationTime: parseInt(formData.preparationTime),
        isVegetarian: formData.isVegetarian,
        availability: formData.isAvailable, // This is already correctly mapped
        image: formData.image
      };

      if (isEditMode) {
        try {
          console.log('Updating menu item with ID:', id);
          const response = await updateMenuItem(id, submissionData);
          console.log('Update response:', response);
          toast.success('Menu item updated successfully');
        } catch (updateError) {
          console.error('Error updating menu item:', updateError);
          throw updateError; // Re-throw to be caught by the outer catch block
        }
      } else {
        await createMenuItem(submissionData);
        toast.success('Menu item created successfully');
      }

      navigate('/menu-management');
    } catch (err) {
      toast.error(err.message || 'Failed to save menu item. Please try again.');
      console.error('Error saving menu item:', err);
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
          onClick={() => navigate('/menu-management')}
          className="flex items-center mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Menu Items
        </Button>

        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Menu Item' : 'Add New Menu Item'}
        </h1>
        <p className="text-gray-600">
          {isEditMode ? 'Update menu item information' : 'Create a new menu item'}
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Item Name"
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />

                <Input
                  label="Price (₹)"
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  error={errors.price}
                  required
                />

                <Input
                  label="Category"
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Breakfast, Lunch, Snacks, Beverages"
                  error={errors.category}
                  required
                />

                <Input
                  label="Preparation Time (minutes)"
                  type="number"
                  id="preparationTime"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleChange}
                  min="1"
                  error={errors.preparationTime}
                  required
                />

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isVegetarian"
                    name="isVegetarian"
                    checked={formData.isVegetarian}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isVegetarian" className="text-sm font-medium text-gray-700">
                    Vegetarian
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                    Available for Order
                  </label>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Description</h3>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter a description of the menu item"
              />
            </div>

            {/* Image Upload */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Item Image</h3>

              {imagePreview ? (
                <div className="relative w-full h-48 mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      Click to upload an image (JPEG, PNG, WebP)
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      Max size: 5MB
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/menu-management')}
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
                  : (isEditMode ? 'Update Item' : 'Create Item')
                }
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default MenuItemForm;
