import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { getAllCanteens, deleteCanteen } from '../../services/canteen';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Table from '../../components/UI/Table';
import Modal from '../../components/UI/Modal';
import Loader from '../../components/UI/Loader';

const CanteenList = () => {
  const navigate = useNavigate();
  const [canteens, setCanteens] = useState([]);
  const [filteredCanteens, setFilteredCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCanteen, setSelectedCanteen] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCanteens();
  }, []);

  const fetchCanteens = async () => {
    try {
      setLoading(true);
      const response = await getAllCanteens();
      // Backend returns array directly, not wrapped in a 'canteens' property
      const canteensData = Array.isArray(response) ? response : [];
      setCanteens(canteensData);
      setFilteredCanteens(canteensData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch canteens. Please try again.');
      console.error('Error fetching canteens:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCanteens(canteens);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = canteens.filter(
      canteen =>
        canteen.name.toLowerCase().includes(term) ||
        (canteen.location && canteen.location.toLowerCase().includes(term))
    );

    setFilteredCanteens(filtered);
  }, [canteens, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewCanteen = (canteen) => {
    setSelectedCanteen(canteen);
    setIsViewModalOpen(true);
  };

  const handleEditCanteen = (canteen) => {
    navigate(`/canteens/edit/${canteen._id}`);
  };

  const handleDeleteClick = (canteen) => {
    setSelectedCanteen(canteen);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCanteen = async () => {
    if (!selectedCanteen) return;

    try {
      setDeleting(true);
      const response = await deleteCanteen(selectedCanteen._id);

      // Update local state
      setCanteens(canteens.filter(c => c._id !== selectedCanteen._id));

      // Show detailed success message
      if (response.deletionSummary) {
        const { staffDeleted, menuItemsDeleted } = response.deletionSummary;
        toast.success(
          `Canteen deleted successfully with ${staffDeleted} staff account(s) and ${menuItemsDeleted} menu item(s) removed.`
        );
      } else {
        toast.success('Canteen deleted successfully');
      }

      setIsDeleteModalOpen(false);
    } catch (err) {
      // Handle partial success case
      if (err.deletionSummary) {
        const { errors, canteenDeleted, staffDeleted, menuItemsDeleted } = err.deletionSummary;

        if (canteenDeleted) {
          // If the canteen was deleted but there were other errors, still update the UI
          setCanteens(canteens.filter(c => c._id !== selectedCanteen._id));

          toast.warning(
            `Canteen deleted with some issues. ${staffDeleted} staff account(s) and ${menuItemsDeleted} menu item(s) removed. Some errors occurred.`
          );
          setIsDeleteModalOpen(false);
        } else {
          toast.error('Failed to delete canteen. Some associated data may have been deleted.');
        }
      } else {
        toast.error(err.message || 'Failed to delete canteen. Please try again.');
      }

      console.error('Error deleting canteen:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';

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

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Location',
      accessor: 'location',
      cell: (row) => row.location || 'N/A',
    },
    {
      header: 'Hours',
      cell: (row) => {
        if (!row.openingTime || !row.closingTime) return 'N/A';
        return `${formatTime(row.openingTime)} - ${formatTime(row.closingTime)}`;
      },
    },
    {
      header: 'Status',
      accessor: 'availability',
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.availability ? 'Open' : 'Closed'}
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
              handleViewCanteen(row);
            }}
          >
            <Eye size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditCanteen(row);
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
          <h1 className="text-2xl font-bold text-gray-900">Canteens</h1>
          <p className="text-gray-600">
            Manage campus canteens
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/canteens/add')}
          className="flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Add Canteen
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search canteens by name or location..."
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
              onClick={() => setSearchTerm('')}
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Canteens table */}
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
              onClick={fetchCanteens}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredCanteens}
            emptyMessage="No canteens found."
            onRowClick={handleViewCanteen}
          />
        )}
      </Card>

      {/* View Canteen Modal */}
      {selectedCanteen && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Canteen Details"
          size="md"
        >
          <div className="space-y-4">
            {selectedCanteen.image && selectedCanteen.image.url && (
              <div className="mb-4">
                <img
                  src={selectedCanteen.image.url}
                  alt={selectedCanteen.name}
                  className="w-full h-48 object-cover rounded-md"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{selectedCanteen.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedCanteen.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedCanteen.availability ? 'Open' : 'Closed'}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{selectedCanteen.location || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Hours</p>
                <p className="font-medium">
                  {selectedCanteen.openingTime && selectedCanteen.closingTime
                    ? `${formatTime(selectedCanteen.openingTime)} - ${formatTime(selectedCanteen.closingTime)}`
                    : 'N/A'
                  }
                </p>
              </div>
            </div>



            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium mb-2">Canteen ID</h3>
              <p className="text-sm bg-gray-50 p-2 rounded">{selectedCanteen._id}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Cascading Delete"
        size="md"
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
              onClick={handleDeleteCanteen}
              disabled={deleting}
            >
              {deleting ? <Loader size="sm" className="mr-2" /> : null}
              {deleting ? 'Deleting...' : 'Delete Canteen'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-amber-700 font-medium">Warning: This is a permanent action</p>
                <p className="text-amber-700 text-sm">
                  Deleting this canteen will also delete all associated data.
                </p>
              </div>
            </div>
          </div>

          <p className="font-medium">
            Are you sure you want to delete the canteen "{selectedCanteen?.name}"?
          </p>

          <p className="text-gray-600">
            This will permanently delete:
          </p>

          <ul className="list-disc pl-5 text-gray-600 space-y-1">
            <li>The canteen and all its information</li>
            <li>All canteen staff accounts associated with this canteen</li>
            <li>All menu items belonging to this canteen</li>
            <li>All images associated with the canteen and its menu items</li>
          </ul>

          <p className="text-gray-600 mt-4">
            This action <span className="font-bold">cannot be undone</span>. Please confirm that you want to proceed.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default CanteenList;
