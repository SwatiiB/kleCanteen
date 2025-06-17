import { useState, useEffect } from 'react';
import { Eye, Search, Trash2, AlertTriangle } from 'lucide-react';
import { getAllUsers, deleteUser } from '../../services/user';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Table from '../../components/UI/Table';
import Modal from '../../components/UI/Modal';
import Loader from '../../components/UI/Loader';
import toast from 'react-hot-toast';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();

      // Handle different API response formats
      let userData = [];
      if (Array.isArray(response)) {
        userData = response;
      } else if (response && response.users && Array.isArray(response.users)) {
        userData = response.users;
      } else if (response && typeof response === 'object') {
        // If response is an object but doesn't have users array, try to use it directly
        userData = [response];
      }

      setUsers(userData);
      setFilteredUsers(userData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter(user => {
      // Safely check each property before accessing it
      const nameMatch = user?.name ? user.name.toLowerCase().includes(term) : false;
      const emailMatch = user?.email ? user.email.toLowerCase().includes(term) : false;
      const departmentMatch = user?.department ? user.department.toLowerCase().includes(term) : false;
      const phoneMatch = user?.phoneNo ? user.phoneNo.toLowerCase().includes(term) : false;

      return nameMatch || emailMatch || departmentMatch || phoneMatch;
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (e, user) => {
    e.stopPropagation();
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      await deleteUser(userToDelete._id);

      // Remove user from state
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userToDelete._id));
      setFilteredUsers(prevUsers => prevUsers.filter(user => user._id !== userToDelete._id));

      // Close modal and reset state
      setIsDeleteModalOpen(false);
      setUserToDelete(null);

      // Show success message
      toast.success(`User ${userToDelete.name} has been deleted successfully along with all associated data.`);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user. Please try again.');
    } finally {
      setIsDeleting(false);
    }
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
      header: 'Department',
      accessor: 'department',
      cell: (row) => row.department || 'N/A',
    },
    {
      header: 'Role',
      accessor: 'role',
      cell: (row) => row.role ? row.role.charAt(0).toUpperCase() + row.role.slice(1) : 'N/A',
    },
    {
      header: 'Phone',
      accessor: 'phoneNo',
      cell: (row) => row.phoneNo || 'N/A',
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
              handleViewUser(row);
            }}
          >
            <Eye size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={(e) => handleDeleteClick(e, row)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600">
          Manage user accounts
        </p>
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
                placeholder="Search users by name, email, department, or phone..."
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

      {/* Users table */}
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
              onClick={fetchUsers}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredUsers}
            emptyMessage="No users found."
            onRowClick={handleViewUser}
          />
        )}
      </Card>

      {/* View User Modal */}
      {selectedUser && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="User Details"
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{selectedUser.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedUser.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{selectedUser.phoneNo || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">
                  {selectedUser.role ? selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1) : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{selectedUser.department || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Semester</p>
                <p className="font-medium">{selectedUser.semester || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Joined</p>
                <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{formatDate(selectedUser.updatedAt)}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium mb-2">User ID</h3>
              <p className="text-sm bg-gray-50 p-2 rounded">{selectedUser._id}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
          title="Delete User"
          size="md"
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="ml-2"
              >
                {isDeleting ? 'Deleting...' : 'Delete User'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center text-red-500 bg-red-50 p-4 rounded-lg">
              <AlertTriangle className="h-6 w-6 mr-3" />
              <div>
                <h3 className="font-medium">Warning: This action cannot be undone</h3>
                <p className="text-sm text-red-600 mt-1">
                  Deleting this user will permanently remove their account and all associated data.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p>Are you sure you want to delete the following user?</p>
              <div className="mt-3 bg-gray-50 p-3 rounded">
                <p><strong>Name:</strong> {userToDelete.name}</p>
                <p><strong>Email:</strong> {userToDelete.email}</p>
                <p><strong>Role:</strong> {userToDelete.role ? userToDelete.role.charAt(0).toUpperCase() + userToDelete.role.slice(1) : 'N/A'}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="font-medium">The following data will also be deleted:</p>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>User profile information</li>
                <li>Order history</li>
                <li>Cart items</li>
                <li>Reviews and feedback</li>
                <li>Any other user-specific data</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserList;
