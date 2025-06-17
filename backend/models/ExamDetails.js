import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const examDetailsSchema = new mongoose.Schema({
  examId: {
    type: String,
    default: function() {
      return uuidv4(); // Generate a unique UUID for each exam
    },
    unique: true,
    sparse: true // This makes the index ignore null values
  },
  examName: {
    type: String,
    required: true,
    trim: true
  },
  examDate: {
    type: Date,
    required: true
  },
  examTime: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startUniversityId: {
    type: String,
    required: true,
    trim: true
  },
  endUniversityId: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save hook to ensure examId is set
examDetailsSchema.pre('save', function(next) {
  // If examId is not set, generate a new UUID
  if (!this.examId) {
    this.examId = uuidv4();
  }
  next();
});

const ExamDetails = mongoose.model('ExamDetails', examDetailsSchema);

export default ExamDetails;
