import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import CanteenStaff from '../models/CanteenStaff.js';

// Protect routes - verify token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token with fallback secret if needed
    const jwtSecret = process.env.JWT_SECRET || 'fallback_jwt_secret_for_development';
    const decoded = jwt.verify(token, jwtSecret);

    // Add user info to request
    req.user = decoded;

    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Admin only middleware
export const adminOnly = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied, admin only' });
    }

    // Check if admin exists
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    next();
  } catch (error) {
    console.error('Error in admin middleware:', error);
    res.status(401).json({ message: 'Not authorized, admin only' });
  }
};

// User only middleware
export const userOnly = async (req, res, next) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Access denied, user only' });
    }

    // Check if user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user's email to the request object for easier access in controllers
    req.user.email = user.email;

    // Add user's uniId to the request object if it exists
    if (user.uniId) {
      req.user.uniId = user.uniId;
    }

    // Add user's semester to the request object if it exists
    if (user.semester) {
      req.user.semester = user.semester;
    }

    // Add user's role (student/faculty) to the request object
    req.user.userRole = user.role;

    next();
  } catch (error) {
    console.error('Error in user middleware:', error);
    res.status(401).json({ message: 'Not authorized, user only' });
  }
};

// Canteen staff only middleware
export const canteenStaffOnly = async (req, res, next) => {
  try {
    if (req.user.role !== 'canteen_staff') {
      return res.status(403).json({ message: 'Access denied, canteen staff only' });
    }

    // Check if canteen staff exists
    const staff = await CanteenStaff.findById(req.user.id);
    if (!staff) {
      return res.status(401).json({ message: 'Canteen staff not found' });
    }

    // Add canteenId to request for easier access in controllers
    // Handle both object and ObjectId cases and ensure it's a string
    req.canteenId = staff.canteenId._id
      ? staff.canteenId._id.toString()
      : staff.canteenId.toString();

    // Also add canteenId from token if available (should be a string already)
    if (req.user.canteenId) {
      // Use the canteenId from the token as it's already a string
      req.canteenId = req.user.canteenId;
    }

    next();
  } catch (error) {
    console.error('Error in canteen staff middleware:', error);
    res.status(401).json({ message: 'Not authorized, canteen staff only' });
  }
};
