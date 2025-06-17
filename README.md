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






# KLE Canteen API Documentation

This document provides a comprehensive reference for all API endpoints in the KLE Canteen application. Use this documentation for testing with Postman or integrating with frontend applications.

## Base URL
```
http://localhost:5000
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## API Summary

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
| **Total** | **61** | |

## Test Endpoints

### Root Endpoint
- **URL**: `/`
- **Method**: GET
- **Auth Required**: No
- **Description**: Returns a message indicating the API is working
- **Response**: "KLE Canteen Food Delivery API Working"

### API Test
- **URL**: `/api/test`
- **Method**: GET
- **Auth Required**: No
- **Description**: Simple endpoint to check if the API is working
- **Response**:
```json
{
  "message": "API is working"
}
```

## Authentication Endpoints

### Admin Registration
- **URL**: `/api/admin/register`
- **Method**: POST
- **Auth Required**: No
- **Request Body**:
```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "adminpassword"
}
```
- **Response**: 201 Created
```json
{
  "message": "Admin registered successfully"
}
```

### Admin Login
- **URL**: `/api/admin/login`
- **Method**: POST
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "adminpassword"
}
```
- **Response**: 200 OK
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "admin": {
    "id": "admin_id",
    "name": "Admin Name",
    "email": "admin@example.com"
  }
}
```

### User Registration
- **URL**: `/api/users/register`
- **Method**: POST
- **Auth Required**: No
- **Request Body**:
```json
{
  "name": "User Name",
  "email": "student@kletech.ac.in",
  "phoneNo": "1234567890",
  "password": "userpassword",
  "role": "student",
  "department": "CSE",
  "semester": "6",
  "uniId": "01FE23MCA001"
}
```
- **Response**: 201 Created
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "student@kletech.ac.in"
  }
}
```

### User Login
- **URL**: `/api/users/login`
- **Method**: POST
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "student@kletech.ac.in",
  "password": "userpassword"
}
```
- **Response**: 200 OK
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "student@kletech.ac.in",
    "role": "student"
  }
}
```

### Canteen Staff Registration (Admin only)
- **URL**: `/api/canteen-staff/register`
- **Method**: POST
- **Auth Required**: Yes (Admin)
- **Headers**:
```
Authorization: Bearer <admin_token>
```
- **Request Body**:
```json
{
  "name": "Staff Name",
  "email": "staff@example.com",
  "password": "staffpassword",
  "canteenId": "canteen_id",
  "contactNumber": "1234567890"
}
```
- **Response**: 201 Created
```json
{
  "message": "Canteen staff registered successfully",
  "staff": {
    "id": "staff_id",
    "name": "Staff Name",
    "email": "staff@example.com",
    "canteenId": "canteen_id"
  }
}
```

### Canteen Staff Login
- **URL**: `/api/canteen-staff/login`
- **Method**: POST
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "staff@example.com",
  "password": "staffpassword"
}
```
- **Response**: 200 OK
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "staff": {
    "id": "staff_id",
    "name": "Staff Name",
    "email": "staff@example.com",
    "canteenId": "canteen_id",
    "contactNumber": "1234567890"
  }
}
```

### Delete Canteen Staff (Admin only)
- **URL**: `/api/canteen-staff/:id`
- **Method**: DELETE
- **Auth Required**: Yes (Admin)
- **Headers**:
```
Authorization: Bearer <admin_token>
```
- **Response**: 200 OK
```json
{
  "message": "Canteen staff deleted successfully"
}
```

## User Endpoints

### Get User Profile
- **URL**: `/api/users/profile`
- **Method**: GET
- **Auth Required**: Yes (User)
- **Headers**:
```
Authorization: Bearer <user_token>
```
- **Response**: 200 OK
```json
{
  "user": {
    "_id": "user_id",
    "name": "User Name",
    "email": "student@kletech.ac.in",
    "phoneNo": "1234567890",
    "role": "student",
    "department": "CSE",
    "semester": "6",
    "uniId": "01FE23MCA001",
    "createdAt": "2023-06-01T10:30:00.000Z",
    "updatedAt": "2023-06-01T10:30:00.000Z"
  }
}
```

### Update User Profile
- **URL**: `/api/users/profile`
- **Method**: PUT
- **Auth Required**: Yes (User)
- **Headers**:
```
Authorization: Bearer <user_token>
Content-Type: application/json
```
- **Request Body**:
```json
{
  "name": "Updated Name",
  "phoneNo": "9876543210",
  "department": "ECE",
  "semester": "7"
}
```
- **Response**: 200 OK
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "user_id",
    "name": "Updated Name",
    "email": "student@kletech.ac.in",
    "phoneNo": "9876543210",
    "department": "ECE",
    "semester": "7",
    "updatedAt": "2023-06-01T11:00:00.000Z"
  }
}
```

### Get All Users (Admin only)
- **URL**: `/api/users`
- **Method**: GET
- **Auth Required**: Yes (Admin)
- **Headers**:
```
Authorization: Bearer <admin_token>
```
- **Response**: 200 OK
```json
[
  {
    "_id": "user_id",
    "name": "User Name",
    "email": "student@kletech.ac.in",
    "phoneNo": "1234567890",
    "role": "student",
    "department": "CSE",
    "semester": "6",
    "uniId": "01FE23MCA001",
    "createdAt": "2023-06-01T10:30:00.000Z"
  }
]
```

### Get User by ID (Admin only)
- **URL**: `/api/users/:id`
- **Method**: GET
- **Auth Required**: Yes (Admin)
- **Headers**:
```
Authorization: Bearer <admin_token>
```
- **Response**: 200 OK
```json
{
  "user": {
    "_id": "user_id",
    "name": "User Name",
    "email": "student@kletech.ac.in",
    "phoneNo": "1234567890",
    "role": "student",
    "department": "CSE",
    "semester": "6",
    "uniId": "01FE23MCA001",
    "createdAt": "2023-06-01T10:30:00.000Z",
    "updatedAt": "2023-06-01T10:30:00.000Z"
  }
}
```

## Canteen Endpoints

### Get All Canteens
- **URL**: `/api/canteens`
- **Method**: GET
- **Auth Required**: No
- **Response**: 200 OK
```json
[
  {
    "_id": "canteen_id",
    "name": "Canteen Name",
    "location": "Location",
    "contactNumber": "1234567890",
    "availability": true,
    "openingTime": "08:00",
    "closingTime": "20:00",
    "image": {
      "url": "image_url",
      "public_id": "cloudinary_public_id"
    },
    "ratings": {
      "averageRating": 4.5,
      "totalRatings": 10,
      "foodQuality": 4.6,
      "serviceSpeed": 4.3,
      "appExperience": 4.7
    }
  }
]
```

### Get Canteen by ID
- **URL**: `/api/canteens/:id`
- **Method**: GET
- **Auth Required**: No
- **Response**: 200 OK
```json
{
  "_id": "canteen_id",
  "name": "Canteen Name",
  "location": "Location",
  "contactNumber": "1234567890",
  "availability": true,
  "openingTime": "08:00",
  "closingTime": "20:00",
  "image": {
    "url": "image_url",
    "public_id": "cloudinary_public_id"
  },
  "ratings": {
    "averageRating": 4.5,
    "totalRatings": 10,
    "foodQuality": 4.6,
    "serviceSpeed": 4.3,
    "appExperience": 4.7
  }
}
```

### Create Canteen (Admin only)
- **URL**: `/api/canteens`
- **Method**: POST
- **Auth Required**: Yes (Admin)
- **Headers**:
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```
- **Request Body**:
```
name: Canteen Name
location: Location
contactNumber: 1234567890
openingTime: 08:00
closingTime: 20:00
image: [file upload]
```
- **Response**: 201 Created
```json
{
  "message": "Canteen created successfully",
  "canteen": {
    "_id": "canteen_id",
    "name": "Canteen Name",
    "location": "Location",
    "contactNumber": "1234567890",
    "availability": true,
    "openingTime": "08:00",
    "closingTime": "20:00",
    "image": {
      "url": "image_url",
      "public_id": "cloudinary_public_id"
    }
  }
}
```

