import api from './api';

// Get all canteens
export const getAllCanteens = async () => {
  try {
    const response = await api.get('/canteens');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch canteens' };
  }
};

// Get canteen by IDhid
export const getCanteenById = async (canteenId) => {
  try {
    // Ensure canteenId is a string
    const canteenIdStr = typeof canteenId === 'object'
      ? (canteenId._id ? canteenId._id.toString() : canteenId.toString())
      : canteenId.toString();

    console.log('Making API request to get canteen with ID:', canteenIdStr);
    const response = await api.get(`/canteens/${canteenIdStr}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching canteen details:', error);
    throw error.response?.data || { message: 'Failed to fetch canteen details' };
  }
};

// Create canteen (admin only)
export const createCanteen = async (canteenData) => {
  try {
    // Use FormData for file uploads
    const formData = new FormData();

    // Append text fields
    Object.keys(canteenData).forEach(key => {
      if (key !== 'image') {
        formData.append(key, canteenData[key]);
      }
    });

    // Append image if it exists
    if (canteenData.image) {
      formData.append('image', canteenData.image);
    }

    const response = await api.post('/canteens', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create canteen' };
  }
};

// Update canteen (admin only)
export const updateCanteen = async (canteenId, canteenData) => {
  try {
    // Use FormData for file uploads
    const formData = new FormData();

    // Append text fields
    Object.keys(canteenData).forEach(key => {
      if (key !== 'image') {
        formData.append(key, canteenData[key]);
      }
    });

    // Append image if it exists
    if (canteenData.image) {
      formData.append('image', canteenData.image);
    }

    const response = await api.put(`/canteens/${canteenId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update canteen' };
  }
};

// Delete canteen (admin only)
export const deleteCanteen = async (canteenId) => {
  try {
    const response = await api.delete(`/canteens/${canteenId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete canteen' };
  }
};

// Update canteen availability (canteen staff only)
export const updateCanteenAvailability = async (canteenId, isAvailable) => {
  try {
    const response = await api.patch(`/canteens/${canteenId}/availability`, { availability: isAvailable });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update canteen availability' };
  }
};
