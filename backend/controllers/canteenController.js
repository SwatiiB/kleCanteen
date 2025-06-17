import Canteen from '../models/Canteen.js';
import CanteenStaff from '../models/CanteenStaff.js';
import Menu from '../models/Menu.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// Create a new canteen
export const createCanteen = async (req, res) => {
  try {
    console.log('Creating canteen with request body:', JSON.stringify(req.body));
    console.log('File in request:', req.file ? `File exists at ${req.file.path}` : 'No file uploaded');

    const { name, location, contactNumber, openingTime, closingTime, description } = req.body;

    // Validate required fields
    if (!name || !location || !contactNumber || !openingTime || !closingTime) {
      return res.status(400).json({
        message: 'Missing required fields',
        requiredFields: ['name', 'location', 'contactNumber', 'openingTime', 'closingTime']
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

        const result = await uploadToCloudinary(req.file.path, 'kle-canteen/canteens');
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

    // Create new canteen
    const newCanteen = new Canteen({
      name,
      location,
      contactNumber,
      openingTime,
      closingTime,
      image: imageData,
      description
    });

    console.log('Saving canteen to database:', newCanteen);

    // Save canteen to database
    await newCanteen.save();
    console.log('Canteen saved successfully with ID:', newCanteen._id);

    res.status(201).json({
      message: 'Canteen created successfully',
      canteen: newCanteen
    });
  } catch (error) {
    console.error('Error creating canteen:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all canteens
export const getAllCanteens = async (req, res) => {
  try {
    const canteens = await Canteen.find();
    res.status(200).json(canteens);
  } catch (error) {
    console.error('Error getting all canteens:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get canteen by ID
export const getCanteenById = async (req, res) => {
  try {
    const canteen = await Canteen.findById(req.params.id);

    if (!canteen) {
      return res.status(404).json({ message: 'Canteen not found' });
    }

    res.status(200).json(canteen);
  } catch (error) {
    console.error('Error getting canteen by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update canteen
export const updateCanteen = async (req, res) => {
  try {
    console.log('Updating canteen with ID:', req.params.id);
    console.log('Update data:', JSON.stringify(req.body));
    console.log('File in request:', req.file ? `File exists at ${req.file.path}` : 'No file uploaded');

    const { name, location, contactNumber, availability, openingTime, closingTime, description } = req.body;

    // Find the canteen to update
    const canteen = await Canteen.findById(req.params.id);

    if (!canteen) {
      console.log('Canteen not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Canteen not found' });
    }

    console.log('Found canteen to update:', canteen);

    // Handle image upload if file exists
    let imageData = canteen.image || {};
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
        if (canteen.image && canteen.image.public_id) {
          console.log('Deleting old image from Cloudinary:', canteen.image.public_id);
          await deleteFromCloudinary(canteen.image.public_id);
        }

        // Upload new image
        console.log('Uploading new image to Cloudinary');
        const result = await uploadToCloudinary(req.file.path, 'kle-canteen/canteens');
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

    // Prepare update data
    const updateData = {
      ...(name && { name }),
      ...(location && { location }),
      ...(contactNumber && { contactNumber }),
      ...(availability !== undefined && { availability }),
      ...(openingTime && { openingTime }),
      ...(closingTime && { closingTime }),
      ...(description !== undefined && { description }),
      image: imageData
    };

    console.log('Updating canteen with data:', updateData);

    // Update canteen
    const updatedCanteen = await Canteen.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Canteen updated successfully:', updatedCanteen);

    res.status(200).json({
      message: 'Canteen updated successfully',
      canteen: updatedCanteen
    });
  } catch (error) {
    console.error('Error updating canteen:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete canteen with cascading delete for associated staff and menu items
export const deleteCanteen = async (req, res) => {
  try {
    console.log('Deleting canteen with ID:', req.params.id);
    const canteenId = req.params.id;

    // Find the canteen first to get the image data and verify it exists
    const canteen = await Canteen.findById(canteenId);

    if (!canteen) {
      console.log('Canteen not found with ID:', canteenId);
      return res.status(404).json({ message: 'Canteen not found' });
    }

    // Initialize deletion summary
    const deletionSummary = {
      canteenDeleted: false,
      staffDeleted: 0,
      menuItemsDeleted: 0,
      errors: []
    };

    // 1. Delete all canteen staff associated with this canteen
    try {
      console.log('Deleting canteen staff associated with canteen ID:', canteenId);
      const staffDeleteResult = await CanteenStaff.deleteMany({ canteenId });
      deletionSummary.staffDeleted = staffDeleteResult.deletedCount;
      console.log(`Deleted ${staffDeleteResult.deletedCount} canteen staff accounts`);
    } catch (staffError) {
      console.error('Error deleting canteen staff:', staffError);
      deletionSummary.errors.push({
        type: 'staff',
        message: staffError.message
      });
    }

    // 2. Delete all menu items associated with this canteen
    try {
      console.log('Finding menu items associated with canteen ID:', canteenId);

      // First find all menu items to get their image IDs
      const menuItems = await Menu.find({ canteenId });
      console.log(`Found ${menuItems.length} menu items to delete`);

      // Delete each menu item's image from Cloudinary if it exists
      for (const item of menuItems) {
        if (item.image && item.image.public_id) {
          try {
            console.log('Deleting menu item image from Cloudinary:', item.image.public_id);
            await deleteFromCloudinary(item.image.public_id);
          } catch (imageError) {
            console.error(`Error deleting image for menu item ${item._id}:`, imageError);
            deletionSummary.errors.push({
              type: 'menuItemImage',
              itemId: item._id,
              message: imageError.message
            });
          }
        }
      }

      // Delete all menu items from database
      const menuDeleteResult = await Menu.deleteMany({ canteenId });
      deletionSummary.menuItemsDeleted = menuDeleteResult.deletedCount;
      console.log(`Deleted ${menuDeleteResult.deletedCount} menu items`);
    } catch (menuError) {
      console.error('Error deleting menu items:', menuError);
      deletionSummary.errors.push({
        type: 'menuItems',
        message: menuError.message
      });
    }

    // 3. Delete the canteen's image from Cloudinary if it exists
    if (canteen.image && canteen.image.public_id) {
      try {
        console.log('Deleting canteen image from Cloudinary:', canteen.image.public_id);
        await deleteFromCloudinary(canteen.image.public_id);
        console.log('Canteen image deleted from Cloudinary successfully');
      } catch (imageError) {
        console.error('Error deleting canteen image:', imageError);
        deletionSummary.errors.push({
          type: 'canteenImage',
          message: imageError.message
        });
      }
    }

    // 4. Finally delete the canteen itself
    try {
      await Canteen.findByIdAndDelete(canteenId);
      deletionSummary.canteenDeleted = true;
      console.log('Canteen deleted successfully from database');
    } catch (canteenError) {
      console.error('Error deleting canteen:', canteenError);
      deletionSummary.errors.push({
        type: 'canteen',
        message: canteenError.message
      });
      return res.status(500).json({
        message: 'Failed to delete canteen',
        error: canteenError.message,
        deletionSummary
      });
    }

    // Check if there were any errors during the process
    if (deletionSummary.errors.length > 0) {
      console.warn('Canteen deletion completed with some errors:', deletionSummary.errors);
      return res.status(207).json({
        message: 'Canteen deleted with some errors',
        deletionSummary
      });
    }

    // All deletions successful
    res.status(200).json({
      message: 'Canteen and all associated data deleted successfully',
      deletionSummary
    });
  } catch (error) {
    console.error('Error in cascading delete of canteen:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update canteen availability
export const updateCanteenAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    // Find and update canteen availability
    const updatedCanteen = await Canteen.findByIdAndUpdate(
      req.params.id,
      { availability },
      { new: true }
    );

    if (!updatedCanteen) {
      return res.status(404).json({ message: 'Canteen not found' });
    }

    res.status(200).json({
      message: `Canteen is now ${availability ? 'available' : 'unavailable'}`,
      canteen: updatedCanteen
    });
  } catch (error) {
    console.error('Error updating canteen availability:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