### Update Canteen (Admin only)
- **URL**: `/api/canteens/:id`
- **Method**: PUT
- **Auth Required**: Yes (Admin)
- **Headers**:
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```
- **Request Body**:
```
name: Updated Canteen Name
location: Updated Location
contactNumber: 9876543210
openingTime: 09:00
closingTime: 21:00
image: [file upload]
```
- **Response**: 200 OK
```json
{
  "message": "Canteen updated successfully",
  "canteen": {
    "_id": "canteen_id",
    "name": "Updated Canteen Name",
    "location": "Updated Location",
    "contactNumber": "9876543210",
    "availability": true,
    "openingTime": "09:00",
    "closingTime": "21:00",
    "image": {
      "url": "updated_image_url",
      "public_id": "updated_cloudinary_public_id"
    }
  }
}
```

### Update Canteen Availability (Admin only)
- **URL**: `/api/canteens/:id/availability`
- **Method**: PATCH
- **Auth Required**: Yes (Admin)
- **Headers**:
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```
- **Request Body**:
```json
{
  "availability": false
}
```
- **Response**: 200 OK
```json
{
  "message": "Canteen availability updated successfully",
  "canteen": {
    "_id": "canteen_id",
    "name": "Canteen Name",
    "availability": false
  }
}
```

### Delete Canteen (Admin only)
- **URL**: `/api/canteens/:id`
- **Method**: DELETE
- **Auth Required**: Yes (Admin)
- **Headers**:
```
Authorization: Bearer <admin_token>
```
- **Response**: 200 OK
```json
{
  "message": "Canteen deleted successfully"
}
```

## Menu Endpoints

### Get All Menu Items
- **URL**: `/api/menu`
- **Method**: GET
- **Auth Required**: No
- **Response**: 200 OK
```json
[
  {
    "_id": "menu_item_id",
    "itemId": "unique_item_id",
    "itemName": "Item Name",
    "canteenId": {
      "_id": "canteen_id",
      "name": "Canteen Name"
    },
    "availability": true,
    "category": "Category",
    "price": 100,
    "description": "Item description",
    "image": {
      "url": "image_url",
      "public_id": "cloudinary_public_id"
    },
    "preparationTime": 10,
    "isVegetarian": true
  }
]
```

### Get Menu Items by Canteen
- **URL**: `/api/menu/canteen/:canteenId`
- **Method**: GET
- **Auth Required**: No
- **Response**: 200 OK
```json
[
  {
    "_id": "menu_item_id",
    "itemId": "unique_item_id",
    "itemName": "Item Name",
    "canteenId": "canteen_id",
    "availability": true,
    "category": "Category",
    "price": 100,
    "description": "Item description",
    "image": {
      "url": "image_url",
      "public_id": "cloudinary_public_id"
    },
    "preparationTime": 10,
    "isVegetarian": true
  }
]
```

### Get Menu Item by ID
- **URL**: `/api/menu/:id`
- **Method**: GET
- **Auth Required**: No
- **Response**: 200 OK
```json
{
  "_id": "menu_item_id",
  "itemId": "unique_item_id",
  "itemName": "Item Name",
  "canteenId": {
    "_id": "canteen_id",
    "name": "Canteen Name"
  },
  "availability": true,
  "category": "Category",
  "price": 100,
  "description": "Item description",
  "image": {
    "url": "image_url",
    "public_id": "cloudinary_public_id"
  },
  "preparationTime": 10,
  "isVegetarian": true
}
```

### Create Menu Item (Admin/Canteen Staff)
- **URL**: `/api/menu`
- **Method**: POST
- **Auth Required**: Yes (Admin or Canteen Staff)
- **Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
- **Request Body**:
```
itemName: Item Name
canteenId: canteen_id (required for Admin, auto-filled for Canteen Staff)
category: Category
price: 100
description: Item description
preparationTime: 10
isVegetarian: true
image: [file upload]
```
- **Response**: 201 Created
```json
{
  "message": "Menu item created successfully",
  "menuItem": {
    "_id": "menu_item_id",
    "itemId": "unique_item_id",
    "itemName": "Item Name",
    "canteenId": "canteen_id",
    "availability": true,
    "category": "Category",
    "price": 100,
    "description": "Item description",
    "image": {
      "url": "image_url",
      "public_id": "cloudinary_public_id"
    },
    "preparationTime": 10,
    "isVegetarian": true
  }
}
```

