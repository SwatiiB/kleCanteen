import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { getCanteenById, createCanteen, updateCanteen } from '../../services/canteen';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Loader from '../../components/UI/Loader';

const CanteenForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contactNumber: '',
    openingTime: '',
    closingTime: '',
    isAvailable: true,
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      fetchCanteenDetails();
    }
  }, [id]);

  const fetchCanteenDetails = async () => {
    try {
      setLoading(true);
      const canteen = await getCanteenById(id);

      // Backend returns canteen object directly, not wrapped in a 'canteen' property
      if (canteen) {
        setFormData({
          name: canteen.name || '',
          location: canteen.location || '',
          openingTime: canteen.openingTime || '',
          closingTime: canteen.closingTime || '',
          // Use availability instead of isAvailable to match backend model
          isAvailable: canteen.availability !== undefined ? canteen.availability : true,
          contactNumber: canteen.contactNumber || '',
          image: null, // We don't load the image file, just the URL
        });

        // Set image preview from the image URL if it exists
        if (canteen.image && canteen.image.url) {
          setImagePreview(canteen.image.url);
        }
      }

    } catch (err) {
      toast.error('Failed to load canteen details. Please try again.');
      console.error('Error fetching canteen details:', err);
      navigate('/canteens');
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

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.openingTime && !formData.closingTime) {
      newErrors.closingTime = 'Closing time is required if opening time is provided';
    }

    if (!formData.openingTime && formData.closingTime) {
      newErrors.openingTime = 'Opening time is required if closing time is provided';
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

      // Convert isAvailable to availability for backend
      const canteenData = {
        ...formData,
        availability: formData.isAvailable
      };

      // Remove isAvailable as it's not used in the backend
      delete canteenData.isAvailable;

      if (isEditMode) {
        await updateCanteen(id, canteenData);
        toast.success('Canteen updated successfully');
      } else {
        await createCanteen(canteenData);
        toast.success('Canteen created successfully');
      }

      navigate('/canteens');
    } catch (err) {
      toast.error(err.message || `Failed to ${isEditMode ? 'update' : 'create'} canteen. Please try again.`);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} canteen:`, err);
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
          onClick={() => navigate('/canteens')}
          className="flex items-center mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Canteens
        </Button>

        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Canteen' : 'Add New Canteen'}
        </h1>
        <p className="text-gray-600">
          {isEditMode ? 'Update canteen information' : 'Create a new canteen'}
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
                  label="Canteen Name"
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />

                <Input
                  label="Location"
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  error={errors.location}
                />

                <Input
                  label="Contact Number"
                  type="text"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  error={errors.contactNumber}
                  required
                />


              </div>
            </div>

            {/* Operating Hours */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Operating Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Opening Time"
                  type="time"
                  id="openingTime"
                  name="openingTime"
                  value={formData.openingTime}
                  onChange={handleChange}
                  error={errors.openingTime}
                />

                <Input
                  label="Closing Time"
                  type="time"
                  id="closingTime"
                  name="closingTime"
                  value={formData.closingTime}
                  onChange={handleChange}
                  error={errors.closingTime}
                />
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
                  Canteen is currently open and accepting orders
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Canteen Image</h3>

              {imagePreview ? (
                <div className="relative w-full max-w-md mb-4">
                  <img
                    src={typeof imagePreview === 'string' ? imagePreview : URL.createObjectURL(imagePreview)}
                    alt="Canteen preview"
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
                  : 'Upload an image of the canteen to help users identify it.'}
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/canteens')}
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
                  : (isEditMode ? 'Update Canteen' : 'Create Canteen')
                }
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CanteenForm;
