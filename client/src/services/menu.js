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
    const response = await api.get(`/menu/canteen/${canteenId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch menu items for this canteen' };
  }
};

// Get menu item by ID
export const getMenuItemById = async (menuItemId) => {
  try {
    const response = await api.get(`/menu/${menuItemId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch menu item details' };
  }
};
