import mongoose from 'mongoose';

const canteenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  availability: {
    type: Boolean,
    default: true
  },
  openingTime: {
    type: String,
    required: true
  },
  closingTime: {
    type: String,
    required: true
  },
  image: {
    url: {
      type: String,
      trim: true
    },
    public_id: {
      type: String,
      trim: true
    }
  },
  description: {
    type: String,
    trim: true
  },
  ratings: {
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    foodQuality: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    serviceSpeed: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    appExperience: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  }
}, {
  timestamps: true
});

const Canteen = mongoose.model('Canteen', canteenSchema);

export default Canteen;