### Create Multiple Menu Items (Admin only)
- **URL**: `/api/menu/batch`
- **Method**: POST
- **Auth Required**: Yes (Admin)
- **Headers**:
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```
- **Request Body**:
```json
{
  "menuItems": [
    {
      "itemName": "Item 1",
      "canteenId": "canteen_id",
      "category": "Category",
      "price": 100,
      "description": "Item 1 description",
      "preparationTime": 10,
      "isVegetarian": true
    },
    {
      "itemName": "Item 2",
      "canteenId": "canteen_id",
      "category": "Category",
      "price": 150,
      "description": "Item 2 description",
      "preparationTime": 15,
      "isVegetarian": false
    }
  ]
}
```
- **Response**: 201 Created
```json
{
  "message": "Menu items created successfully",
  "createdCount": 2,
  "menuItems": [
    {
      "_id": "menu_item_id_1",
      "itemName": "Item 1",
      "canteenId": "canteen_id"
    },
    {
      "_id": "menu_item_id_2",
      "itemName": "Item 2",
      "canteenId": "canteen_id"
    }
  ],
  "errors": []
}
```

### Update Menu Item (Admin/Canteen Staff)
- **URL**: `/api/menu/:id`
- **Method**: PUT
- **Auth Required**: Yes (Admin or Canteen Staff)
- **Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
- **Request Body**:
```
itemName: Updated Item Name
category: Updated Category
price: 120
description: Updated description
preparationTime: 12
isVegetarian: false
image: [file upload]
```
- **Response**: 200 OK
```json
{
  "message": "Menu item updated successfully",
  "menuItem": {
    "_id": "menu_item_id",
    "itemId": "unique_item_id",
    "itemName": "Updated Item Name",
    "canteenId": "canteen_id",
    "availability": true,
    "category": "Updated Category",
    "price": 120,
    "description": "Updated description",
    "image": {
      "url": "updated_image_url",
      "public_id": "updated_cloudinary_public_id"
    },
    "preparationTime": 12,
    "isVegetarian": false
  }
}
```

### Update Menu Item Availability (Admin/Canteen Staff)
- **URL**: `/api/menu/:id/availability`
- **Method**: PATCH
- **Auth Required**: Yes (Admin or Canteen Staff)
- **Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```
- **Request Body**:
```json
{
  "availability": false
}
```
- **Response**: 200 OK
```json
{
  "message": "Menu item availability updated successfully",
  "menuItem": {
    "_id": "menu_item_id",
    "itemName": "Item Name",
    "availability": false
  }
}
```

### Delete Menu Item (Admin/Canteen Staff)
- **URL**: `/api/menu/:id`
- **Method**: DELETE
- **Auth Required**: Yes (Admin or Canteen Staff)
- **Headers**:
```
Authorization: Bearer <token>
```
- **Response**: 200 OK
```json
{
  "message": "Menu item deleted successfully"
}
```

## Order Endpoints

### Create Order (User only)
- **URL**: `/api/orders`
- **Method**: POST
- **Auth Required**: Yes (User)
- **Headers**:
```
Authorization: Bearer <user_token>
Content-Type: application/json
```
- **Request Body**:
```json
{
  "email": "student@kletech.ac.in",
  "orderTime": "12:30 PM",
  "items": [
    {
      "itemId": "menu_item_id",
      "quantity": 2,
      "price": 100
    }
  ],
  "totalAmount": 200,
  "canteenId": "canteen_id",
  "examId": "exam_id",
  "priority": false,
  "priorityReason": "I have an exam today",
  "priorityDetails": "Exam at 2 PM",
  "pickupTime": "1:00 PM",
  "specialInstructions": "Extra spicy",
  "deliveryAddress": "Room 101, Block A"
}
```
- **Response**: 201 Created
```json
{
  "message": "Order created successfully",
  "order": {
    "_id": "order_id",
    "orderId": "unique_order_id",
    "email": "student@kletech.ac.in",
    "orderTime": "12:30 PM",
    "items": [
      {
        "itemId": "menu_item_id",
        "quantity": 2,
        "price": 100
      }
    ],
    "totalAmount": 200,
    "canteenId": "canteen_id",
    "status": "pending",
    "priority": false,
    "pickupTime": "1:00 PM",
    "specialInstructions": "Extra spicy",
    "deliveryAddress": "Room 101, Block A",
    "priorityFee": 0
  }
}
```

### Get All Orders (Admin only)
- **URL**: `/api/orders`
- **Method**: GET
- **Auth Required**: Yes (Admin)
- **Headers**:
```
Authorization: Bearer <admin_token>
```
- **Response**: 200 OK
```json
[
  {
    "_id": "order_id",
    "orderId": "unique_order_id",
    "email": "student@kletech.ac.in",
    "orderTime": "12:30 PM",
    "items": [
      {
        "itemId": {
          "_id": "menu_item_id",
          "itemName": "Item Name",
          "price": 100,
          "image": {
            "url": "image_url"
          }
        },
        "quantity": 2,
        "price": 100
      }
    ],
    "totalAmount": 200,
    "canteenId": {
      "_id": "canteen_id",
      "name": "Canteen Name",
      "location": "Location"
    },
    "status": "pending",
    "priority": false,
    "pickupTime": "1:00 PM",
    "specialInstructions": "Extra spicy",
    "deliveryAddress": "Room 101, Block A",
    "createdAt": "2023-06-01T10:30:00.000Z",
    "updatedAt": "2023-06-01T10:30:00.000Z"
  }
]
```

### Get Orders by User (User only)
- **URL**: `/api/orders/user/:email`
- **Method**: GET
- **Auth Required**: Yes (User)
- **Headers**:
```
Authorization: Bearer <user_token>
```
- **Response**: 200 OK
```json
[
  {
    "_id": "order_id",
    "orderId": "unique_order_id",
    "email": "student@kletech.ac.in",
    "orderTime": "12:30 PM",
    "items": [
      {
        "itemId": {
          "_id": "menu_item_id",
          "itemName": "Item Name",
          "price": 100,
          "image": {
            "url": "image_url"
          }
        },
        "quantity": 2,
        "price": 100
      }
    ],
    "totalAmount": 200,
    "canteenId": {
      "_id": "canteen_id",
      "name": "Canteen Name"
    },
    "status": "pending",
    "priority": false,
    "pickupTime": "1:00 PM",
    "specialInstructions": "Extra spicy",
    "deliveryAddress": "Room 101, Block A"
  }
]
```

