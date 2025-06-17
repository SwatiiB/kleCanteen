import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const orderDetailsSchema = new mongoose.Schema({
  orderId: {
    type: String,
    default: function() {
      return uuidv4(); // Generate a unique UUID for each order
    },
    unique: true,
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    ref: 'User'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  orderTime: {
    type: String,
    required: true
  },
  items: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true,
        min: 0
      }
    }
  ],
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  canteenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Canteen',
    required: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamDetails'
  },
  priority: {
    type: Boolean,
    default: false
  },
  priorityReason: {
    type: String,
    enum: ['exam', 'medical', 'faculty', 'other'],
    required: function () {
      return this.priority === true;
    }
  },
  priorityDetails: {
    type: String,
    trim: true,
    required: function () {
      return this.priority === true;
    }
  },
  pickupTime: {
    type: String,
    required: true
  },
  specialInstructions: {
    type: String,
    trim: true
  },
  deliveryAddress: {
    type: String,
    required: true,
    trim: true
  },
  priorityFee: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Pre-save hook to ensure orderId is set
orderDetailsSchema.pre('save', function(next) {
  // If orderId is not set, generate a new UUID
  if (!this.orderId) {
    this.orderId = uuidv4();
  }
  next();
});

const OrderDetails = mongoose.model('OrderDetails', orderDetailsSchema);

export default OrderDetails;
