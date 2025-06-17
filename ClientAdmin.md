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