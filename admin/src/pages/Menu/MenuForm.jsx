import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { getMenuItemById, createMenuItem, updateMenuItem } from '../../services/menu';
import { getAllCanteens } from '../../services/canteen';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Loader from '../../components/UI/Loader';

const MenuForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    canteenId: '',
    isAvailable: true,
    image: null,
  });

  const [canteens, setCanteens] = useState([]);
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

      // Fetch canteens
      const canteensResponse = await getAllCanteens();
      // Handle response format - backend returns array directly, not wrapped in a 'canteens' property
      const canteensData = Array.isArray(canteensResponse) ? canteensResponse :
                          (canteensResponse.canteens || []);
      setCanteens(canteensData);

      // If in edit mode, fetch menu item details
      if (isEditMode) {
        console.log('Fetching menu item with ID:', id);
        try {
          const itemResponse = await getMenuItemById(id);
          console.log('Menu item response:', itemResponse);

          // Handle different response formats
          const menuItem = itemResponse.menuItem || itemResponse;

          if (!menuItem) {
            throw new Error('Menu item data not found in response');
          }

          console.log('Processed menu item data:', menuItem);

          // Map backend field names to frontend field names
          const canteenIdValue = typeof menuItem.canteenId === 'object'
            ? menuItem.canteenId._id
            : menuItem.canteenId || '';

          console.log('Original canteenId from API:', menuItem.canteenId);
          console.log('Processed canteenId for form:', canteenIdValue);

          setFormData({
            name: menuItem.itemName || '', // Map 'itemName' from backend to 'name' in frontend
            description: menuItem.description || '',
            price: menuItem.price ? menuItem.price.toString() : '',
            category: menuItem.category || '',
            canteenId: canteenIdValue,
            isAvailable: menuItem.availability !== undefined ? menuItem.availability : false, // Handle possible field name difference
            image: null, // We don't load the image file, just the URL
          });

          console.log('Loaded menu item data:', menuItem);

          if (menuItem.image) {
            setImagePreview(menuItem.image.url || menuItem.image);
          }
        } catch (fetchError) {
          console.error('Error fetching menu item:', fetchError);
          toast.error('Failed to load menu item data. Please try again.');
          navigate('/menu');
          return;
        }
      } else if (canteensData.length > 0) {
        // In create mode, set the first canteen as default
        setFormData(prev => ({
          ...prev,
          canteenId: canteensData[0]._id
        }));
      }

    } catch (err) {
      toast.error('Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
      navigate('/menu');
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
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        image: 'Please upload a valid image file (JPEG, PNG)'
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        image: 'Image size should be less than 5MB'
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      image: file
    }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Clear error
    if (errors.image) {
      setErrors(prev => ({
        ...prev,
        image: ''
      }));
    }
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

      // Map frontend field names to backend expected field names
      // and convert price to number
      const submissionData = {
        itemName: formData.name.trim(), // Map 'name' to 'itemName' as expected by backend
        category: formData.category.trim(),
        price: parseFloat(formData.price),
        description: formData.description ? formData.description.trim() : '', // Ensure description is never undefined
        availability: formData.isAvailable, // Map 'isAvailable' to 'availability' as expected by backend
      };

      // Explicitly handle canteenId to ensure it's included
      if (formData.canteenId) {
        submissionData.canteenId = formData.canteenId;
        console.log('Setting canteenId in submission data:', formData.canteenId);
      } else {
        console.warn('No canteenId found in form data!');
      }

      // Only include image if it exists
      if (formData.image) {
        submissionData.image = formData.image;
      }

      // Log the form data and submission data for debugging
      console.log('Original form data:', formData);
      console.log('Processed submission data:', submissionData);

      console.log('Submitting menu item data:', submissionData);

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

      navigate('/menu');
    } catch (err) {
      toast.error(err.message || `Failed to ${isEditMode ? 'update' : 'create'} menu item. Please try again.`);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} menu item:`, err);
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

  // Show error if no canteens are available
  if (canteens.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/menu')}
            className="flex items-center mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Menu Items
          </Button>
        </div>

        <Card className="p-6">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">No canteens available. Please create a canteen first.</p>
            <Button
              variant="primary"
              onClick={() => navigate('/canteens/add')}
            >
              Create a Canteen
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/menu')}
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

                <div>
                  <label htmlFor="canteenId" className="block text-sm font-medium text-gray-700 mb-1">
                    Canteen <span className="text-red-500">*</span>
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

                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the menu item..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Availability</h3>
              <div className="flex items-center">
                <input
                  id="isAvailable"
                  name="isAvailable"
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                  Item is currently available for ordering
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Item Image</h3>

              {imagePreview ? (
                <div className="relative w-full max-w-md mb-4">
                  <img
                    src={imagePreview}
                    alt="Item preview"
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                    onClick={handleRemoveImage}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  <label
                    htmlFor="image"
                    className="block w-full max-w-md border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-gray-400"
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-gray-700">
                      Click to upload an image
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      PNG, JPG, JPEG up to 5MB
                    </span>
                  </label>
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                  {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                </div>
              )}

              <p className="text-sm text-gray-500">
                {isEditMode && !formData.image && imagePreview
                  ? 'The existing image will be kept if no new image is uploaded.'
                  : 'Upload an image of the menu item to help users identify it.'}
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/menu')}
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

export default MenuForm;
