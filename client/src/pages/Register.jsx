import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import Button from '../components/UI/Button';
import Loader from '../components/UI/Loader';

const Register = () => {
  // Department options
  const departmentOptions = [
    { value: '', label: 'Select your department' },
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
    { value: 'Civil Engineering', label: 'Civil Engineering' },
    { value: 'Electronics & Communication', label: 'Electronics & Communication' },
    { value: 'Electrical & Electronics Engineering', label: 'Electrical & Electronics Engineering' },
    { value: 'Department of Automation & Robotics', label: 'Department of Automation & Robotics' },
    { value: 'Department of Biotechnology', label: 'Department of Biotechnology' },
    { value: 'Architecture', label: 'Architecture' },
    { value: 'Department of Computer Application', label: 'Department of Computer Application' },
    { value: 'Department of Commerce', label: 'Department of Commerce' },
    { value: 'Management Studies and Research', label: 'Management Studies and Research' },
    { value: 'Fashion Design', label: 'Fashion Design' },
    { value: 'MBA', label: 'MBA' },
    { value: 'MCA', label: 'MCA' },
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNo: '',
    uniId: '', // University ID
    role: 'student', // Default role
    department: '',
    semester: '',
  });
  const [errors, setErrors] = useState({});
  const { register, login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@kletech\.ac\.in$/.test(formData.email)) {
      newErrors.email = 'Email must be a valid @kletech.ac.in email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phoneNo) {
      newErrors.phoneNo = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phoneNo)) {
      newErrors.phoneNo = 'Phone number must be 10 digits';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (formData.role === 'student' && !formData.semester) {
      newErrors.semester = 'Semester is required for students';
    }

    if (!formData.uniId) {
      newErrors.uniId = 'University ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Remove confirmPassword from data sent to API
      const { confirmPassword, ...userData } = formData;



      // Register the user
      await register(userData);
      toast.success('Registration successful!');

      // Automatically log in the user
      await login({
        email: formData.email,
        password: formData.password,
      });

      navigate('/');
    } catch (error) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      console.error('Registration error:', error);

      // If the error is about missing fields, show a more specific message
      if (errorMessage.includes('Please provide all required fields')) {
        toast.error('Please fill in all required fields: name, email, password, phone number, university ID, role, and department.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="text-gray-600 mt-2">
            Fill in your details to register
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           
              <Input
                label="Full Name"
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                error={errors.name}
                required
              />

              <Input
                label="Email"
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                error={errors.email}
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                id="phoneNo"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleChange}
                placeholder="Enter your phone number"
                error={errors.phoneNo}
                required
              />

              <Input
                label="University ID"
                type="text"
                id="uniId"
                name="uniId"
                value={formData.uniId}
                onChange={handleChange}
                placeholder="Enter your university ID"
                error={errors.uniId}
                required
              />

            
           
              <Input
                label="Password"
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                error={errors.password}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                error={errors.confirmPassword}
                required
              />
              

              <Select
                label="Department"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                options={departmentOptions}
                error={errors.department}
                required
              />
  <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={formData.role === 'student'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Student</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="faculty"
                      checked={formData.role === 'faculty'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Faculty</span>
                  </label>
                </div>
                {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
              </div>
              
              {formData.role === 'student' && (
                <Input
                  label="Semester"
                  type="text"
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  placeholder="Enter your semester"
                  error={errors.semester}
                  required
                />
              )}
              

            </div>

            {/* Full-width button at the bottom */}
            <div className="md:col-span-2 mt-4">
              <Button
                type="submit"
                fullWidth
                disabled={loading}
              >
                {loading ? <Loader size="sm" className="mr-2" /> : null}
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Login here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;
