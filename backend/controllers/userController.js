import User from '../models/User.js';
import Cart from '../models/Cart.js';
import OrderDetails from '../models/OrderDetails.js';
import Feedback from '../models/Feedback.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, phoneNo, password, role, department, semester, isPrivileged, privilegeReason } = req.body;

    // Check if required fields are provided
    if (!name || !email || !phoneNo || !password || !role || !department || !req.body.uniId) {
      return res.status(400).json({ message: 'Please provide all required fields including University ID' });
    }

    // Check if user already exists with the same email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Validate email domain
    if (!email || !email.endsWith('@kletech.ac.in')) {
      return res.status(400).json({ message: 'Email ID is not registered on KLE Institute of Technology. Please use your @kletech.ac.in email.' });
    }

    // Create new user
    const userData = {
      name,
      email,
      phoneNo,
      password,
      role,
      department,
      semester,
      isPrivileged,
      privilegeReason
    };

    // Check if uniId is empty
    if (!req.body.uniId || req.body.uniId.trim() === '') {
      return res.status(400).json({ message: 'University ID is required' });
    }

    // Check if uniId is already in use
    const existingUserWithUniId = await User.findOne({ uniId: req.body.uniId.trim() });
    if (existingUserWithUniId) {
      return res.status(400).json({ message: 'A user with this University ID already exists' });
    }
    userData.uniId = req.body.uniId.trim();

    const newUser = new User(userData);

    // Save user to database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);

    // Check for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: validationErrors[0] });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: 'user', userRole: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        uniId: user.uniId,
        role: user.role,
        department: user.department,
        semester: user.semester,
        isPrivileged: user.isPrivileged
      }
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phoneNo, department, semester } = req.body;

    // Check if email is being updated and validate it
    if (email) {
      if (!email.endsWith('@kletech.ac.in')) {
        return res.status(400).json({ message: 'Email ID is not registered on KLE Institute of Technology. Please use your @kletech.ac.in email.' });
      }

      // Check if email is already in use by another user
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use by another user' });
      }
    } else if (email === '') {
      return res.status(400).json({ message: 'Email cannot be empty. Please provide a valid @kletech.ac.in email.' });
    }

    // Prepare update data
    const updateData = { name, email, phoneNo, department, semester };

    // Handle uniId field
    if (req.body.hasOwnProperty('uniId')) {
      if (!req.body.uniId || req.body.uniId.trim() === '') {
        return res.status(400).json({ message: 'University ID is required and cannot be empty' });
      }

      // Check if uniId is already in use by another user
      const existingUserWithUniId = await User.findOne({
        uniId: req.body.uniId.trim(),
        _id: { $ne: req.user.id }
      });

      if (existingUserWithUniId) {
        return res.status(400).json({ message: 'A user with this University ID already exists' });
      }

      // Set the uniId in the update data
      updateData.uniId = req.body.uniId.trim();
    }

    // Find and update user (only reached if we're not unsetting uniId)
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);

    // Check for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: validationErrors[0] });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user and all associated data (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user to get their email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userEmail = user.email;

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Delete user's cart
      await Cart.findOneAndDelete({ userId }, { session });

      // 2. Delete user's feedback (using email as reference)
      await Feedback.deleteMany({ email: userEmail }, { session });

      // 3. Delete user's orders (using email as reference)
      await OrderDetails.deleteMany({ email: userEmail }, { session });

      // 4. Finally delete the user
      await User.findByIdAndDelete(userId, { session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        message: 'User and all associated data deleted successfully',
        deletedUser: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      // If an error occurs, abort the transaction
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validate input
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Please provide email and new password' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (error) {
    console.error('Error resetting password:', error);

    // Check for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: validationErrors[0] });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
