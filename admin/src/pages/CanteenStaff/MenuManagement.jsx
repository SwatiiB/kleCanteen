import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Edit, Eye, ToggleLeft, ToggleRight, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Table from '../../components/UI/Table';
import Modal from '../../components/UI/Modal';
import Loader from '../../components/UI/Loader';
import { getMenuItemsByCanteen, updateMenuItemAvailability, deleteMenuItem } from '../../services/menu';

const MenuManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [deletingItem, setDeletingItem] = useState(false);

  // Get canteen ID from user data and ensure it's a string
  const canteenId = user?.canteenId ? user.canteenId.toString() : null;

  // Log the canteenId for debugging
  useEffect(() => {
    console.log('MenuManagement - canteenId:', canteenId);
  }, [canteenId]);

  useEffect(() => {
    fetchMenuItems();
  }, [canteenId]);

  const fetchMenuItems = async () => {
    if (!canteenId) return;

    try {
      setLoading(true);
      const response = await getMenuItemsByCanteen(canteenId);

      // Map API response to the expected format for the frontend
      const formattedMenuItems = Array.isArray(response) ? response.map(item => ({
        _id: item._id,
        name: item.itemName,
        price: item.price,
        category: item.category,
        isAvailable: item.availability,
        description: item.description,
        preparationTime: item.preparationTime,
        isVegetarian: item.isVegetarian,
        image: item.image?.url || null,
        imageData: item.image // Store the full image object for reference
      })) : [];

      setMenuItems(formattedMenuItems);
      setError(null);
    } catch (err) {
      setError('Failed to fetch menu items. Please try again.');
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleEditItem = (item) => {
    navigate(`/menu-item/edit/${item._id}`);
  };

  const handleToggleAvailability = async (item) => {
    try {
      setUpdatingAvailability(true);
      await updateMenuItemAvailability(item._id, !item.isAvailable);

      // Update local state
      setMenuItems(menuItems.map(menuItem =>
        menuItem._id === item._id
          ? { ...menuItem, isAvailable: !menuItem.isAvailable }
          : menuItem
      ));

      toast.success(`${item.name} is now ${!item.isAvailable ? 'available' : 'unavailable'}`);
    } catch (err) {
      toast.error('Failed to update availability. Please try again.');
      console.error('Error updating availability:', err);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    try {
      setDeletingItem(true);
      await deleteMenuItem(selectedItem._id);

      // Update local state
      setMenuItems(menuItems.filter(item => item._id !== selectedItem._id));

      toast.success(`${selectedItem.name} has been deleted`);
      setIsDeleteModalOpen(false);
    } catch (err) {
      toast.error('Failed to delete menu item. Please try again.');
      console.error('Error deleting menu item:', err);
    } finally {
      setDeletingItem(false);
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Price',
      accessor: 'price',
      cell: (row) => `₹${row.price.toFixed(2)}`,
    },
    {
      header: 'Category',
      accessor: 'category',
    },
    {
      header: 'Availability',
      accessor: 'isAvailable',
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.isAvailable ? 'Available' : 'Unavailable'}
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
            variant={row.isAvailable ? 'success' : 'danger'}
            size="sm"
            disabled={updatingAvailability}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleAvailability(row);
            }}
          >
            {row.isAvailable ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          </Button>
          <Button
            variant="danger"
            size="sm"
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
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600">
            Manage menu items for your canteen
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/menu-item/add')}
          className="flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Add Menu Item
        </Button>
      </div>

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
              onClick={fetchMenuItems}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            data={menuItems}
            emptyMessage="No menu items found for this canteen."
          />
        )}
      </Card>

      {/* View Modal */}
      {selectedItem && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Menu Item Details"
          size="md"
        >
          <div className="space-y-4">
            {selectedItem.image && (
              <div className="mb-4">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-48 object-cover rounded-md"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{selectedItem.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-medium">₹{selectedItem.price.toFixed(2)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{selectedItem.category}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Availability</p>
                <p className={`font-medium ${
                  selectedItem.isAvailable ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedItem.isAvailable ? 'Available' : 'Unavailable'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p>{selectedItem.description || 'No description available'}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {selectedItem && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Delete"
          size="sm"
        >
          <div className="space-y-4">
            <p>
              Are you sure you want to delete <strong>{selectedItem.name}</strong>? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deletingItem}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={deletingItem}
              >
                {deletingItem ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default MenuManagement;