### Get Orders by Canteen (Canteen Staff only)
- **URL**: `/api/orders/canteen/:canteenId`
- **Method**: GET
- **Auth Required**: Yes (Canteen Staff)
- **Headers**:
```
Authorization: Bearer <staff_token>
```
- **Response**: 200 OK
```json
[
  {
    "_id": "order_id",
    "orderId": "unique_order_id",
    "email": "student@kletech.ac.in",
    "orderTime": "12:30 PM",
    "items": [
      {
        "itemId": {
          "_id": "menu_item_id",
          "itemName": "Item Name",
          "price": 100,
          "image": {
            "url": "image_url"
          }
        },
        "quantity": 2,
        "price": 100
      }
    ],
    "totalAmount": 200,
    "status": "pending",
    "priority": false,
    "pickupTime": "1:00 PM",
    "specialInstructions": "Extra spicy",
    "deliveryAddress": "Room 101, Block A",
    "createdAt": "2023-06-01T10:30:00.000Z"
  }
]
```

### Get Priority Orders by Canteen (Canteen Staff only)
- **URL**: `/api/orders/canteen/:canteenId/priority`
- **Method**: GET
- **Auth Required**: Yes (Canteen Staff)
- **Headers**:
```
Authorization: Bearer <staff_token>
```
- **Response**: 200 OK
```json
[
  {
    "_id": "order_id",
    "orderId": "unique_order_id",
    "email": "student@kletech.ac.in",
    "orderTime": "12:30 PM",
    "items": [
      {
        "itemId": {
          "_id": "menu_item_id",
          "itemName": "Item Name",
          "price": 100,
          "image": {
            "url": "image_url"
          }
        },
        "quantity": 2,
        "price": 100
      }
    ],
    "totalAmount": 205,
    "status": "pending",
    "priority": true,
    "priorityReason": "I have an exam today",
    "priorityDetails": "Exam at 2 PM",
    "pickupTime": "1:00 PM",
    "specialInstructions": "Extra spicy",
    "deliveryAddress": "Room 101, Block A",
    "priorityFee": 5,
    "createdAt": "2023-06-01T10:30:00.000Z"
  }
]
```

### Get Order by ID
- **URL**: `/api/orders/:id`
- **Method**: GET
- **Auth Required**: Yes (Any authenticated user)
- **Headers**:
```
Authorization: Bearer <token>
```
- **Response**: 200 OK
```json
{
  "_id": "order_id",
  "orderId": "unique_order_id",
  "email": "student@kletech.ac.in",
  "orderTime": "12:30 PM",
  "items": [
    {
      "itemId": {
        "_id": "menu_item_id",
        "itemName": "Item Name",
        "price": 100,
        "image": {
          "url": "image_url"
        }
      },
      "quantity": 2,
      "price": 100
    }
  ],
  "totalAmount": 200,
  "canteenId": {
    "_id": "canteen_id",
    "name": "Canteen Name"
  },
  "status": "pending",
  "priority": false,
  "pickupTime": "1:00 PM",
  "specialInstructions": "Extra spicy",
  "deliveryAddress": "Room 101, Block A",
  "createdAt": "2023-06-01T10:30:00.000Z",
  "updatedAt": "2023-06-01T10:30:00.000Z"
}
```

### Update Order Status (Canteen Staff only)
- **URL**: `/api/orders/:id/status`
- **Method**: PATCH
- **Auth Required**: Yes (Canteen Staff)
- **Headers**:
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```
- **Request Body**:
```json
{
  "status": "preparing"
}
```
- **Response**: 200 OK
```json
{
  "message": "Order status updated successfully",
  "order": {
    "_id": "order_id",
    "orderId": "unique_order_id",
    "status": "preparing",
    "updatedAt": "2023-06-01T11:00:00.000Z"
  }
}
```

### Cancel Order (User only)
- **URL**: `/api/orders/:id/cancel`
- **Method**: PATCH
- **Auth Required**: Yes (User)
- **Headers**:
```
Authorization: Bearer <user_token>
```
- **Response**: 200 OK
```json
{
  "message": "Order cancelled successfully",
  "order": {
    "_id": "order_id",
    "orderId": "unique_order_id",
    "status": "cancelled",
    "updatedAt": "2023-06-01T11:00:00.000Z"
  }
}
```

## Payment Endpoints

### Create Payment Order (User only)
- **URL**: `/api/payments/create-order`
- **Method**: POST
- **Auth Required**: Yes (User)
- **Headers**:
```
Authorization: Bearer <user_token>
Content-Type: application/json
```
- **Request Body**:
```json
{
  "amount": 200,
  "currency": "INR",
  "receipt": "order_receipt",
  "notes": {
    "orderId": "order_id",
    "userEmail": "student@kletech.ac.in"
  }
}
```
- **Response**: 200 OK
```json
{
  "id": "razorpay_order_id",
  "entity": "order",
  "amount": 20000,
  "amount_paid": 0,
  "amount_due": 20000,
  "currency": "INR",
  "receipt": "order_receipt",
  "status": "created",
  "notes": {
    "orderId": "order_id",
    "userEmail": "student@kletech.ac.in"
  },
  "key": "rzp_test_UlzzJVuuaQERYi"
}
```

### Verify Payment (User only)
- **URL**: `/api/payments/verify`
- **Method**: POST
- **Auth Required**: Yes (User)
- **Headers**:
```
Authorization: Bearer <user_token>
Content-Type: application/json
```
- **Request Body**:
```json
{
  "razorpay_order_id": "razorpay_order_id",
  "razorpay_payment_id": "razorpay_payment_id",
  "razorpay_signature": "razorpay_signature",
  "orderId": "order_id"
}
```
- **Response**: 200 OK
```json
{
  "message": "Payment verified successfully",
  "payment": {
    "_id": "payment_id",
    "orderId": "order_id",
    "razorpayOrderId": "razorpay_order_id",
    "razorpayPaymentId": "razorpay_payment_id",
    "amount": 200,
    "status": "completed"
  }
}
```

### Get All Payments (Admin only)
- **URL**: `/api/payments`
- **Method**: GET
- **Auth Required**: Yes (Admin)
- **Headers**:
```
Authorization: Bearer <admin_token>
```
- **Response**: 200 OK
```json
[
  {
    "_id": "payment_id",
    "orderId": "order_id",
    "razorpayOrderId": "razorpay_order_id",
    "razorpayPaymentId": "razorpay_payment_id",
    "amount": 200,
    "status": "completed",
    "createdAt": "2023-06-01T10:30:00.000Z",
    "updatedAt": "2023-06-01T10:30:00.000Z"
  }
]
```

### Get Payments by User (User only)
- **URL**: `/api/payments/user/:email`
- **Method**: GET
- **Auth Required**: Yes (User)
- **Headers**:
```
Authorization: Bearer <user_token>
```
- **Response**: 200 OK
```json
[
  {
    "_id": "payment_id",
    "orderId": "order_id",
    "razorpayOrderId": "razorpay_order_id",
    "razorpayPaymentId": "razorpay_payment_id",
    "amount": 200,
    "status": "completed",
    "createdAt": "2023-06-01T10:30:00.000Z"
  }
]
```

### Get Payment by ID
- **URL**: `/api/payments/:id`
- **Method**: GET
- **Auth Required**: Yes (Any authenticated user)
- **Headers**:
```
Authorization: Bearer <token>
```
- **Response**: 200 OK
```json
{
  "_id": "payment_id",
  "orderId": "order_id",
  "razorpayOrderId": "razorpay_order_id",
  "razorpayPaymentId": "razorpay_payment_id",
  "amount": 200,
  "status": "completed",
  "createdAt": "2023-06-01T10:30:00.000Z",
  "updatedAt": "2023-06-01T10:30:00.000Z"
}
```

### Process Refund (Admin only)
- **URL**: `/api/payments/:id/refund`
- **Method**: POST
- **Auth Required**: Yes (Admin)
- **Headers**:
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```
- **Request Body**:
```json
{
  "amount": 200,
  "notes": {
    "reason": "Order cancelled"
  }
}
```
- **Response**: 200 OK
```json
{
  "message": "Refund processed successfully",
  "refund": {
    "id": "refund_id",
    "payment_id": "razorpay_payment_id",
    "amount": 200,
    "status": "processed"
  }
}
```

