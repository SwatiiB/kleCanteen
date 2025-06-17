import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Coffee, Clock, Tag, DollarSign, Utensils, ChefHat, Star } from 'lucide-react';
import { getAllMenuItems } from '../services/menu';
import Loader from '../components/UI/Loader';

const MenuList = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    isVegetarian: '',
    priceRange: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch menu items on component mount
  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Apply filters and search when dependencies change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [menuItems, searchTerm, filters]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const data = await getAllMenuItems();
      setMenuItems(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch menu items. Please try again.');
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let result = [...menuItems];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        item =>
          item.itemName?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.category?.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (filters.category) {
      result = result.filter(item => item.category === filters.category);
    }

    // Apply vegetarian filter
    if (filters.isVegetarian !== '') {
      const isVeg = filters.isVegetarian === 'true';
      result = result.filter(item => item.isVegetarian === isVeg);
    }

    // Apply price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      result = result.filter(item => item.price >= min && (max ? item.price <= max : true));
    }

    setFilteredItems(result);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      category: '',
      isVegetarian: '',
      priceRange: '',
    });
  };

  // Get unique categories from menu items
  const categories = [...new Set(menuItems.map(item => item.category))].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section with Gradient Background */}
      <div className="relative rounded-xl overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/src/assets/pattern-dots.png')] opacity-10"></div>
        <div className="relative z-10 py-20 px-8 text-center">
          <div className="flex justify-center mb-4 animate-bounce">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <ChefHat size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">
            OUR MENU
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Explore our delicious menu items from all canteens
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-card p-6 mb-10 border border-neutral-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-primary-500" />
            </div>
            <input
              type="text"
              placeholder="Search for your favorite dishes..."
              className="pl-12 pr-4 py-3 w-full border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-5 py-3 bg-primary-50 hover:bg-primary-100 rounded-lg text-primary-600 font-medium transition-all"
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>
            {(searchTerm || filters.category || filters.isVegetarian !== '' || filters.priceRange) && (
              <button
                onClick={resetFilters}
                className="px-5 py-3 bg-accent-50 hover:bg-accent-100 text-accent-600 rounded-lg font-medium transition-all"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filter options */}
        {showFilters && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-neutral-200 animate-fadeIn">
            {/* Category filter */}
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100 hover:border-primary-200 transition-colors">
              <label htmlFor="category" className="block text-sm font-semibold text-neutral-700 mb-2">
                <Tag size={16} className="inline mr-2 text-primary-500" />
                Category
              </label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Vegetarian filter */}
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100 hover:border-primary-200 transition-colors">
              <label htmlFor="isVegetarian" className="block text-sm font-semibold text-neutral-700 mb-2">
                <Utensils size={16} className="inline mr-2 text-primary-500" />
                Food Type
              </label>
              <select
                id="isVegetarian"
                name="isVegetarian"
                value={filters.isVegetarian}
                onChange={handleFilterChange}
                className="w-full border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white"
              >
                <option value="">All Types</option>
                <option value="true">Vegetarian</option>
                <option value="false">Non-Vegetarian</option>
              </select>
            </div>

            {/* Price range filter */}
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100 hover:border-primary-200 transition-colors">
              <label htmlFor="priceRange" className="block text-sm font-semibold text-neutral-700 mb-2">
                <DollarSign size={16} className="inline mr-2 text-primary-500" />
                Price Range
              </label>
              <select
                id="priceRange"
                name="priceRange"
                value={filters.priceRange}
                onChange={handleFilterChange}
                className="w-full border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white"
              >
                <option value="">All Prices</option>
                <option value="0-50">Under ₹50</option>
                <option value="50-100">₹50 - ₹100</option>
                <option value="100-200">₹100 - ₹200</option>
                <option value="200-">Above ₹200</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Menu Items Grid */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-card p-8 border border-neutral-100">
          <Loader size="lg" className="text-primary-500" />
          <p className="mt-4 text-neutral-600 font-medium">Loading delicious menu items...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-accent-50 rounded-xl shadow-card border border-accent-100">
          <div className="bg-accent-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Utensils size={32} className="text-accent-600" />
          </div>
          <p className="text-accent-700 font-medium text-lg mb-4">{error}</p>
          <button
            onClick={fetchMenuItems}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 rounded-xl shadow-card border border-neutral-100">
          <div className="bg-primary-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Search size={36} className="text-primary-500" />
          </div>
          <p className="text-neutral-800 text-xl font-medium mb-3">No menu items found</p>
          <p className="text-neutral-600 mb-6">Try adjusting your search or filters</p>
          {(searchTerm || filters.category || filters.isVegetarian !== '' || filters.priceRange) && (
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div>
          <p className="text-neutral-700 mb-6 font-medium">Showing {filteredItems.length} items</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div key={item._id} className="bg-white rounded-xl shadow-card overflow-hidden hover:shadow-hover transition-all duration-300 transform hover:-translate-y-2 border border-neutral-100">
                {/* Item Image */}
                <div className="h-56 overflow-hidden relative">
                  {item.image?.url ? (
                    <img
                      src={item.image.url}
                      alt={item.itemName}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                      <ChefHat size={64} className="text-neutral-300" />
                    </div>
                  )}
                  {!item.availability && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white font-bold text-lg px-4 py-2 border border-white rounded-lg">Currently Unavailable</span>
                    </div>
                  )}
                  <div className="absolute top-0 right-0 m-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.isVegetarian
                        ? 'bg-secondary-100 text-secondary-800 border border-secondary-200'
                        : 'bg-accent-100 text-accent-800 border border-accent-200'
                    }`}>
                      {item.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-xl font-bold text-white">{item.itemName}</h3>
                  </div>
                </div>

                {/* Item Details */}
                <div className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-primary-600">₹{item.price}</span>
                      {item.preparationTime && (
                        <div className="flex items-center ml-3 text-neutral-500 text-sm">
                          <Clock size={14} className="mr-1 text-primary-400" />
                          <span>{item.preparationTime} mins</span>
                        </div>
                      )}
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={star <= 4 ? "text-amber-400 fill-current" : "text-neutral-300"}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-neutral-600 mb-4 line-clamp-2 min-h-[40px]">{item.description || 'No description available'}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.category && (
                      <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                        {item.category}
                      </span>
                    )}
                    {item.canteenId && item.canteenId.name && (
                      <span className="px-3 py-1 bg-accent-50 text-accent-700 rounded-full text-xs font-medium">
                        {item.canteenId.name}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/canteens/${item.canteenId?._id}`}
                    className="block w-full text-center py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
                  >
                    View Canteen
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuList;
