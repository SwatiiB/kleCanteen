import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const canteenStaffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  canteenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Canteen',
    required: true
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  memberId: {
    type: String,
    sparse: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

// Hash password before saving
canteenStaffSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
canteenStaffSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const CanteenStaff = mongoose.model('CanteenStaff', canteenStaffSchema);

export default CanteenStaff;
