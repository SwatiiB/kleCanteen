import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, Eye, Search, AlertTriangle } from 'lucide-react';
import { getAllCanteenStaff, deleteCanteenStaff } from '../../services/canteenStaff';
import { getAllCanteens } from '../../services/canteen';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Table from '../../components/UI/Table';
import Modal from '../../components/UI/Modal';
import Loader from '../../components/UI/Loader';

const StaffList = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch staff and canteens in parallel
      const [staffResponse, canteensResponse] = await Promise.all([
        getAllCanteenStaff(),
        getAllCanteens()
      ]);

      // Handle staff data - backend returns array directly
      const staffData = Array.isArray(staffResponse) ? staffResponse :
                        (staffResponse.staff ? staffResponse.staff : []);

      // Handle canteens data - backend returns array directly
      const canteensData = Array.isArray(canteensResponse) ? canteensResponse :
                          (canteensResponse.canteens ? canteensResponse.canteens : []);

      setStaffList(staffData);
      setFilteredStaff(staffData);
      setCanteens(canteensData);

      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStaff(staffList);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = staffList.filter(
      staff =>
        staff.name.toLowerCase().includes(term) ||
        staff.email.toLowerCase().includes(term) ||
        (staff.contactNumber && staff.contactNumber.includes(term))
    );

    setFilteredStaff(filtered);
  }, [staffList, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewStaff = (staff) => {
    setSelectedStaff(staff);
    setIsViewModalOpen(true);
  };

  const handleEditStaff = (staff) => {
    navigate(`/staff/edit/${staff._id}`);
  };

  const handleDeleteStaff = (staff) => {
    setSelectedStaff(staff);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStaff) return;

    try {
      setDeleting(true);
      await deleteCanteenStaff(selectedStaff._id);

      // Update local state
      setStaffList(staffList.filter(staff => staff._id !== selectedStaff._id));
      setFilteredStaff(filteredStaff.filter(staff => staff._id !== selectedStaff._id));

      toast.success('Canteen staff deleted successfully');
      setIsDeleteModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to delete canteen staff. Please try again.');
      console.error('Error deleting canteen staff:', err);
    } finally {
      setDeleting(false);
    }
  };

  // Find canteen name by ID
  const getCanteenName = (canteenId) => {
    const canteen = canteens.find(c => c._id === canteenId);
    return canteen ? canteen.name : 'Unknown Canteen';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Phone',
      accessor: 'contactNumber',
      cell: (row) => row.contactNumber || 'N/A',
    },
    {
      header: 'Canteen',
      accessor: 'canteenId',
      cell: (row) => {
        // Handle both object and string ID formats
        if (row.canteenId && typeof row.canteenId === 'object' && row.canteenId._id) {
          return row.canteenId.name || 'Unknown';
        }
        return getCanteenName(row.canteenId);
      },
    },
    {
      header: 'Joined',
      accessor: 'createdAt',
      cell: (row) => formatDate(row.createdAt),
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
              handleViewStaff(row);
            }}
          >
            <Eye size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditStaff(row);
            }}
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteStaff(row);
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
          <h1 className="text-2xl font-bold text-gray-900">Canteen Staff</h1>
          <p className="text-gray-600">
            Manage canteen staff accounts
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/staff/add')}
          className="flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Add Staff
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
                placeholder="Search staff by name, email, or contact number..."
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

      {/* Staff table */}
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
            data={filteredStaff}
            emptyMessage="No staff found."
            onRowClick={handleViewStaff}
          />
        )}
      </Card>

      {/* View Staff Modal */}
      {selectedStaff && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Staff Details"
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{selectedStaff.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedStaff.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{selectedStaff.contactNumber || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Canteen</p>
                <p className="font-medium">
                  {selectedStaff.canteenId && typeof selectedStaff.canteenId === 'object' && selectedStaff.canteenId.name
                    ? selectedStaff.canteenId.name
                    : getCanteenName(selectedStaff.canteenId)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Joined</p>
                <p className="font-medium">{formatDate(selectedStaff.createdAt)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{formatDate(selectedStaff.updatedAt)}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium mb-2">Staff ID</h3>
              <p className="text-sm bg-gray-50 p-2 rounded">{selectedStaff._id}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {selectedStaff && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => !deleting && setIsDeleteModalOpen(false)}
          title="Delete Canteen Staff"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-center text-red-500 mb-2">
              <AlertTriangle size={48} />
            </div>

            <p className="text-center">
              Are you sure you want to delete <span className="font-semibold">{selectedStaff.name}</span>?
            </p>

            <p className="text-sm text-gray-500 text-center">
              This action cannot be undone. The staff member will lose access to the system.
            </p>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                loading={deleting}
                loadingText="Deleting..."
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StaffList;
