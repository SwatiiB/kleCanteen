import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentDate: {
    type: Date,
    default: Date.now
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderDetails',
    required: true
  },
  paymentTime: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'upi', 'wallet', 'cash', 'razorpay', 'card'],
    default: 'upi'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  razorpayDetails: {
    orderId: {
      type: String,
      trim: true
    },
    paymentId: {
      type: String,
      trim: true
    },
    signature: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Create a sparse unique index on razorpayDetails.paymentId
// This ensures uniqueness but ignores null values
paymentSchema.index({ 'razorpayDetails.paymentId': 1 }, {
  unique: true,
  sparse: true,
  name: 'razorpayDetails_paymentId_unique_index'
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