## Exam Endpoints

### Create Exam Detail (Admin only)
- **URL**: `/api/exams`
- **Method**: POST
- **Auth Required**: Yes (Admin)
- **Headers**:
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```
- **Request Body**:
```json
{
  "examName": "Mid-Term Exam",
  "examDate": "2023-06-15",
  "examTime": "10:00 AM",
  "department": "CSE",
  "semester": "6",
  "location": "Block A",
  "description": "Computer Networks exam",
  "startUniversityId": "01fe23mca001",
  "endUniversityId": "01fe23mca060"
}
```
- **Response**: 201 Created
```json
{
  "message": "Exam detail created successfully",
  "examDetail": {
    "_id": "exam_id",
    "examId": "unique_exam_id",
    "examName": "Mid-Term Exam",
    "examDate": "2023-06-15",
    "examTime": "10:00 AM",
    "department": "CSE",
    "semester": "6",
    "location": "Block A",
    "description": "Computer Networks exam",
    "startUniversityId": "01fe23mca001",
    "endUniversityId": "01fe23mca060",
    "isActive": true,
    "createdAt": "2023-06-01T10:30:00.000Z",
    "updatedAt": "2023-06-01T10:30:00.000Z"
  }
}
```

### Get All Exam Details (Admin only)
- **URL**: `/api/exams`
- **Method**: GET
- **Auth Required**: Yes (Admin)
- **Headers**:
```
Authorization: Bearer <admin_token>
```
- **Response**: 200 OK
```json
[
  {
    "_id": "exam_id",
    "examName": "Mid-Term Exam",
    "examDate": "2023-06-15",
    "examTime": "10:00 AM",
    "department": "CSE",
    "semester": "6",
    "location": "Block A",
    "description": "Computer Networks exam",
    "isActive": true,
    "createdAt": "2023-06-01T10:30:00.000Z",
    "updatedAt": "2023-06-01T10:30:00.000Z"
  }
]
```

### Get Active Exams
- **URL**: `/api/exams/active`
- **Method**: GET
- **Auth Required**: No
- **Response**: 200 OK
```json
[
  {
    "_id": "exam_id",
    "examName": "Mid-Term Exam",
    "examDate": "2023-06-15",
    "examTime": "10:00 AM",
    "department": "CSE",
    "semester": "6",
    "location": "Block A",
    "description": "Computer Networks exam",
    "isActive": true
  }
]
```

### Get Exams in Next 24 Hours
- **URL**: `/api/exams/next24hours`
- **Method**: GET
- **Auth Required**: No
- **Response**: 200 OK
```json
[
  {
    "_id": "exam_id",
    "examName": "Mid-Term Exam",
    "examDate": "2023-06-15",
    "examTime": "10:00 AM",
    "department": "CSE",
    "semester": "6",
    "location": "Block A",
    "description": "Computer Networks exam",
    "isActive": true
  }
]
```

### Get Exam Details by Department and Semester
- **URL**: `/api/exams/department/:department/semester/:semester`
- **Method**: GET
- **Auth Required**: Yes (Admin)
- **Headers**:
```
Authorization: Bearer <admin_token>
```
- **Response**: 200 OK
```json
[
  {
    "_id": "exam_id",
    "examName": "Mid-Term Exam",
    "examDate": "2023-06-15",
    "examTime": "10:00 AM",
    "department": "CSE",
    "semester": "6",
    "location": "Block A",
    "description": "Computer Networks exam",
    "isActive": true
  }
]
```

### Get Exam Detail by ID
- **URL**: `/api/exams/:id`
- **Method**: GET
- **Auth Required**: Yes (Any authenticated user)
- **Headers**:
```
Authorization: Bearer <token>
```
- **Response**: 200 OK
```json
{
  "_id": "exam_id",
  "examId": "unique_exam_id",
  "examName": "Mid-Term Exam",
  "examDate": "2023-06-15",
  "examTime": "10:00 AM",
  "department": "CSE",
  "semester": "6",
  "location": "Block A",
  "description": "Computer Networks exam",
  "startUniversityId": "01fe23mca001",
  "endUniversityId": "01fe23mca060",
  "isActive": true,
  "createdAt": "2023-06-01T10:30:00.000Z",
  "updatedAt": "2023-06-01T10:30:00.000Z"
}
```

### Update Exam Detail (Admin only)
- **URL**: `/api/exams/:id`
- **Method**: PUT
- **Auth Required**: Yes (Admin)
- **Headers**:
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```
- **Request Body**:
```json
{
  "examName": "Updated Exam Name",
  "examDate": "2023-06-16",
  "examTime": "11:00 AM",
  "location": "Block B",
  "description": "Updated description",
  "startUniversityId": "01fe23mca001",
  "endUniversityId": "01fe23mca060",
  "isActive": false
}
```
- **Response**: 200 OK
```json
{
  "message": "Exam detail updated successfully",
  "examDetail": {
    "_id": "exam_id",
    "examId": "unique_exam_id",
    "examName": "Updated Exam Name",
    "examDate": "2023-06-16",
    "examTime": "11:00 AM",
    "department": "CSE",
    "semester": "6",
    "location": "Block B",
    "description": "Updated description",
    "startUniversityId": "01fe23mca001",
    "endUniversityId": "01fe23mca060",
    "isActive": false,
    "updatedAt": "2023-06-01T11:00:00.000Z"
  }
}
```

