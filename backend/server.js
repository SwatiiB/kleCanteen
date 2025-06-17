import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';

// Import routes
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import canteenStaffRoutes from './routes/canteenStaffRoutes.js';
import canteenRoutes from './routes/canteenRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import examRoutes from './routes/examRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import cartRoutes from './routes/cartRoutes.js';

// Ensure uploads directory exists
const uploadsDir = path.resolve(process.cwd(), 'backend/uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory:', uploadsDir);
  fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
}

// app config
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(cors());
connectDB();
connectCloudinary();

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'backend/uploads')));

// API endpoints
app.get('/', (req, res) => {
  res.send("KLE Canteen Food Delivery API Working");
});

// Direct test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Direct admin test route
app.post('/api/admin-test', (req, res) => {
  res.json({ message: 'Admin API is working' });
});

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/canteen-staff', canteenStaffRoutes);
app.use('/api/canteens', canteenRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/cart', cartRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
