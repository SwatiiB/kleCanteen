import api from './api';

// Get exam details by user email
export const getExamDetailsByUser = async () => {
  try {
    const response = await api.get('/exams/user');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch exam details' };
  }
};

// Get exam details by department and semester
export const getExamDetailsByDeptSem = async (department, semester) => {
  try {
    const response = await api.get(`/exams/department/${department}/semester/${semester}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch exam details for this department and semester' };
  }
};

// Create a new exam detail
export const createExamDetail = async (examData) => {
  try {
    const response = await api.post('/exams', examData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create exam detail' };
  }
};

// Get upcoming exams for the current user
export const getUpcomingExams = async () => {
  try {
    const response = await api.get('/exams/upcoming');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch upcoming exams' };
  }
};

// Get exams scheduled within the next 24 hours
export const getExamsNext24Hours = async () => {
  try {
    console.log('Calling API endpoint: /exams/next24hours');
    const response = await api.get('/exams/next24hours');
    console.log('API response status:', response.status);
    return response.data;
  } catch (error) {
    console.error('API error in getExamsNext24Hours:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error.response?.data || { message: 'Failed to fetch exams for next 24 hours' };
  }
};

// Get all active exams
export const getActiveExams = async () => {
  try {
    const response = await api.get('/exams/active');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch active exams' };
  }
};
