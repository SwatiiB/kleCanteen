import CanteenStaff from '../models/CanteenStaff.js';
import Canteen from '../models/Canteen.js';
import jwt from 'jsonwebtoken';

// Register a new canteen staff
export const registerCanteenStaff = async (req, res) => {
  try {
    const { name, email, canteenId, contactNumber, password, _id, isUpdate } = req.body;

    // Check if this is an update operation
    if (isUpdate && _id) {
      console.log('Updating existing staff member with ID:', _id);

      // Find the staff member to update
      const staffToUpdate = await CanteenStaff.findById(_id);
      if (!staffToUpdate) {
        return res.status(404).json({ message: 'Canteen staff not found' });
      }

      // Check if email is being changed and if it's already in use
      if (email !== staffToUpdate.email) {
        const emailExists = await CanteenStaff.findOne({ email, _id: { $ne: _id } });
        if (emailExists) {
          return res.status(400).json({ message: 'Email is already in use by another staff member' });
        }
      }

      // Check if canteen is being changed and if it already has a staff member
      if (canteenId !== staffToUpdate.canteenId.toString()) {
        const canteenHasStaff = await CanteenStaff.findOne({
          canteenId,
          _id: { $ne: _id }
        });

        if (canteenHasStaff) {
          return res.status(400).json({
            message: 'A staff member is already registered for this canteen'
          });
        }
      }

      // Prepare update data
      const updateData = {
        name,
        email,
        canteenId,
        contactNumber
      };

      // Only update password if provided
      if (password) {
        updateData.password = password;
      }

      // Update staff
      const updatedStaff = await CanteenStaff.findByIdAndUpdate(
        _id,
        updateData,
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        message: 'Canteen staff updated successfully',
        staff: {
          id: updatedStaff._id,
          name: updatedStaff.name,
          email: updatedStaff.email
        }
      });
    }

    // This is a new staff registration

    // Check if staff already exists with this email
    const existingStaff = await CanteenStaff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ message: 'Staff already exists with this email' });
    }

    // Validate that the canteenId exists
    const canteenExists = await Canteen.findById(canteenId);
    if (!canteenExists) {
      return res.status(400).json({ message: 'Canteen does not exist with the provided ID' });
    }

    // Check if a staff already exists for this canteen
    const existingCanteenStaff = await CanteenStaff.findOne({ canteenId });
    if (existingCanteenStaff) {
      return res.status(400).json({ message: 'A staff member is already registered for this canteen' });
    }

    // Create new staff
    const newStaff = new CanteenStaff({
      name,
      email,
      canteenId,
      contactNumber,
      password
    });

    // Save staff to database
    await newStaff.save();

    res.status(201).json({ message: 'Canteen staff registered successfully' });
  } catch (error) {
    console.error('Error registering canteen staff:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login canteen staff
export const loginCanteenStaff = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    // Find staff by email
    const staff = await CanteenStaff.findOne({ email });
    console.log('Staff found:', staff ? 'Yes' : 'No');

    if (!staff) {
      console.log('No staff found with email:', email);
      return res.status(404).json({ message: 'Canteen staff not found' });
    }

    // Check password
    const isMatch = await staff.comparePassword(password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Extract canteenId correctly as a string
    // Handle both object and ObjectId cases
    const canteenIdStr = staff.canteenId._id ? staff.canteenId._id.toString() : staff.canteenId.toString();
    console.log('Extracted canteenId as string:', canteenIdStr);

    // Generate JWT token
    const token = jwt.sign(
      { id: staff._id, role: 'canteen_staff', canteenId: canteenIdStr },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        canteenId: canteenIdStr,
        contactNumber: staff.contactNumber
      }
    });
  } catch (error) {
    console.error('Error logging in canteen staff:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get canteen staff profile
export const getCanteenStaffProfile = async (req, res) => {
  try {
    const staff = await CanteenStaff.findById(req.user.id)
      .select('-password')
      .populate('canteenId', 'name location');

    if (!staff) {
      return res.status(404).json({ message: 'Canteen staff not found' });
    }

    // Create a modified response with canteenId as a string
    const staffData = staff.toObject();

    // Extract canteenId as a string
    if (staffData.canteenId) {
      const canteenIdStr = staffData.canteenId._id
        ? staffData.canteenId._id.toString()
        : staffData.canteenId.toString();

      // Create a modified canteen object with _id as a string
      staffData.canteenId = {
        ...staffData.canteenId,
        _id: canteenIdStr
      };

      // Also add a plain string version for direct access
      staffData.canteenIdStr = canteenIdStr;
    }

    console.log('Sending staff profile with canteenId:', staffData.canteenId);
    console.log('Sending staff profile with canteenIdStr:', staffData.canteenIdStr);

    res.status(200).json(staffData);
  } catch (error) {
    console.error('Error getting canteen staff profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update canteen staff profile
export const updateCanteenStaffProfile = async (req, res) => {
  try {
    const { name, email, contactNumber } = req.body;

    // Check if email is being updated and if it's already in use
    if (email) {
      const existingStaff = await CanteenStaff.findOne({ email, _id: { $ne: req.user.id } });
      if (existingStaff) {
        return res.status(400).json({ message: 'Email is already in use by another staff member' });
      }
    }

    // Find and update staff
    const updatedStaff = await CanteenStaff.findByIdAndUpdate(
      req.user.id,
      { name, email, contactNumber },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedStaff) {
      return res.status(404).json({ message: 'Canteen staff not found' });
    }

    res.status(200).json({
      message: 'Canteen staff profile updated successfully',
      staff: updatedStaff
    });
  } catch (error) {
    console.error('Error updating canteen staff profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all canteen staff (admin only)
export const getAllCanteenStaff = async (req, res) => {
  try {
    const staffList = await CanteenStaff.find()
      .select('-password')
      .populate('canteenId', 'name location');

    // Convert each staff's canteenId to a string format
    const formattedStaffList = staffList.map(staff => {
      const staffObj = staff.toObject();

      // Extract canteenId as a string
      if (staffObj.canteenId) {
        const canteenIdStr = staffObj.canteenId._id
          ? staffObj.canteenId._id.toString()
          : staffObj.canteenId.toString();

        // Create a modified canteen object with _id as a string
        staffObj.canteenId = {
          ...staffObj.canteenId,
          _id: canteenIdStr
        };

        // Also add a plain string version for direct access
        staffObj.canteenIdStr = canteenIdStr;
      }

      return staffObj;
    });

    res.status(200).json(formattedStaffList);
  } catch (error) {
    console.error('Error getting all canteen staff:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete canteen staff (admin only)
export const deleteCanteenStaff = async (req, res) => {
  try {
    console.log('Deleting canteen staff with ID:', req.params.id);

    // Find the staff member first to verify it exists
    const staff = await CanteenStaff.findById(req.params.id);

    if (!staff) {
      console.log('Canteen staff not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Canteen staff not found' });
    }

    // Delete the staff member
    await CanteenStaff.findByIdAndDelete(req.params.id);
    console.log('Canteen staff deleted successfully');

    res.status(200).json({
      message: 'Canteen staff deleted successfully',
      deletedStaff: {
        id: staff._id,
        name: staff.name,
        email: staff.email
      }
    });
  } catch (error) {
    console.error('Error deleting canteen staff:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
