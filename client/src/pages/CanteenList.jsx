import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { getAllCanteens } from '../services/canteen';
import CanteenCard from '../components/Canteen/CanteenCard';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import Loader from '../components/UI/Loader';

const CanteenList = () => {
  const [canteens, setCanteens] = useState([]);
  const [filteredCanteens, setFilteredCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    showOnlyAvailable: false,
  });

  useEffect(() => {
    fetchCanteens();
  }, []);

  const fetchCanteens = async () => {
    try {
      setLoading(true);
      const data = await getAllCanteens();
      // The API returns the canteens array directly, not wrapped in an object
      const canteensArray = Array.isArray(data) ? data : data.canteens || [];
      setCanteens(canteensArray);
      setFilteredCanteens(canteensArray);
      setError(null);
    } catch (err) {
      setError('Failed to load canteens. Please try again later.');
      console.error('Error fetching canteens:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let result = [...canteens];

    // Apply availability filter
    if (filters.showOnlyAvailable) {
      result = result.filter(canteen =>
        canteen.isAvailable !== undefined ? canteen.isAvailable : canteen.availability
      );
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        canteen =>
          canteen.name.toLowerCase().includes(term) ||
          (canteen.description && canteen.description.toLowerCase().includes(term))
      );
    }

    setFilteredCanteens(result);
  }, [canteens, filters, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Canteens</h1>
        <p className="text-gray-600">
          Browse and order from our campus canteens
        </p>
      </div>

      {/* Search and filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search canteens..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                id="available-only"
                name="showOnlyAvailable"
                type="checkbox"
                checked={filters.showOnlyAvailable}
                onChange={handleFilterChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="available-only" className="ml-2 block text-sm text-gray-700">
                Show only open canteens
              </label>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
              onClick={() => {
                setSearchTerm('');
                setFilters({ showOnlyAvailable: false });
              }}
            >
              <Filter size={16} className="mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Canteen list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={fetchCanteens}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {filteredCanteens.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No canteens found matching your criteria.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ showOnlyAvailable: false });
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCanteens.map(canteen => (
                <CanteenCard key={canteen._id} canteen={canteen} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CanteenList;
