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
