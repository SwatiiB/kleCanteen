import api from './api';

// Get all exam details (admin only)
export const getAllExamDetails = async () => {
  try {
    const response = await api.get('/exams');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch exam details' };
  }
};

// Get exam details by ID
export const getExamDetailById = async (examId) => {
  try {
    const response = await api.get(`/exams/${examId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch exam detail' };
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

// Update an exam detail
export const updateExamDetail = async (examId, examData) => {
  try {
    const response = await api.put(`/exams/${examId}`, examData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update exam detail' };
  }
};

// Delete an exam detail
export const deleteExamDetail = async (examId) => {
  try {
    const response = await api.delete(`/exams/${examId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete exam detail' };
  }
};
