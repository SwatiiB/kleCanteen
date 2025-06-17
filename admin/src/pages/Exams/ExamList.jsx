import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Plus, Edit, Trash2, Eye, Search, Filter, Calendar, Clock,
  BookOpen, MapPin, Users, ShoppingBag
} from 'lucide-react';
import { getAllExamDetails, deleteExamDetail } from '../../services/exam';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Table from '../../components/UI/Table';
import Modal from '../../components/UI/Modal';
import Loader from '../../components/UI/Loader';
import Select from '../../components/UI/Select';

const ExamList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [departments, setDepartments] = useState([]);

  // Fixed semester options from 1 to 8
  const semesterOptions = [
    { value: '1', label: 'Semester 1' },
    { value: '2', label: 'Semester 2' },
    { value: '3', label: 'Semester 3' },
    { value: '4', label: 'Semester 4' },
    { value: '5', label: 'Semester 5' },
    { value: '6', label: 'Semester 6' },
    { value: '7', label: 'Semester 7' },
    { value: '8', label: 'Semester 8' }
  ];

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await getAllExamDetails();
      setExams(data);
      setFilteredExams(data);

      // Extract unique departments for filters
      const uniqueDepartments = [...new Set(data.map(exam => exam.department))];
      setDepartments(uniqueDepartments.map(dept => ({ value: dept, label: dept })));

      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch exams');
      toast.error(err.message || 'Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter exams based on search term and filters
    let filtered = [...exams];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(exam =>
        exam.examName?.toLowerCase().includes(term) ||
        exam.department?.toLowerCase().includes(term) ||
        exam.semester?.toLowerCase().includes(term) ||
        exam.location?.toLowerCase().includes(term)
      );
    }

    if (filterDepartment) {
      filtered = filtered.filter(exam => exam.department === filterDepartment);
    }

    if (filterSemester) {
      filtered = filtered.filter(exam => exam.semester === filterSemester);
    }

    setFilteredExams(filtered);
  }, [searchTerm, filterDepartment, filterSemester, exams]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewExam = (exam) => {
    setSelectedExam(exam);
    setIsViewModalOpen(true);
  };

  const handleEditExam = (exam) => {
    navigate(`/exams/edit/${exam._id}`);
  };

  const handleDeleteClick = (exam) => {
    setSelectedExam(exam);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteExam = async () => {
    if (!selectedExam) return;

    try {
      setDeleting(true);
      await deleteExamDetail(selectedExam._id);

      // Update the exams list
      setExams(exams.filter(exam => exam._id !== selectedExam._id));
      setFilteredExams(filteredExams.filter(exam => exam._id !== selectedExam._id));

      setIsDeleteModalOpen(false);
      toast.success('Exam deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete exam');
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterDepartment('');
    setFilterSemester('');
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const columns = [
    {
      header: 'Exam Name',
      accessor: 'examName',
      cell: (row) => (
        <div className="flex items-center">
          <BookOpen size={16} className="text-blue-600 mr-2" />
          <span>{row.examName || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
    },
    {
      header: 'Semester',
      accessor: 'semester',
    },
    {
      header: 'Exam Date',
      cell: (row) => (
        <div className="flex items-center">
          <Calendar size={16} className="text-green-600 mr-2" />
          <span>{formatDate(row.examDate)}</span>
        </div>
      ),
    },
    {
      header: 'Exam Time',
      cell: (row) => (
        <div className="flex items-center">
          <Clock size={16} className="text-orange-600 mr-2" />
          <span>{row.examTime}</span>
        </div>
      ),
    },
    {
      header: 'Location',
      cell: (row) => (
        <div className="flex items-center">
          <MapPin size={16} className="text-red-600 mr-2" />
          <span>{row.location || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <div className="flex items-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {row.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
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
              handleViewExam(row);
            }}
          >
            <Eye size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditExam(row);
            }}
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="outline"
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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">Exam Management</h1>
        <Button
          onClick={() => navigate('/exams/add')}
          className="flex items-center"
        >
          <Plus size={16} className="mr-1" />
          Add New Exam
        </Button>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Search"
              placeholder="Search by exam name, department, semester, or location"
              value={searchTerm}
              onChange={handleSearch}
              icon={<Search size={16} />}
            />
            <Select
              label="Department"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              options={[
                { value: '', label: 'All Departments' },
                ...departments
              ]}
            />
            <Select
              label="Semester"
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              options={[
                { value: '', label: 'All Semesters' },
                ...semesterOptions
              ]}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="flex items-center"
            >
              <Filter size={16} className="mr-1" />
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        {error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : (
          <Table
            columns={columns}
            data={filteredExams}
            isLoading={loading}
            emptyMessage="No exams found"
            onRowClick={handleViewExam}
          />
        )}
      </Card>

      {/* View Exam Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Exam Details"
      >
        {selectedExam && (
          <div className="space-y-6">
            {/* Exam Information */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <BookOpen className="mr-2 text-blue-600" size={18} />
                Exam Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Exam Name</h4>
                  <p className="mt-1 font-medium">{selectedExam.examName || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedExam.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedExam.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Location</h4>
                  <p className="mt-1">{selectedExam.location || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Created</h4>
                  <p className="mt-1">{formatDate(selectedExam.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Date and Time Information */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Calendar className="mr-2 text-green-600" size={18} />
                Date and Time
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Exam Date</h4>
                  <p className="mt-1">{formatDate(selectedExam.examDate)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Exam Time</h4>
                  <p className="mt-1">{selectedExam.examTime}</p>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <BookOpen className="mr-2 text-purple-600" size={18} />
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Department</h4>
                  <p className="mt-1">{selectedExam.department}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Semester</h4>
                  <p className="mt-1">{selectedExam.semester}</p>
                </div>
              </div>
            </div>

            {/* Priority Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Clock className="mr-2 text-orange-600" size={18} />
                Priority Information
              </h3>
              <div className="bg-blue-50 p-3 rounded text-blue-700 text-sm">
                <p>This exam is {selectedExam.isActive ? 'active' : 'inactive'} for priority ordering.</p>
                <p className="mt-2">
                  {selectedExam.isActive
                    ? 'Students and faculty can select this exam during checkout to receive priority processing for their orders.'
                    : 'This exam is currently not available for selection during checkout.'}
                </p>
              </div>
            </div>

            {/* Additional Notes */}
            {selectedExam.description && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500">Additional Notes</h4>
                <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{selectedExam.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
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
              onClick={handleDeleteExam}
              disabled={deleting}
            >
              {deleting ? <Loader size="sm" /> : 'Delete'}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this exam?</p>
        <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default ExamList;
