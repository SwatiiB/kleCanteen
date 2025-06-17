# KLE Canteen Backend Documentation

## Table of Contents
- [Dependencies and Packages](#dependencies-and-packages)
- [Architecture Overview](#architecture-overview)
- [Key Features](#key-features)
- [Data Models](#data-models)
- [API Endpoints](#api-endpoints)

## Dependencies and Packages

The backend uses the following packages:

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Fast, unopinionated web framework for Node.js, used for creating the API server and handling HTTP requests |
| mongoose | ^8.14.3 | MongoDB object modeling tool designed to work in an asynchronous environment, used for database operations |
| bcrypt | ^6.0.0 | Library for hashing passwords to securely store user credentials |
| jsonwebtoken | ^9.0.2 | Implementation of JSON Web Tokens for secure authentication between client and server |
| cloudinary | ^2.6.1 | Cloud service for image and video management, used for storing and serving images |
| cors | ^2.8.5 | Express middleware for enabling Cross-Origin Resource Sharing, allowing frontend to communicate with backend |
| dotenv | ^16.5.0 | Module that loads environment variables from a .env file into process.env |
| multer | ^1.4.5-lts.2 | Middleware for handling multipart/form-data, used for file uploads |
| razorpay | ^2.9.6 | Official Node.js SDK for Razorpay payment gateway integration |
| uuid | ^11.1.0 | Library for generating unique identifiers, used for order IDs and other unique fields |
| validator | ^13.15.0 | Library of string validators and sanitizers for input validation |
| node-fetch | ^3.3.2 | Light-weight module that brings window.fetch to Node.js, used for making HTTP requests |
| nodemon | ^3.1.10 | Utility that monitors for changes and automatically restarts the server (development dependency) |

## Architecture Overview

### Main Entry Point and Server Setup
The application's entry point is `server.js`, which:
- Configures Express server and middleware
- Connects to MongoDB and Cloudinary
- Sets up API routes
- Implements error handling
- Starts the server on the configured port (default: 5000)

```javascript
// server.js (simplified)
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';

// Import routes
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
// ... other route imports

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cors());
connectDB();
connectCloudinary();

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
// ... other routes

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
```

### Database Connection
MongoDB connection is managed in `config/mongodb.js`:
- Connects to MongoDB using the URI from environment variables
- Provides connection status logging

### API Routes Structure
Routes are organized by resource type in the `routes` directory:
- Each resource has its own router file (e.g., `userRoutes.js`, `canteenRoutes.js`)
- Routes are grouped by access level (public, user, admin, canteen staff)
- Each route is connected to a controller function

### Authentication and Authorization
- JWT-based authentication using `jsonwebtoken`
- Role-based access control implemented through middleware
- Three user roles: admin, user (students/faculty), and canteen staff
- Middleware functions in `middlewares/authMiddleware.js` protect routes based on role

### Middleware Implementation
Key middleware includes:
- `authMiddleware.js`: Authentication and role-based access control
- `uploadMiddleware.js`: File upload handling using Multer
- Error handling middleware in `server.js`

### Error Handling Approach
- Centralized error handling middleware in `server.js`
- Try-catch blocks in controllers with appropriate status codes
- Detailed error messages in development, simplified in production

## Key Features

### User Authentication and Role-Based Access Control
- Three user types: admin, regular users (students/faculty), and canteen staff
- JWT-based authentication with token expiration
- Password hashing using bcrypt
- Role-specific middleware to protect routes
- Email validation for institutional emails (@kletech.ac.in)

### Canteen and Menu Item Management
- CRUD operations for canteens and menu items
- Image upload and storage using Cloudinary
- Availability toggling for canteens and menu items
- Canteen-specific menu items
- Category-based organization of menu items

### Order Processing System
- Order creation with detailed item information
- Order status tracking (pending, confirmed, preparing, ready, delivered, completed, cancelled)
- Priority order system with additional fee (₹5)
- Different delivery time estimates based on priority status
- Automatic status transition from 'Delivered' to 'Completed'
- Special instructions and delivery address support

### Priority Order System
- Priority orders for students with exams and faculty with exam duties
- University ID validation against exam ranges
- Role-specific priority reasons
- Additional fee for priority orders
- Faster delivery time estimates for priority orders (5-10 minutes vs 10-20 minutes)

### Exam Management
- CRUD operations for exam details
- Department and semester-specific exams
- University ID range validation for priority orders
- Active/inactive exam status

### Image Upload and Storage
- Local temporary storage using Multer
- Cloud storage using Cloudinary
- Image optimization and transformation
- Secure URL generation
- Automatic cleanup of temporary files

### Cart Functionality and Persistence
- Database-backed cart storage for authenticated users
- Local storage fallback for non-authenticated users
- Cart item management (add, update, remove)
- Cart synchronization between devices

### Payment Integration
- Razorpay payment gateway integration
- Order creation and verification
- Payment status tracking
- Refund processing
- Secure signature verification

### Feedback and Rating System
- Order-specific feedback and ratings
- Multiple rating dimensions (food quality, service speed, app experience)
- Average rating calculation for canteens
- Staff response to feedback

## Data Models

### User Model
```javascript
{
  name: String,
  email: String, // @kletech.ac.in emails only
  uniId: String, // University ID
  phoneNo: String,
  password: String, // Hashed
  role: String, // 'student' or 'faculty'
  department: String,
  semester: String, // Required for students
  isPrivileged: Boolean,
  privilegeReason: String
}
```

### Admin Model
```javascript
{
  name: String,
  email: String,
  password: String // Hashed
}
```

### Canteen Staff Model
```javascript
{
  name: String,
  email: String,
  canteenId: ObjectId, // Reference to Canteen
  contactNumber: String,
  password: String, // Hashed
  memberId: String
}
```

### Canteen Model
```javascript
{
  name: String,
  location: String,
  contactNumber: String,
  availability: Boolean,
  openingTime: String,
  closingTime: String,
  image: {
    url: String,
    public_id: String
  },
  ratings: {
    averageRating: Number,
    totalRatings: Number,
    foodQuality: Number,
    serviceSpeed: Number,
    appExperience: Number
  }
}
```

### Menu Model
```javascript
{
  itemId: String, // UUID
  itemName: String,
  canteenId: ObjectId, // Reference to Canteen
  availability: Boolean,
  category: String,
  price: Number,
  description: String,
  image: {
    url: String,
    public_id: String
  },
  preparationTime: Number, // in minutes
  isVegetarian: Boolean
}
```

### Order Details Model
```javascript
{
  orderId: String, // UUID
  email: String, // Reference to User
  orderDate: Date,
  orderTime: String,
  items: [
    {
      itemId: ObjectId, // Reference to Menu
      quantity: Number,
      price: Number
    }
  ],
  status: String, // enum: 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'
  totalAmount: Number,
  canteenId: ObjectId, // Reference to Canteen
  examId: ObjectId, // Reference to ExamDetails
  priority: Boolean,
  priorityReason: String,
  priorityDetails: String,
  priorityFee: Number,
  pickupTime: String,
  specialInstructions: String,
  deliveryAddress: String
}
```

### Payment Model
```javascript
{
  orderId: ObjectId, // Reference to OrderDetails
  paymentTime: String,
  paymentMethod: String,
  paymentStatus: String, // 'completed', 'failed', 'refunded'
  transactionId: String,
  email: String, // Reference to User
  amount: Number,
  razorpayDetails: {
    orderId: String,
    paymentId: String,
    signature: String
  }
}
```

### Exam Details Model
```javascript
{
  examId: String, // UUID
  examName: String,
  examDate: Date,
  examTime: String,
  department: String,
  semester: String,
  location: String,
  description: String,
  startUniversityId: String,
  endUniversityId: String,
  isActive: Boolean
}
```

### Feedback Model
```javascript
{
  orderId: ObjectId, // Reference to OrderDetails
  email: String, // Reference to User
  rating: Number,
  comment: String,
  foodQuality: Number,
  serviceSpeed: Number,
  appExperience: Number,
  canteenId: ObjectId, // Reference to Canteen
  isResolved: Boolean,
  staffResponse: String
}
```

### Cart Model
```javascript
{
  userId: ObjectId, // Reference to User
  items: [
    {
      itemId: ObjectId, // Reference to Menu
      quantity: Number,
      price: Number,
      name: String,
      image: {
        url: String,
        public_id: String
      },
      canteenId: ObjectId // Reference to Canteen
    }
  ],
  lastUpdated: Date
}
```

## API Endpoints

The backend provides 61 API endpoints across various categories:

| Category | Count | Description |
|----------|-------|-------------|
| Authentication | 6 | Admin, User, and Canteen Staff login/register endpoints |
| User | 4 | Endpoints for managing user profiles and data |
| Canteen | 6 | Endpoints for managing canteens |
| Menu | 8 | Endpoints for managing menu items |
| Order | 8 | Endpoints for creating and managing orders |
| Payment | 6 | Endpoints for payment processing |
| Exam | 8 | Endpoints for managing exam details |
| Feedback | 8 | Endpoints for managing user feedback |
| Cart | 5 | Endpoints for managing user cart |
| Test | 2 | Test endpoints for API verification |

For detailed API documentation with request/response examples, refer to the `api-endpoints.md` file.