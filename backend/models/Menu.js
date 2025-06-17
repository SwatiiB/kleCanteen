import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const menuSchema = new mongoose.Schema({
  itemId: {
    type: String,
    default: function() {
      return uuidv4(); // This will generate a new UUID for each document
    },
    unique: true,
    required: true
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  canteenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Canteen',
    required: true
  },
  availability: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
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
  preparationTime: {
    type: Number,  // in minutes
    default: 10
  },
  isVegetarian: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  // Explicitly set _id to true to ensure MongoDB uses its default _id field
  _id: true,
  // Disable any potential implicit itemId field
  id: false
});

const Menu = mongoose.model('Menu', menuSchema);

export default Menu;
