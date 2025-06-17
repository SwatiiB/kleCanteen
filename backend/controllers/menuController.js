import Menu from '../models/Menu.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Create a new menu item
export const createMenuItem = async (req, res) => {
  try {
    console.log('Creating menu item with request body:', JSON.stringify(req.body));
    console.log('File in request:', req.file ? `File exists at ${req.file.path}` : 'No file uploaded');

    const {
      itemName,
      canteenId: bodyCanteenId,
      category,
      price,
      description,
      preparationTime,
      isVegetarian
    } = req.body;

    // Determine canteen ID based on user role
    // If canteen staff, use the canteenId from their profile
    // If admin, use the canteenId from the request body
    let canteenId;
    if (req.user.role === 'canteen_staff' && req.canteenId) {
      canteenId = req.canteenId;
      console.log('Using canteen ID from staff profile:', canteenId);
    } else {
      canteenId = bodyCanteenId;
      console.log('Using canteen ID from request body:', canteenId);
    }

    // Validate required fields
    if (!itemName || !canteenId || !category || !price) {
      return res.status(400).json({
        message: 'Missing required fields',
        requiredFields: ['itemName', 'category', 'price', ...(req.user.role === 'admin' ? ['canteenId'] : [])]
      });
    }

    // Handle image upload if file exists
    let imageData = {};
    if (req.file) {
      try {
        console.log('File details:', {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          encoding: req.file.encoding,
          mimetype: req.file.mimetype,
          destination: req.file.destination,
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size
        });

        const result = await uploadToCloudinary(req.file.path, 'kle-canteen/menu');
        imageData = {
          url: result.url,
          public_id: result.public_id
        };
        console.log('Successfully uploaded to Cloudinary:', imageData);
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
        return res.status(400).json({
          message: 'Error uploading image to Cloudinary',
          error: uploadError.message
        });
      }
    } else {
      console.log('No image file provided in the request');
    }

    // Create new menu item
    const newMenuItem = new Menu({
      itemId: uuidv4(), // Generate a unique itemId
      itemName,
      canteenId,
      category,
      price,
      description,
      image: imageData,
      preparationTime: preparationTime || 10, // Default to 10 minutes if not provided
      isVegetarian: isVegetarian !== undefined ? isVegetarian : true // Default to true if not provided
    });

    console.log('Saving menu item to database:', newMenuItem);

    // Save menu item to database
    await newMenuItem.save();
    console.log('Menu item saved successfully with ID:', newMenuItem._id);

    res.status(201).json({
      message: 'Menu item created successfully',
      menuItem: newMenuItem
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all menu items
export const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await Menu.find().populate('canteenId', 'name location');
    res.status(200).json(menuItems);
  } catch (error) {
    console.error('Error getting all menu items:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get menu items by canteen ID
export const getMenuItemsByCanteen = async (req, res) => {
  try {
    const menuItems = await Menu.find({ canteenId: req.params.canteenId })
      .populate('canteenId', 'name location');

    res.status(200).json(menuItems);
  } catch (error) {
    console.error('Error getting menu items by canteen:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get menu item by ID
export const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id)
      .populate('canteenId', 'name location');

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json(menuItem);
  } catch (error) {
    console.error('Error getting menu item by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    console.log('Updating menu item with ID:', req.params.id);
    console.log('Update data (raw):', req.body);
    console.log('Update data keys:', Object.keys(req.body));
    console.log('File in request:', req.file ? `File exists at ${req.file.path}` : 'No file uploaded');

    // Log each field from the form data
    console.log('Form data fields:');
    for (const key in req.body) {
      console.log(`${key}: ${req.body[key]}`);
    }

    const {
      itemName,
      canteenId,
      category,
      price,
      availability,
      description,
      preparationTime,
      isVegetarian
    } = req.body;

    console.log('Extracted canteenId from request body:', canteenId);

    // Find the menu item to update
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      console.log('Menu item not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Check permissions based on role
    if (req.user.role === 'canteen_staff') {
      // Canteen staff can only update items from their own canteen
      if (menuItem.canteenId.toString() !== req.canteenId.toString()) {
        return res.status(403).json({
          message: 'Access denied. You can only update menu items from your own canteen.'
        });
      }
    }

    console.log('Found menu item to update:', menuItem);

    // Handle image upload if file exists
    let imageData = menuItem.image;
    if (req.file) {
      try {
        console.log('File details:', {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          encoding: req.file.encoding,
          mimetype: req.file.mimetype,
          destination: req.file.destination,
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size
        });

        // Delete old image from Cloudinary if it exists
        if (menuItem.image && menuItem.image.public_id) {
          console.log('Deleting old image from Cloudinary:', menuItem.image.public_id);
          await deleteFromCloudinary(menuItem.image.public_id);
        }

        // Upload new image
        console.log('Uploading new image to Cloudinary');
        const result = await uploadToCloudinary(req.file.path, 'kle-canteen/menu');
        imageData = {
          url: result.url,
          public_id: result.public_id
        };
        console.log('Successfully uploaded new image to Cloudinary:', imageData);
      } catch (uploadError) {
        console.error('Error handling image update:', uploadError);
        return res.status(400).json({
          message: 'Error updating image',
          error: uploadError.message
        });
      }
    }

    // Prepare update data - include all fields that are present in the request
    // regardless of their truthiness
    // When using multipart/form-data, req.body is not a standard JavaScript object
    // so we need to check for field existence differently
    console.log('Request body:', req.body);

    // Create a standard object from the form data
    const updateData = {};

    // Check if fields exist in req.body and add them to updateData
    if (itemName !== undefined) updateData.itemName = itemName;
    if (canteenId !== undefined) updateData.canteenId = canteenId;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (availability !== undefined) updateData.availability = availability === 'true' || availability === true;
    if (description !== undefined) updateData.description = description || '';
    if (preparationTime !== undefined) updateData.preparationTime = parseInt(preparationTime) || menuItem.preparationTime;
    if (isVegetarian !== undefined) updateData.isVegetarian = isVegetarian === 'true' || isVegetarian === true;

    console.log('canteenId being set in updateData:', canteenId);

    // Always include the image data
    updateData.image = imageData;

    console.log('Updating menu item with data:', updateData);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request body values:', Object.values(req.body));

    try {
      // Update menu item
      const updatedMenuItem = await Menu.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('canteenId', 'name location');

      if (!updatedMenuItem) {
        console.error('Menu item not found after update attempt');
        return res.status(404).json({ message: 'Menu item not found after update' });
      }

      console.log('Menu item updated successfully:', updatedMenuItem);

      // Verify the update by fetching the item again
      const verifiedItem = await Menu.findById(req.params.id);
      console.log('Verified menu item after update:', verifiedItem);

      res.status(200).json({
        message: 'Menu item updated successfully',
        menuItem: updatedMenuItem
      });
    } catch (innerError) {
      console.error('Error during menu item update:', innerError);
      throw innerError; // Re-throw to be caught by the outer catch block
    }
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Check permissions based on role
    if (req.user.role === 'canteen_staff') {
      // Canteen staff can only delete items from their own canteen
      if (menuItem.canteenId.toString() !== req.canteenId.toString()) {
        return res.status(403).json({
          message: 'Access denied. You can only delete menu items from your own canteen.'
        });
      }
    }

    // Delete image from Cloudinary if it exists
    if (menuItem.image && menuItem.image.public_id) {
      await deleteFromCloudinary(menuItem.image.public_id);
    }

    // Delete menu item from database
    await Menu.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update menu item availability
export const updateMenuItemAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    // Find and update menu item availability
    const updatedMenuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      { availability },
      { new: true }
    );

    if (!updatedMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json({
      message: `Menu item is now ${availability ? 'available' : 'unavailable'}`,
      menuItem: updatedMenuItem
    });
  } catch (error) {
    console.error('Error updating menu item availability:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create multiple menu items
export const createMenuItems = async (req, res) => {
  try {
    console.log('Creating multiple menu items with request body:', JSON.stringify(req.body));

    // Check if menuItems array exists in the request body
    if (!req.body.menuItems || !Array.isArray(req.body.menuItems) || req.body.menuItems.length === 0) {
      return res.status(400).json({
        message: 'Missing or invalid menuItems array',
        requiredFormat: {
          menuItems: [
            {
              itemName: 'Item 1',
              canteenId: 'canteen_id',
              category: 'category',
              price: 100,
              description: 'description',
              preparationTime: 10,
              isVegetarian: true
            }
          ]
        }
      });
    }

    const { menuItems } = req.body;
    const createdMenuItems = [];
    const errors = [];

    // Process each menu item
    for (let i = 0; i < menuItems.length; i++) {
      const item = menuItems[i];

      // Validate required fields for each item
      if (!item.itemName || !item.canteenId || !item.category || !item.price) {
        errors.push({
          index: i,
          message: 'Missing required fields',
          requiredFields: ['itemName', 'canteenId', 'category', 'price'],
          item
        });
        continue;
      }

      try {
        // Create new menu item
        const newMenuItem = new Menu({
          itemId: uuidv4(), // Generate a unique itemId for each item
          itemName: item.itemName,
          canteenId: item.canteenId,
          category: item.category,
          price: item.price,
          description: item.description || '',
          image: item.image || {},
          preparationTime: item.preparationTime || 10,
          isVegetarian: item.isVegetarian !== undefined ? item.isVegetarian : true
        });

        // Save menu item to database
        await newMenuItem.save();
        console.log('Menu item saved successfully with ID:', newMenuItem._id);

        createdMenuItems.push(newMenuItem);
      } catch (itemError) {
        console.error(`Error creating menu item at index ${i}:`, itemError);
        errors.push({
          index: i,
          message: 'Error creating menu item',
          error: itemError.message,
          item
        });
      }
    }

    // Return response with created items and any errors
    res.status(201).json({
      message: `Created ${createdMenuItems.length} menu items successfully${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
      menuItems: createdMenuItems,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error creating multiple menu items:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
