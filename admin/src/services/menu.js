import api from './api';

// Get all menu items
export const getAllMenuItems = async () => {
  try {
    const response = await api.get('/menu');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch menu items' };
  }
};

// Get menu items by canteen
export const getMenuItemsByCanteen = async (canteenId) => {
  try {
    // Ensure canteenId is a string
    const canteenIdStr = canteenId ? canteenId.toString() : null;

    if (!canteenIdStr) {
      throw new Error('Invalid canteen ID');
    }

    console.log('Fetching menu items for canteen ID:', canteenIdStr);
    const response = await api.get(`/menu/canteen/${canteenIdStr}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching menu items by canteen:', error);
    throw error.response?.data || { message: 'Failed to fetch menu items for this canteen' };
  }
};

// Get menu item by ID
export const getMenuItemById = async (menuItemId) => {
  try {
    console.log('Fetching menu item with ID:', menuItemId);
    const response = await api.get(`/menu/${menuItemId}`);
    console.log('API response for menu item:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching menu item:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch menu item details';
    throw { message: errorMessage, originalError: error };
  }
};

// Create menu item (admin and canteen staff)
export const createMenuItem = async (menuItemData) => {
  try {
    // Use FormData for file uploads
    const formData = new FormData();

    // Append text fields
    Object.keys(menuItemData).forEach(key => {
      if (key !== 'image') {
        formData.append(key, menuItemData[key]);
      }
    });

    // Append image if it exists
    if (menuItemData.image) {
      formData.append('image', menuItemData.image);
    }

    // Determine endpoint based on user role (stored in localStorage)
    const userRole = localStorage.getItem('userRole');
    const endpoint = userRole === 'canteen_staff' ? '/menu/canteen-staff' : '/menu';

    console.log(`Using endpoint ${endpoint} for user role: ${userRole}`);

    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create menu item' };
  }
};

// Create multiple menu items (admin only)
export const createMenuItems = async (menuItemsData) => {
  try {
    const response = await api.post('/menu/batch', menuItemsData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create menu items' };
  }
};

// Update menu item (admin and canteen staff)
export const updateMenuItem = async (menuItemId, menuItemData) => {
  try {
    console.log('Updating menu item with ID:', menuItemId);
    console.log('Update data:', menuItemData);

    // Use FormData for file uploads
    const formData = new FormData();

    // Append text fields
    Object.keys(menuItemData).forEach(key => {
      if (key !== 'image') {
        // Skip null or undefined values
        if (menuItemData[key] === null || menuItemData[key] === undefined) {
          console.log(`Skipping ${key} because it's null or undefined`);
          return;
        }

        // Special handling for canteenId to ensure it's properly sent
        if (key === 'canteenId') {
          console.log(`Appending canteenId with special handling:`, menuItemData[key]);
          formData.append('canteenId', menuItemData[key]);
          return;
        }

        // Convert boolean values to strings for FormData
        const value = typeof menuItemData[key] === 'boolean'
          ? menuItemData[key].toString()
          : menuItemData[key];

        console.log(`Appending ${key}:`, value);
        formData.append(key, value);
      }
    });

    // Append image if it exists
    if (menuItemData.image) {
      console.log('Appending image file');
      formData.append('image', menuItemData.image);
    } else {
      console.log('No new image to upload');
    }

    // Log FormData entries for debugging
    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    const response = await api.put(`/menu/${menuItemId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating menu item:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update menu item';
    throw { message: errorMessage, originalError: error };
  }
};

// Delete menu item (admin and canteen staff)
export const deleteMenuItem = async (menuItemId) => {
  try {
    const response = await api.delete(`/menu/${menuItemId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete menu item' };
  }
};

// Update menu item availability (canteen staff only)
export const updateMenuItemAvailability = async (menuItemId, isAvailable) => {
  try {
    const response = await api.patch(`/menu/${menuItemId}/availability`, { availability: isAvailable });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update menu item availability' };
  }
};
