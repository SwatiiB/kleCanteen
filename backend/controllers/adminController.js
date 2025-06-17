import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

// Register a new admin
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    // Create new admin
    const newAdmin = new Admin({
      name,
      email,
      password
    });

    // Save admin to database
    await newAdmin.save();

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Special case for default admin
    if (email === 'admin@example.com') {
      // Check if default admin exists
      let admin = await Admin.findOne({ email });

      // If default admin doesn't exist, create it
      if (!admin) {
        admin = new Admin({
          name: 'Admin',
          email: 'admin@example.com',
          password: 'adminpassword'
        });

        await admin.save();
      }

      // For default admin, check password directly
      if (password === 'adminpassword') {
        // Generate JWT token
        const token = jwt.sign(
          { id: admin._id, role: 'admin' },
          process.env.JWT_SECRET || 'fallback_jwt_secret_for_development',
          { expiresIn: '1d' }
        );

        return res.status(200).json({
          message: 'Login successful',
          token,
          admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email
          }
        });
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    // Regular admin login flow
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check password
    try {
      const isMatch = await admin.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (passwordError) {
      return res.status(500).json({
        message: 'Error verifying credentials',
        error: passwordError.message
      });
    }

    // Generate JWT token with fallback secret if needed
    const jwtSecret = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development';

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      jwtSecret,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token error', error: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error('Error getting admin profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update admin profile
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Find and update admin
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({
      message: 'Admin profile updated successfully',
      admin: updatedAdmin
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
