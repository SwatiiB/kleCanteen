import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, ArrowLeft, Filter, Search, Star, MessageSquare } from 'lucide-react';
import { getCanteenById } from '../services/canteen';
import { getMenuItemsByCanteen } from '../services/menu';
import { useCart } from '../context/CartContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import MenuItem from '../components/Menu/MenuItem';
import Loader from '../components/UI/Loader';
import StarRating from '../components/Feedback/StarRating';

const CanteenDetail = () => {
  const { id } = useParams();
  const { addToCart, hasMultipleCanteens, getCartCanteenId, clearCart } = useCart();
  const [canteen, setCanteen] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState(['all']);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToAdd, setItemToAdd] = useState(null);

  useEffect(() => {
    fetchCanteenData();
  }, [id]);

  // Handle body overflow when modal is shown
  useEffect(() => {
    if (showConfirmModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showConfirmModal]);

  const fetchCanteenData = async () => {
    try {
      setLoading(true);
      console.log('Fetching canteen data for ID:', id);

      // Fetch canteen details
      const canteenData = await getCanteenById(id);
      console.log('Canteen API response:', canteenData);

      // Handle both direct response and wrapped response
      const canteenObj = canteenData.canteen || canteenData;
      console.log('Processed canteen object:', canteenObj);
      setCanteen(canteenObj);

      // Fetch menu items
      console.log('Fetching menu items for canteen ID:', id);
      const menuData = await getMenuItemsByCanteen(id);
      console.log('Menu items API response:', menuData);

      // Handle both direct array response and wrapped response
      const menuItemsArray = Array.isArray(menuData) ? menuData : menuData.menuItems || [];
      console.log('Processed menu items array:', menuItemsArray);
      setMenuItems(menuItemsArray);

      // Set filtered items initially to all menu items
      setFilteredItems(menuItemsArray);

      // Extract unique categories
      const uniqueCategories = ['all', ...new Set(menuItemsArray.map(item => item.category))];
      console.log('Extracted categories:', uniqueCategories);
      setCategories(uniqueCategories);

      setError(null);
    } catch (err) {
      setError('Failed to load canteen details. Please try again later.');
      console.error('Error fetching canteen details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    console.log('Filter effect running with:', {
      menuItemsCount: menuItems.length,
      activeCategory,
      searchTerm
    });

    if (menuItems.length === 0) {
      console.log('No menu items to filter');
      setFilteredItems([]);
      return;
    }

    let result = [...menuItems];
    console.log('Starting filter with items:', result);

    // Apply category filter
    if (activeCategory !== 'all') {
      result = result.filter(item => item.category === activeCategory);
      console.log('After category filter:', result);
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        item => {
          // Handle both name and itemName properties
          const itemName = item.name || item.itemName || '';
          const itemDesc = item.description || '';

          return itemName.toLowerCase().includes(term) ||
                 itemDesc.toLowerCase().includes(term);
        }
      );
      console.log('After search filter:', result);
    }

    console.log('Setting filtered items:', result);
    setFilteredItems(result);
  }, [menuItems, activeCategory, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  const handleAddToCart = (item) => {
    // Check if cart has items from a different canteen
    if (hasMultipleCanteens() || (getCartCanteenId() && getCartCanteenId() !== id)) {
      setItemToAdd(item);
      setShowConfirmModal(true);
    } else {
      // Add the canteen ID to the item
      addToCart({ ...item, canteenId: id });
    }
  };

  const handleConfirmClearCart = () => {
    // Clear cart and add the new item
    clearCart();
    addToCart({ ...itemToAdd, canteenId: id });
    // Ensure body overflow is reset when modal is closed
    document.body.style.overflow = 'auto';
    setShowConfirmModal(false);
    setItemToAdd(null);
  };

  // Format opening and closing times if available
  const formatTime = (timeString) => {
    if (!timeString) return '';

    try {
      const [hours, minutes] = timeString.split(':');
      const time = new Date();
      time.setHours(parseInt(hours, 10));
      time.setMinutes(parseInt(minutes, 10));

      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return timeString;
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
          onClick={fetchCanteenData}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!canteen) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Canteen not found.</p>
        <Link to="/canteens">
          <Button variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Back to Canteens
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <div className="mb-4">
        <Link to="/canteens">
          <Button variant="outline" size="sm">
            <ArrowLeft size={16} className="mr-2" />
            Back to Canteens
          </Button>
        </Link>
      </div>

      {/* Enhanced Canteen header with hero image */}
      <Card className="mb-6 overflow-hidden border border-gray-200 shadow-md">
        <div className="relative">
          {(canteen.image && (canteen.image.url || typeof canteen.image === 'string')) ? (
            <div className="h-64 w-full relative">
              <img
                src={canteen.image.url || canteen.image}
                alt={canteen.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">{canteen.name}</h1>
                {canteen.description && (
                  <p className="text-white/90 text-lg max-w-2xl">{canteen.description}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="h-48 w-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
              <div className="p-6 text-white text-center">
                <h1 className="text-3xl font-bold mb-2">{canteen.name}</h1>
                {canteen.description && (
                  <p className="text-white/90 text-lg max-w-2xl">{canteen.description}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                (canteen.isAvailable !== undefined ? canteen.isAvailable : canteen.availability)
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {(canteen.isAvailable !== undefined ? canteen.isAvailable : canteen.availability)
                  ? 'Open Now'
                  : 'Closed'}
              </span>

              {canteen.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-1" />
                  <span>{canteen.location}</span>
                </div>
              )}

              {(canteen.openingTime && canteen.closingTime) && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock size={16} className="mr-1" />
                  <span>{formatTime(canteen.openingTime)} - {formatTime(canteen.closingTime)}</span>
                </div>
              )}
            </div>

            {!(canteen.isAvailable !== undefined ? canteen.isAvailable : canteen.availability) && (
              <div className="mt-4 md:mt-0 bg-red-50 p-3 rounded-md border border-red-100">
                <p className="text-red-700 text-sm font-medium">
                  This canteen is currently closed. You cannot place orders at this time.
                </p>
              </div>
            )}
          </div>

          {/* Ratings section */}
          {canteen.ratings && canteen.ratings.averageRating > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center mb-3">
                <h3 className="text-lg font-semibold mr-2">Ratings & Reviews</h3>
                <Link to="/feedback" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                  <MessageSquare size={14} className="mr-1" />
                  View All Feedback
                </Link>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center">
                  <div className="flex items-center mr-2">
                    <StarRating rating={canteen.ratings.averageRating} size="md" />
                  </div>
                  <span className="font-semibold text-lg">{canteen.ratings.averageRating}</span>
                  <span className="text-gray-500 text-sm ml-1">({canteen.ratings.totalRatings} ratings)</span>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Food Quality:</span>
                    <StarRating rating={canteen.ratings.foodQuality} size="sm" showText={false} />
                    <span className="ml-1 text-sm">{canteen.ratings.foodQuality}</span>
                  </div>

                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Service Speed:</span>
                    <StarRating rating={canteen.ratings.serviceSpeed} size="sm" showText={false} />
                    <span className="ml-1 text-sm">{canteen.ratings.serviceSpeed}</span>
                  </div>

                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">App Experience:</span>
                    <StarRating rating={canteen.ratings.appExperience} size="sm" showText={false} />
                    <span className="ml-1 text-sm">{canteen.ratings.appExperience}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-600">
                <p>Your feedback helps us improve our service. After placing and receiving an order, you can rate your experience.</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Enhanced Search and filters */}
      <Card className="mb-6 p-6 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Find Your Favorite Dish</h2>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search by name, description..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center hover:bg-gray-100"
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('all');
              }}
            >
              <Filter size={16} className="mr-1" />
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Category tabs with improved styling */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Category:</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category === 'all' ? 'All Items' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Quick filters */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-3">
            <button
              className="text-sm text-gray-600 hover:text-blue-600 flex items-center"
              onClick={() => {
                // Sort by price (low to high)
                setFilteredItems([...filteredItems].sort((a, b) => a.price - b.price));
              }}
            >
              <span className="mr-1">↓</span> Price: Low to High
            </button>
            <button
              className="text-sm text-gray-600 hover:text-blue-600 flex items-center"
              onClick={() => {
                // Sort by price (high to low)
                setFilteredItems([...filteredItems].sort((a, b) => b.price - a.price));
              }}
            >
              <span className="mr-1">↑</span> Price: High to Low
            </button>
            <button
              className="text-sm text-gray-600 hover:text-blue-600 flex items-center"
              onClick={() => {
                // Filter vegetarian items
                if (activeCategory === 'all') {
                  const vegItems = menuItems.filter(item => item.isVegetarian);
                  setFilteredItems(vegItems);
                } else {
                  const vegItems = menuItems.filter(item =>
                    item.isVegetarian && item.category === activeCategory
                  );
                  setFilteredItems(vegItems);
                }
              }}
            >
              🥗 Vegetarian Only
            </button>
          </div>
        </div>
      </Card>

      {/* Menu items with enhanced layout */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Menu Items</h2>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No menu items found matching your criteria.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div>
            {/* Group items by category for better organization */}
            {activeCategory === 'all' ? (
              // When showing all items, group by category
              (() => {
                console.log('Grouping items by category:', filteredItems);

                // Check if filteredItems is empty or not an array
                if (!filteredItems || !Array.isArray(filteredItems) || filteredItems.length === 0) {
                  console.log('No items to group');
                  return (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No menu items available for this canteen.</p>
                    </div>
                  );
                }

                // Group items by category
                const groupedItems = filteredItems.reduce((acc, item) => {
                  const category = item.category || 'Uncategorized';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(item);
                  return acc;
                }, {});

                console.log('Grouped items:', groupedItems);

                // Render grouped items
                return Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map(item => (
                        <MenuItem
                          key={item._id}
                          item={item}
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                    </div>
                  </div>
                ));
              })()
            ) : (
              // When filtered to a specific category, show in grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                  <MenuItem
                    key={item._id}
                    item={item}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirm modal for clearing cart */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Clear Your Cart?</h3>
            <p className="text-gray-600 mb-6">
              Your cart contains items from another canteen. Adding items from this canteen will clear your current cart.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  // Ensure body overflow is reset when modal is closed
                  document.body.style.overflow = 'auto';
                  setShowConfirmModal(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmClearCart}
              >
                Clear Cart & Add Item
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CanteenDetail;
