import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import { getAllMenuItems, deleteMenuItem } from '../../services/menu';
import { getAllCanteens } from '../../services/canteen';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Table from '../../components/UI/Table';
import Modal from '../../components/UI/Modal';
import Loader from '../../components/UI/Loader';

const MenuList = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    canteenId: '',
    category: '',
    showOnlyAvailable: false,
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  // Debug function to log data structure
  const logItemStructure = (item) => {
    if (!item) return;
    console.log('Menu item structure:', {
      _id: item._id,
      name: item.name,
      itemName: item.itemName,
      price: item.price,
      category: item.category,
      isAvailable: item.isAvailable,
      availability: item.availability,
      canteenId: item.canteenId,
      image: item.image,
      originalData: item.originalData
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch menu items and canteens in parallel
      const [menuResponse, canteensResponse] = await Promise.all([
        getAllMenuItems(),
        getAllCanteens()
      ]);

      // Handle different API response formats for menu items
      let menuItemsData = [];
      if (Array.isArray(menuResponse)) {
        menuItemsData = menuResponse;
      } else if (menuResponse && menuResponse.menuItems && Array.isArray(menuResponse.menuItems)) {
        menuItemsData = menuResponse.menuItems;
      }

      // Handle different API response formats for canteens
      let canteensData = [];
      if (Array.isArray(canteensResponse)) {
        canteensData = canteensResponse;
      } else if (canteensResponse && canteensResponse.canteens && Array.isArray(canteensResponse.canteens)) {
        canteensData = canteensResponse.canteens;
      }

      // Map backend field names to frontend field names
      const normalizedMenuItems = menuItemsData.map(item => ({
        _id: item._id,
        name: item.itemName,
        price: item.price || 0,
        category: item.category || '',
        description: item.description || '',
        isAvailable: item.availability !== undefined ? item.availability : (item.isAvailable || false),
        // Handle both populated canteenId object and plain canteenId string
        canteenId: typeof item.canteenId === 'object' ? item.canteenId : item.canteenId,
        // Handle image URL structure
        image: item.image?.url ||'',
        // Keep the original data for reference
        originalData: item
      }));

      console.log('Normalized menu items:', normalizedMenuItems);

      setMenuItems(normalizedMenuItems);
      setFilteredItems(normalizedMenuItems);
      setCanteens(canteensData);

      // Extract unique categories (safely)
      const uniqueCategories = [...new Set(menuItemsData
        .filter(item => item && item.category) // Filter out items without category
        .map(item => item.category))];
      setCategories(uniqueCategories);

      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    // Make sure menuItems is an array before spreading
    let result = Array.isArray(menuItems) ? [...menuItems] : [];

    // Apply canteen filter
    if (filters.canteenId) {
      result = result.filter(item => {
        if (!item || !item.canteenId) return false;

        // Handle both object and string canteenId
        if (typeof item.canteenId === 'object') {
          return item.canteenId._id === filters.canteenId;
        }

        return item.canteenId === filters.canteenId;
      });
    }

    // Apply category filter
    if (filters.category) {
      result = result.filter(item => item && item.category === filters.category);
    }

    // Apply availability filter
    if (filters.showOnlyAvailable) {
      result = result.filter(item => item && item.isAvailable === true);
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => {
        if (!item) return false;

        const nameMatch = item.name ? item.name.toLowerCase().includes(term) : false;
        const descMatch = item.description ? item.description.toLowerCase().includes(term) : false;

        return nameMatch || descMatch;
      });
    }

    setFilteredItems(result);
  }, [menuItems, filters, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      canteenId: '',
      category: '',
      showOnlyAvailable: false,
    });
  };

  const handleViewItem = (item) => {
    logItemStructure(item);
    console.log('Full item data:', JSON.stringify(item, null, 2));

    // Ensure we have the original data for reference
    if (!item.originalData && item._id) {
      // If originalData is missing but we have the item ID, we can still use the current item
      item = {
        ...item,
        originalData: item
      };
    }

    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleEditItem = (item) => {
    console.log('Edit item clicked:', item);

    // Make sure we have a valid ID
    if (!item || !item._id) {
      console.error('Invalid menu item or missing ID:', item);
      toast.error('Cannot edit this item: Missing ID');
      return;
    }

    // Navigate to the edit page
    try {
      navigate(`/menu/edit/${item._id}`);
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Error navigating to edit page');
    }
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    try {
      setDeleting(true);
      await deleteMenuItem(selectedItem._id);

      // Update local state
      setMenuItems(menuItems.filter(item => item._id !== selectedItem._id));

      toast.success('Menu item deleted successfully');
      setIsDeleteModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to delete menu item. Please try again.');
      console.error('Error deleting menu item:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Find canteen name by ID or from populated canteen object
  const getCanteenName = (canteenData) => {
    // If canteenData is already an object with a name property, use it directly
    if (canteenData && typeof canteenData === 'object' && canteenData.name) {
      return canteenData.name;
    }

    // Otherwise, treat it as an ID and look up in the canteens array
    if (!canteenData || !Array.isArray(canteens)) {
      return 'Unknown Canteen';
    }

    const canteenId = typeof canteenData === 'object' ? canteenData._id : canteenData;
    const canteen = canteens.find(c => c && c._id === canteenId);
    return canteen?.name || 'Unknown Canteen';
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      cell: (row) => row?.name || 'N/A',
    },
    {
      header: 'Price',
      accessor: 'price',
      cell: (row) => {
        if (row?.price !== undefined && row.price !== null) {
          return `₹${Number(row.price).toFixed(2)}`;
        }
        return 'N/A';
      },
    },
    {
      header: 'Category',
      accessor: 'category',
      cell: (row) => row?.category || 'N/A',
    },
    {
      header: 'Canteen',
      accessor: 'canteenId',
      cell: (row) => {
        if (!row?.canteenId) return 'N/A';
        return getCanteenName(row.canteenId);
      },
    },
    {
      header: 'Availability',
      accessor: 'isAvailable',
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row?.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row?.isAvailable ? 'Available' : 'Unavailable'}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewItem(row);
            }}
          >
            <Eye size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditItem(row);
            }}
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-800"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Items</h1>
          <p className="text-gray-600">
            Manage menu items for all canteens
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/menu/add')}
          className="flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Add Menu Item
        </Button>
      </div>

      {/* Search and filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center"
                onClick={resetFilters}
              >
                <Filter size={16} className="mr-1" />
                Reset Filters
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="canteenId" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Canteen
              </label>
              <select
                id="canteenId"
                name="canteenId"
                value={filters.canteenId}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Canteens</option>
                {canteens.map(canteen => (
                  <option key={canteen._id} value={canteen._id}>
                    {canteen.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Category
              </label>
              <select
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="showOnlyAvailable"
                name="showOnlyAvailable"
                type="checkbox"
                checked={filters.showOnlyAvailable}
                onChange={handleFilterChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showOnlyAvailable" className="ml-2 block text-sm text-gray-700">
                Show only available items
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Menu items table */}
      <Card>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={fetchData}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredItems}
            emptyMessage="No menu items found."
            onRowClick={handleViewItem}
          />
        )}
      </Card>

      {/* View Menu Item Modal */}
      {selectedItem && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Menu Item Details"
          size="md"
        >
          <div className="space-y-4">
            {/* Display image with better error handling and debugging */}
            <div className="mb-4">
              {console.log('Image data in modal:', selectedItem?.image, 'Original data:', selectedItem?.originalData?.image)}
              <img
                src={selectedItem?.originalData?.image?.url || selectedItem?.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                alt={selectedItem?.originalData?.itemName || selectedItem?.name || 'Menu item'}
                className="w-full h-48 object-cover rounded-md"
                onError={(e) => {
                  console.error('Image failed to load:', selectedItem?.originalData?.image?.url || selectedItem?.image);
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{selectedItem?.originalData?.itemName || selectedItem?.name || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-medium">
                  {selectedItem?.price !== undefined && selectedItem.price !== null
                    ? `₹${Number(selectedItem.price).toFixed(2)}`
                    : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{selectedItem?.category || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Availability</p>
                {console.log('Availability data:', {
                  isAvailable: selectedItem?.isAvailable,
                  availability: selectedItem?.originalData?.availability
                })}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  (selectedItem?.isAvailable || selectedItem?.originalData?.availability) ?
                    'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {(selectedItem?.isAvailable || selectedItem?.originalData?.availability) ?
                    'Available' : 'Unavailable'}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">Canteen</p>
                <p className="font-medium">
                  {selectedItem?.canteenId ? (
                    typeof selectedItem.canteenId === 'object' && selectedItem.canteenId.name ?
                      selectedItem.canteenId.name :
                      getCanteenName(selectedItem.canteenId)
                  ) : 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p>{selectedItem?.description || 'No description available'}</p>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium mb-2">Item ID</h3>
              <p className="text-sm bg-gray-50 p-2 rounded">{selectedItem?._id || 'N/A'}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteItem}
              disabled={deleting}
            >
              {deleting ? <Loader size="sm" className="mr-2" /> : null}
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete the menu item "{selectedItem?.originalData?.itemName || selectedItem?.name || 'Unknown'}"? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default MenuList;