### Delete Exam Detail (Admin only)
- **URL**: `/api/exams/:id`
- **Method**: DELETE
- **Auth Required**: Yes (Admin)
- **Headers**:
```
Authorization: Bearer <admin_token>
```
- **Response**: 200 OK
```json
{
  "message": "Exam detail deleted successfully"
}
```

## Feedback Endpoints

### Submit Feedback (User only)
- **URL**: `/api/feedback`
- **Method**: POST
- **Auth Required**: Yes (User)
- **Headers**:
```
Authorization: Bearer <user_token>
Content-Type: application/json
```
- **Request Body**:
```json
{
  "orderId": "order_id",
  "rating": 4.5,
  "comment": "Great food and service!",
  "foodQuality": 4,
  "serviceSpeed": 5,
  "appExperience": 4
}
```
- **Response**: 201 Created
```json
{
  "message": "Feedback submitted successfully",
  "feedback": {
    "_id": "feedback_id",
    "orderId": "order_id",
    "userId": "user_id",
    "canteenId": "canteen_id",
    "rating": 4.5,
    "comment": "Great food and service!",
    "foodQuality": 4,
    "serviceSpeed": 5,
    "appExperience": 4,
    "createdAt": "2023-06-01T10:30:00.000Z"
  }
}
```

### Get User Feedback (User only)
- **URL**: `/api/feedback/user`
- **Method**: GET
- **Auth Required**: Yes (User)
- **Headers**:
```
Authorization: Bearer <user_token>
```
- **Response**: 200 OK
```json
[
  {
    "_id": "feedback_id",
    "orderId": "order_id",
    "canteenId": {
      "_id": "canteen_id",
      "name": "Canteen Name"
    },
    "rating": 4.5,
    "comment": "Great food and service!",
    "foodQuality": 4,
    "serviceSpeed": 5,
    "appExperience": 4,
    "staffResponse": "Thank you for your feedback!",
    "createdAt": "2023-06-01T10:30:00.000Z"
  }
]
```

### Check if Order Has Feedback (User only)
- **URL**: `/api/feedback/order/:orderId/exists`
- **Method**: GET
- **Auth Required**: Yes (User)
- **Headers**:
```
Authorization: Bearer <user_token>
```
- **Response**: 200 OK
```json
{
  "exists": true,
  "feedback": {
    "_id": "feedback_id",
    "rating": 4.5
  }
}
```

### Check if User Can Submit Feedback for Canteen (User only)
- **URL**: `/api/feedback/canteen/:canteenId/can-submit`
- **Method**: GET
- **Auth Required**: Yes (User)
- **Headers**:
```
Authorization: Bearer <user_token>
```
- **Response**: 200 OK
```json
{
  "canSubmit": true,
  "orders": [
    {
      "_id": "order_id",
      "orderId": "unique_order_id",
      "status": "completed",
      "createdAt": "2023-06-01T10:30:00.000Z"
    }
  ]
}
```

### Get Canteen Feedback (Canteen Staff only)
- **URL**: `/api/feedback/canteen/:canteenId`
- **Method**: GET
- **Auth Required**: Yes (Canteen Staff)
- **Headers**:
```
Authorization: Bearer <staff_token>
```
- **Response**: 200 OK
```json
[
  {
    "_id": "feedback_id",
    "orderId": "order_id",
    "userId": {
      "_id": "user_id",
      "name": "User Name",
      "email": "student@kletech.ac.in"
    },
    "rating": 4.5,
    "comment": "Great food and service!",
    "foodQuality": 4,
    "serviceSpeed": 5,
    "appExperience": 4,
    "staffResponse": null,
    "createdAt": "2023-06-01T10:30:00.000Z"
  }
]
```

### Respond to Feedback (Canteen Staff only)
- **URL**: `/api/feedback/:id/respond`
- **Method**: PUT
- **Auth Required**: Yes (Canteen Staff)
- **Headers**:
```
Authorization: Bearer <staff_token>
Content-Type: application/json
```
- **Request Body**:
```json
{
  "staffResponse": "Thank you for your feedback! We're glad you enjoyed our service."
}
```
- **Response**: 200 OK
```json
{
  "message": "Response added successfully",
  "feedback": {
    "_id": "feedback_id",
    "staffResponse": "Thank you for your feedback! We're glad you enjoyed our service.",
    "updatedAt": "2023-06-01T11:00:00.000Z"
  }
}
```

### Get Feedback Stats (Admin only)
- **URL**: `/api/feedback/stats`
- **Method**: GET
- **Auth Required**: Yes (Admin)
- **Headers**:
```
Authorization: Bearer <admin_token>
```
- **Response**: 200 OK
```json
{
  "totalFeedback": 100,
  "averageRating": 4.2,
  "canteenStats": [
    {
      "canteenId": "canteen_id",
      "canteenName": "Canteen Name",
      "totalFeedback": 50,
      "averageRating": 4.5,
      "foodQuality": 4.6,
      "serviceSpeed": 4.3,
      "appExperience": 4.7
    }
  ]
}
```

### Get All Feedback (Admin only)
- **URL**: `/api/feedback`
- **Method**: GET
- **Auth Required**: Yes (Admin)
- **Headers**:
```
Authorization: Bearer <admin_token>
```
- **Response**: 200 OK
```json
[
  {
    "_id": "feedback_id",
    "orderId": "order_id",
    "userId": {
      "_id": "user_id",
      "name": "User Name",
      "email": "student@kletech.ac.in"
    },
    "canteenId": {
      "_id": "canteen_id",
      "name": "Canteen Name"
    },
    "rating": 4.5,
    "comment": "Great food and service!",
    "foodQuality": 4,
    "serviceSpeed": 5,
    "appExperience": 4,
    "staffResponse": "Thank you for your feedback!",
    "createdAt": "2023-06-01T10:30:00.000Z",
    "updatedAt": "2023-06-01T11:00:00.000Z"
  }
]
```

