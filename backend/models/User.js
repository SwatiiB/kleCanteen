import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
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
    lowercase: true,
    validate: {
      validator: function (email) {
        // Check if email ends with @kletech.ac.in
        return /^[\w.%+-]+@kletech\.ac\.in$/i.test(email);
      },
      message: props => 'Email ID is not registered on KLE Institute of Technology. Please use your @kletech.ac.in email.'
    }
  },
  uniId: {
    type: String,
    required: true,
    trim: true
  },
  phoneNo: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'faculty'],
    default: 'student'
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: String,
    required: function () {
      return this.role === 'student';
    },
    trim: true
  },
  isPrivileged: {
    type: Boolean,
    default: false
  },
  privilegeReason: {
    type: String,
    trim: true,
    required: function () {
      return this.isPrivileged === true;
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
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
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Custom pre-save hook to handle uniId field and check uniqueness
userSchema.pre('save', async function(next) {
  try {
    // Check if uniId is empty
    if (!this.uniId || this.uniId === '') {
      const error = new Error('University ID is required');
      error.name = 'ValidationError';
      return next(error);
    }

    // Check if uniId is unique
    const existingUser = await this.constructor.findOne({
      uniId: this.uniId,
      _id: { $ne: this._id } // Exclude current document when updating
    });

    if (existingUser) {
      const error = new Error('University ID must be unique');
      error.name = 'ValidationError';
      return next(error);
    }

    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

export default User;
