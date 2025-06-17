import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Loader from '../../components/UI/Loader';
import { getCanteenById, updateCanteenAvailability } from '../../services/canteen';

const CanteenAvailability = () => {
  const { user } = useAuth();
  const [canteen, setCanteen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Get canteen ID from user data
  const canteenId = user?.canteenId;

  useEffect(() => {
    fetchCanteenDetails();
  }, [canteenId]);

  const fetchCanteenDetails = async () => {
    if (!canteenId) return;

    try {
      setLoading(true);
      const response = await getCanteenById(canteenId);
      // Store the canteen data, ensuring we have a consistent property name for availability
      const canteenData = response.canteen || response;
      setCanteen({
        ...canteenData,
        // Ensure we have a consistent property name for availability
        isAvailable: canteenData.availability !== undefined ? canteenData.availability : canteenData.isAvailable,
        // Handle image object structure from API
        image: canteenData.image?.url || canteenData.image || null
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch canteen details. Please try again.');
      console.error('Error fetching canteen details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!canteen) return;

    try {
      setUpdating(true);
      const newAvailability = !canteen.isAvailable;

      // Call the API to update availability
      await updateCanteenAvailability(canteenId, newAvailability);

      // Update local state
      setCanteen({
        ...canteen,
        isAvailable: newAvailability,
        // Also update the original property name if it exists
        ...(canteen.availability !== undefined && { availability: newAvailability })
      });

      toast.success(`Canteen is now ${newAvailability ? 'open' : 'closed'}`);
    } catch (err) {
      toast.error('Failed to update availability. Please try again.');
      console.error('Error updating availability:', err);
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={fetchCanteenDetails}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!canteen) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No canteen information found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Canteen Availability</h1>
        <p className="text-gray-600">
          Manage your canteen's availability status
        </p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-semibold">{canteen.name}</h2>
            <p className="text-gray-600 mt-1">{canteen.description}</p>

            <div className="mt-4">
              <p className="text-sm text-gray-500">Current Status</p>
              <div className="mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  canteen.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {canteen.isAvailable ? 'Open' : 'Closed'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            {canteen.image && (
              <img
                src={canteen.image}
                alt={canteen.name}
                className="w-32 h-32 object-cover rounded-md mb-4"
              />
            )}

            <Button
              variant={canteen.isAvailable ? 'danger' : 'success'}
              size="lg"
              className="flex items-center"
              disabled={updating}
              onClick={handleToggleAvailability}
            >
              {updating ? (
                <Loader size="sm" className="mr-2" />
              ) : canteen.isAvailable ? (
                <ToggleRight size={20} className="mr-2" />
              ) : (
                <ToggleLeft size={20} className="mr-2" />
              )}
              {updating
                ? 'Updating...'
                : canteen.isAvailable
                  ? 'Close Canteen'
                  : 'Open Canteen'
              }
            </Button>
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Availability Guidelines</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 mr-2">•</span>
              <span>When your canteen is <strong>Open</strong>, customers can place orders from your menu.</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 mr-2">•</span>
              <span>When your canteen is <strong>Closed</strong>, customers cannot place new orders.</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 mr-2">•</span>
              <span>Remember to close your canteen when you're not operating or have reached capacity.</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 mr-2">•</span>
              <span>You can still process existing orders when your canteen is closed.</span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default CanteenAvailability;