## Cart Endpoints

### Get User Cart (User only)
- **URL**: `/api/cart`
- **Method**: GET
- **Auth Required**: Yes (User)
- **Headers**:
```
Authorization: Bearer <user_token>
```
- **Response**: 200 OK
```json
{
  "message": "Cart retrieved successfully",
  "cart": {
    "_id": "cart_id",
    "userId": "user_id",
    "items": [
      {
        "itemId": {
          "_id": "menu_item_id",
          "itemName": "Item Name",
          "price": 100,
          "availability": true,
          "image": {
            "url": "image_url"
          }
        },
        "canteenId": {
          "_id": "canteen_id",
          "name": "Canteen Name",
          "location": "Location",
          "availability": true
        },
        "quantity": 2,
        "price": 100,
        "name": "Item Name",
        "image": {
          "url": "image_url"
        }
      }
    ]
  }
}
```

### Add to Cart (User only)
- **URL**: `/api/cart/add`
- **Method**: POST
- **Auth Required**: Yes (User)
- **Headers**:
```
Authorization: Bearer <user_token>
Content-Type: application/json
```
- **Request Body**:
```json
{
  "itemId": "menu_item_id",
  "quantity": 2
}
```
- **Response**: 200 OK
```json
{
  "message": "Item added to cart successfully",
  "cart": {
    "_id": "cart_id",
    "userId": "user_id",
    "items": [
      {
        "itemId": {
          "_id": "menu_item_id",
          "itemName": "Item Name",
          "price": 100,
          "availability": true
        },
        "quantity": 2,
        "price": 100,
        "name": "Item Name"
      }
    ]
  }
}
```

### Update Cart Item (User only)
- **URL**: `/api/cart/update`
- **Method**: PUT
- **Auth Required**: Yes (User)
- **Headers**:
```
Authorization: Bearer <user_token>
Content-Type: application/json
```
- **Request Body**:
```json
{
  "itemId": "menu_item_id",
  "quantity": 3
}
```
- **Response**: 200 OK
```json
{
  "message": "Cart item updated successfully",
  "cart": {
    "_id": "cart_id",
    "userId": "user_id",
    "items": [
      {
        "itemId": {
          "_id": "menu_item_id",
          "itemName": "Item Name",
          "price": 100,
          "availability": true
        },
        "quantity": 3,
        "price": 100,
        "name": "Item Name"
      }
    ]
  }
}
```

### Remove Cart Item (User only)
- **URL**: `/api/cart/remove/:itemId`
- **Method**: DELETE
- **Auth Required**: Yes (User)
- **Headers**:
```
Authorization: Bearer <user_token>
```
- **Response**: 200 OK
```json
{
  "message": "Item removed from cart successfully",
  "cart": {
    "_id": "cart_id",
    "userId": "user_id",
    "items": []
  }
}
```

### Clear Cart (User only)
- **URL**: `/api/cart/clear`
- **Method**: DELETE
- **Auth Required**: Yes (User)
- **Headers**:
```
Authorization: Bearer <user_token>
```
- **Response**: 200 OK
```json
{
  "message": "Cart cleared successfully",
  "cart": {
    "_id": "cart_id",
    "userId": "user_id",
    "items": []
  }
}
```

## Error Responses

All API endpoints follow a consistent error response format:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Specific error message describing the issue"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Conflict",
  "message": "Resource already exists or other conflict"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong on the server"
}
```

## Pagination

For endpoints that return multiple items (like `/api/menu`, `/api/orders`, etc.), you can use the following query parameters for pagination:

- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10)

Example:
```
GET /api/menu?page=2&limit=20
```

Response will include pagination metadata:
```json
{
  "items": [...],
  "pagination": {
    "totalItems": 100,
    "totalPages": 5,
    "currentPage": 2,
    "limit": 20
  }
}
```









# KLE Canteen Application Documentation

## Table of Contents
- [System Architecture Overview](#system-architecture-overview)
- [Client Interface](#client-interface)
- [Admin Interface](#admin-interface)
- [Canteen Staff Interface](#canteen-staff-interface)
- [Technical Implementation](#technical-implementation)
- [Data Flow](#data-flow)

## System Architecture Overview

### High-Level Architecture

The KLE Canteen application follows a modern three-tier architecture:

1. **Frontend Tier**:
   - Client Interface (React.js)
   - Admin Interface (React.js)

2. **Backend Tier**:
   - RESTful API Server (Node.js/Express)
   - Authentication & Authorization
   - Business Logic

3. **Data Tier**:
   - MongoDB Database
   - Cloudinary (Image Storage)

### Component Relationships

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Client/Admin   │     │  Express API    │     │    MongoDB      │
│  React Frontend │────▶│  Backend Server │────▶│    Database     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   Cloudinary    │
                        │  Image Storage  │
                        └─────────────────┘
```

### Database Structure

The application uses MongoDB with the following key collections:

1. **Users**: Regular users (students/faculty)
2. **Admins**: System administrators
3. **CanteenStaff**: Staff managing canteens
4. **Canteens**: Canteen information
5. **Menu**: Food items available at canteens
6. **OrderDetails**: Order information
7. **Payments**: Payment transaction details
8. **ExamDetails**: Exam information for priority orders
9. **Feedback**: User feedback on orders
10. **Cart**: User shopping cart data

## Client Interface

### User Journey

1. **Registration/Login**:
   - Users register with institutional email (@kletech.ac.in)
   - Login with email and password
   - JWT-based authentication

2. **Browsing**:
   - View canteen list
   - Browse menu items by canteen
   - View comprehensive menu list
   - Filter items by category, price, and availability

3. **Ordering Process**:
   - Add items to cart
   - View and modify cart
   - Proceed to checkout
   - Select priority order option (if eligible)
   - Provide delivery address
   - Complete payment via Razorpay

4. **Order Management**:
   - View order history
   - Track order status
   - View order details
   - Provide feedback and ratings

### Pages and Functionality

1. **Home Page**:
   - Featured canteens and menu items
   - Quick navigation to canteens and menu
   - FAQ section
   - Customer testimonials

2. **Canteen List Page**:
   - List of all available canteens
   - Canteen status (open/closed)
   - Ratings and reviews
   - Quick access to canteen menus

