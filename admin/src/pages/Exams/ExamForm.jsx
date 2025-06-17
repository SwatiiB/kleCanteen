import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calendar, Clock, BookOpen, MapPin } from 'lucide-react';
import { getExamDetailById, createExamDetail, updateExamDetail } from '../../services/exam';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Select from '../../components/UI/Select';
import Loader from '../../components/UI/Loader';

const ExamForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

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

  const [formData, setFormData] = useState({
    examName: '',
    examDate: '',
    examTime: '',
    department: '',
    semester: '',
    location: '',
    description: '',
    startUniversityId: '',
    endUniversityId: '',
    isActive: true
  });

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      fetchExamDetails();
    }
  }, [id]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      const examDetail = await getExamDetailById(id);

      if (examDetail) {
        setFormData({
          examName: examDetail.examName || '',
          examDate: new Date(examDetail.examDate).toISOString().split('T')[0],
          examTime: examDetail.examTime || '',
          department: examDetail.department || '',
          semester: examDetail.semester || '',
          location: examDetail.location || '',
          description: examDetail.description || '',
          startUniversityId: examDetail.startUniversityId || '',
          endUniversityId: examDetail.endUniversityId || '',
          isActive: examDetail.isActive !== undefined ? examDetail.isActive : true
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch exam details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle checkbox inputs
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.examName) newErrors.examName = 'Exam name is required';
    if (!formData.examDate) newErrors.examDate = 'Exam date is required';
    if (!formData.examTime) newErrors.examTime = 'Exam time is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.semester) newErrors.semester = 'Semester is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.startUniversityId) newErrors.startUniversityId = 'Start University ID is required';
    if (!formData.endUniversityId) newErrors.endUniversityId = 'End University ID is required';

    // Validate exam date is not in the past
    if (formData.examDate) {
      const examDate = new Date(formData.examDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (examDate < today) {
        newErrors.examDate = 'Exam date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      // Create a copy of the form data
      const examData = { ...formData };

      // Ensure the date is properly formatted as a Date object
      // This helps prevent timezone issues when storing in MongoDB
      if (examData.examDate) {
        console.log('Original exam date:', examData.examDate);

        // Create a date object at noon to avoid timezone issues
        const dateParts = examData.examDate.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed in JS Date
        const day = parseInt(dateParts[2]);

        // Set time to noon to avoid timezone issues
        const examDate = new Date(year, month, day, 12, 0, 0);
        examData.examDate = examDate;

        console.log('Formatted exam date:', examDate.toISOString());
      }

      if (isEditMode) {
        await updateExamDetail(id, examData);
        toast.success('Exam updated successfully');
      } else {
        await createExamDetail(examData);
        toast.success('Exam created successfully');
      }

      navigate('/exams');
    } catch (error) {
      console.error('Error saving exam:', error);
      toast.error(error.message || 'Failed to save exam');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/exams')}
          className="mr-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Exams
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Exam' : 'Add New Exam'}
        </h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exam Details Section */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Calendar className="mr-2" size={20} />
                Exam Details
              </h3>
            </div>

            <Input
              label="Exam Name"
              type="text"
              id="examName"
              name="examName"
              value={formData.examName}
              onChange={handleChange}
              error={errors.examName}
              required
              placeholder="e.g., Data Structures and Algorithms Final Exam"
              helpText="Name of the exam"
            />

            <Input
              label="Location"
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              error={errors.location}
              required
              placeholder="e.g., Room 301, Main Building"
              helpText="Where the exam will take place"
              icon={<MapPin size={16} />}
            />

            <Input
              label="Exam Date"
              type="date"
              id="examDate"
              name="examDate"
              value={formData.examDate}
              onChange={handleChange}
              error={errors.examDate}
              required
              helpText="Date of the exam"
              icon={<Calendar size={16} />}
            />

            <Input
              label="Exam Time"
              type="time"
              id="examTime"
              name="examTime"
              value={formData.examTime}
              onChange={handleChange}
              error={errors.examTime}
              required
              helpText="Start time of the exam"
              icon={<Clock size={16} />}
            />

            {/* Academic Information Section */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BookOpen className="mr-2" size={20} />
                Academic Information
              </h3>
            </div>

            <Input
              label="Department"
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              error={errors.department}
              required
              placeholder="e.g., Computer Science"
              helpText="Academic department"
            />

            <Select
              label="Semester"
              id="semester"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              error={errors.semester}
              required
              options={[
                { value: '', label: 'Select Semester' },
                ...semesterOptions
              ]}
              helpText="Current semester of the student"
            />

            {/* University ID Range Section */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BookOpen className="mr-2" size={20} />
                University ID Range
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Define the range of university IDs that are eligible for priority orders for this exam.
                Only students with university IDs within this range will be approved for priority status.
              </p>
            </div>

            <Input
              label="Start University ID"
              type="text"
              id="startUniversityId"
              name="startUniversityId"
              value={formData.startUniversityId}
              onChange={handleChange}
              error={errors.startUniversityId}
              required
              placeholder="e.g., 01fe23mca001"
              helpText="First university ID in the range (case-sensitive)"
            />

            <Input
              label="End University ID"
              type="text"
              id="endUniversityId"
              name="endUniversityId"
              value={formData.endUniversityId}
              onChange={handleChange}
              error={errors.endUniversityId}
              required
              placeholder="e.g., 01fe23mca060"
              helpText="Last university ID in the range (case-sensitive)"
            />

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional information about the exam..."
              ></textarea>
              <p className="mt-1 text-xs text-gray-500">Optional notes about the exam</p>
            </div>

            <div className="md:col-span-2 mt-2">
              <div className="flex items-center">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-700">
                  Active Exam
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500 ml-6">
                Active exams are visible to students during checkout for priority ordering
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t mt-6">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate('/exams')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? <Loader size="sm" /> : isEditMode ? 'Update Exam' : 'Create Exam'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ExamForm;
