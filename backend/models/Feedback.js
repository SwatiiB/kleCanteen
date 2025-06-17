import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderDetails',
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    ref: 'User'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  foodQuality: {
    type: Number,
    min: 1,
    max: 5
  },
  serviceSpeed: {
    type: Number,
    min: 1,
    max: 5
  },
  appExperience: {
    type: Number,
    min: 1,
    max: 5
  },
  canteenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Canteen',
    required: true
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  staffResponse: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create a compound index to ensure a user can only provide one feedback per order
feedbackSchema.index({ orderId: 1, email: 1 }, { unique: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