3. **Canteen Detail Page**:
   - Canteen information
   - Operating hours
   - Menu items categorized
   - Filtering and search options

4. **Menu List Page**:
   - Comprehensive list of all menu items
   - Filtering by category, price, and availability
   - Search functionality

5. **Cart Page**:
   - List of selected items
   - Quantity adjustment
   - Price calculation
   - Clear cart option
   - Checkout button

6. **Checkout Page**:
   - Order summary
   - Delivery address input
   - Priority order option
   - Payment method selection
   - Order placement

7. **Order History Page**:
   - List of past orders
   - Order status
   - Quick access to order details

8. **Order Details Page**:
   - Detailed order information
   - Item list with images
   - Order status
   - Payment details
   - Feedback option

9. **Feedback History Page**:
   - List of submitted feedback
   - Ratings given
   - Staff responses

### Special Features

1. **Priority Ordering System**:
   - Available for students with exams and faculty with exam duties
   - Faster preparation time (5-10 minutes vs. 10-20 minutes)
   - Additional ₹5 charge
   - Validation against exam database

2. **Feedback and Rating System**:
   - Multi-dimensional ratings (food quality, service speed, app experience)
   - Comments and suggestions
   - Staff responses to feedback
   - Average ratings displayed on canteen pages

## Admin Interface

### Dashboard Overview

1. **Analytics**:
   - User count
   - Canteen count
   - Menu item count
   - Order count
   - Revenue statistics
   - Recent orders and feedback

2. **Quick Actions**:
   - Add new canteen
   - Add canteen staff
   - Add menu item
   - Manage exams

### User Management

1. **User List**:
   - View all users
   - Filter by role (student/faculty)
   - Search by name, email, or university ID
   - View user details

2. **Canteen Staff Management**:
   - Add new staff
   - Assign staff to canteens
   - Edit staff information
   - Delete staff accounts

### Canteen Management

1. **Canteen List**:
   - View all canteens
   - Add new canteen
   - Edit canteen details
   - Toggle canteen availability
   - Upload canteen images

2. **Menu Item Management**:
   - Add new menu items
   - Edit existing items
   - Delete items
   - Toggle item availability
   - Upload item images

### Order Processing

1. **Order List**:
   - View all orders
   - Filter by status, date, and canteen
   - View order details
   - Update order status

2. **Payment Management**:
   - View payment transactions
   - Filter by status and date
   - Process refunds
   - View payment details

### Exam Management

1. **Exam List**:
   - View all exams
   - Add new exam details
   - Edit exam information
   - Set university ID ranges for validation
   - Activate/deactivate exams

## Canteen Staff Interface

### Order Management Workflow

1. **Order Queue**:
   - View incoming orders
   - Sort by creation time (newest first)
   - Different background color for undelivered orders
   - Update order status (confirmed → preparing → ready → delivered)

2. **Order Details**:
   - View complete order information
   - Customer details
   - Item list with quantities
   - Special instructions
   - Priority status

### Menu Item Management

1. **Item List**:
   - View all items for assigned canteen
   - Add new items
   - Edit item details
   - Toggle item availability
   - Delete items

2. **Availability Management**:
   - Toggle canteen availability
   - Set operating hours
   - Manage item availability

### Feedback Management

1. **Feedback List**:
   - View customer feedback
   - Sort by date and rating
   - Respond to feedback
   - Mark feedback as resolved

## Technical Implementation

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.0 | UI library for building component-based interfaces |
| React Router | 7.6.0 | Client-side routing |
| Axios | 1.9.0 | HTTP client for API requests |
| Lucide React | 0.511.0 | Icon library |
| React Hot Toast | 2.5.2 | Toast notifications |
| React Slick | 0.30.3 | Carousel component |
| Tailwind CSS | 3.4.17 | Utility-first CSS framework |
| Vite | 6.3.5 | Build tool and development server |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | - | JavaScript runtime |
| Express | 4.18.2 | Web framework for Node.js |
| MongoDB | - | NoSQL database |
| Mongoose | 8.14.3 | MongoDB object modeling |
| JWT | 9.0.2 | Authentication tokens |
| Bcrypt | 6.0.0 | Password hashing |
| Cloudinary | 2.6.1 | Cloud-based image management |
| Multer | 1.4.5-lts.2 | File upload handling |
| Razorpay | 2.9.6 | Payment gateway integration |
| UUID | 11.1.0 | Unique identifier generation |

### Authentication and Authorization

1. **JWT-Based Authentication**:
   - Tokens issued at login
   - Token expiration
   - Secure storage in localStorage

2. **Role-Based Access Control**:
   - Three user roles: admin, user (student/faculty), canteen staff
   - Role-specific middleware
   - Protected routes

3. **Email Validation**:
   - Institutional email requirement (@kletech.ac.in)
   - University ID validation

### API Structure

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

### State Management

1. **Context API**:
   - AuthContext for user authentication state
   - CartContext for shopping cart state
   - ThemeContext for UI theme preferences

2. **Local Storage**:
   - JWT token storage
   - Cart data persistence
   - User preferences

### Image Storage and Handling

1. **Cloudinary Integration**:
   - Cloud-based image storage
   - Image optimization
   - Secure URL generation
   - Public ID tracking for management

2. **Upload Process**:
   - Multer middleware for file handling
   - Image validation
   - Cloudinary upload
   - URL and public_id storage in database

## Data Flow

### Order Creation Flow

1. User adds items to cart (stored in database and localStorage)
2. User proceeds to checkout
3. User provides delivery address and selects priority option (if eligible)
4. Backend validates priority eligibility against exam database
5. Order is created with 'pending' status
6. Payment is processed through Razorpay
7. On successful payment, order status is updated to 'confirmed'
8. Canteen staff is notified of new order
9. Staff updates order status as it progresses
10. User receives order status updates
11. User can provide feedback after order completion

### Priority Order Validation

1. User selects priority order option
2. User selects reason (exam or faculty duty)
3. If exam selected, user selects specific exam from dropdown
4. Backend validates university ID against exam's ID range
5. If valid, priority fee is added to order total
6. If invalid, error is shown and priority option is disabled

### Feedback Submission Flow

1. User views completed order
2. User submits ratings and comments
3. Feedback is stored in database
4. Canteen staff can view and respond to feedback
5. User can view staff responses
6. Feedback contributes to canteen's average rating