import ExamDetails from '../models/ExamDetails.js';
import OrderDetails from '../models/OrderDetails.js';

// Create a new exam detail
export const createExamDetail = async (req, res) => {
  try {
    const {
      examName,
      examDate,
      examTime,
      department,
      semester,
      location,
      description,
      startUniversityId,
      endUniversityId
    } = req.body;

    // Validate university ID range
    if (!startUniversityId || !endUniversityId) {
      return res.status(400).json({
        message: 'Validation error',
        errors: {
          startUniversityId: !startUniversityId ? 'Start University ID is required' : undefined,
          endUniversityId: !endUniversityId ? 'End University ID is required' : undefined
        }
      });
    }

    // Log the received date for debugging
    console.log('Received exam date:', examDate);

    // Ensure we have a valid date object
    let parsedExamDate = examDate;
    if (typeof examDate === 'string') {
      parsedExamDate = new Date(examDate);
      console.log('Parsed exam date:', parsedExamDate.toISOString());
    }

    // Create new exam detail
    const newExamDetail = new ExamDetails({
      examName,
      examDate: parsedExamDate,
      examTime,
      department,
      semester,
      location,
      description,
      startUniversityId,
      endUniversityId,
      isActive: true
    });

    // Save exam detail to database
    await newExamDetail.save();

    res.status(201).json({
      message: 'Exam detail created successfully',
      examDetail: newExamDetail
    });
  } catch (error) {
    console.error('Error creating exam detail:', error);

    // Provide more specific error messages for validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};

      // Extract validation error messages
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }

      return res.status(400).json({
        message: 'Validation error',
        errors: validationErrors
      });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all exam details
export const getAllExamDetails = async (req, res) => {
  try {
    const examDetails = await ExamDetails.find()
      .sort({ examDate: 1 });

    res.status(200).json(examDetails);
  } catch (error) {
    console.error('Error getting all exam details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get active exam details
export const getActiveExams = async (req, res) => {
  try {
    // Get current date
    const currentDate = new Date();

    // Reset time components to start of day for more accurate comparison
    const startOfToday = new Date(currentDate);
    startOfToday.setHours(0, 0, 0, 0);

    console.log('Fetching active exams from:', startOfToday.toISOString());

    // Find exams that are active and have a date greater than or equal to today
    const examDetails = await ExamDetails.find({
      isActive: true,
      examDate: { $gte: startOfToday }
    }).sort({ examDate: 1 });

    console.log('Found active exams:', examDetails.length);

    res.status(200).json(examDetails);
  } catch (error) {
    console.error('Error getting active exams:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get exams for next 24 hours
export const getExamsNext24Hours = async (req, res) => {
  try {
    // Get current date and date 24 hours from now
    const currentDate = new Date();
    const next24Hours = new Date(currentDate);
    next24Hours.setHours(currentDate.getHours() + 24);

    // Reset time components to start of day for more accurate comparison
    const startOfToday = new Date(currentDate);
    startOfToday.setHours(0, 0, 0, 0);

    // Set end time to end of tomorrow
    const endOfTomorrow = new Date(next24Hours);
    endOfTomorrow.setHours(23, 59, 59, 999);

    console.log('Fetching exams between:', startOfToday.toISOString(), 'and', endOfTomorrow.toISOString());

    // Find active exams within the next 24 hours using a more inclusive date range
    const examDetails = await ExamDetails.find({
      isActive: true,
      examDate: {
        $gte: startOfToday,
        $lte: endOfTomorrow
      }
    }).sort({ examDate: 1 });

    console.log('Found exams for next 24 hours:', examDetails.length);

    // Log exam dates for debugging
    if (examDetails.length > 0) {
      examDetails.forEach(exam => {
        console.log('Exam:', exam.examName, 'Date:', new Date(exam.examDate).toISOString());
      });
    }

    res.status(200).json(examDetails);
  } catch (error) {
    console.error('Error getting exams for next 24 hours:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get exam details by department and semester
export const getExamDetailsByDeptSem = async (req, res) => {
  try {
    const { department, semester } = req.params;

    const examDetails = await ExamDetails.find({
      department,
      semester,
      isActive: true
    }).sort({ examDate: 1 });

    res.status(200).json(examDetails);
  } catch (error) {
    console.error('Error getting exam details by department and semester:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get exam detail by ID
export const getExamDetailById = async (req, res) => {
  try {
    const examDetail = await ExamDetails.findById(req.params.id);

    if (!examDetail) {
      return res.status(404).json({ message: 'Exam detail not found' });
    }

    res.status(200).json(examDetail);
  } catch (error) {
    console.error('Error getting exam detail by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update exam detail
export const updateExamDetail = async (req, res) => {
  try {
    const {
      examName,
      examDate,
      examTime,
      department,
      semester,
      location,
      description,
      startUniversityId,
      endUniversityId,
      isActive
    } = req.body;

    // Validate university ID range
    if (!startUniversityId || !endUniversityId) {
      return res.status(400).json({
        message: 'Validation error',
        errors: {
          startUniversityId: !startUniversityId ? 'Start University ID is required' : undefined,
          endUniversityId: !endUniversityId ? 'End University ID is required' : undefined
        }
      });
    }

    // Log the received date for debugging
    console.log('Received exam date for update:', examDate);

    // Ensure we have a valid date object
    let parsedExamDate = examDate;
    if (typeof examDate === 'string') {
      parsedExamDate = new Date(examDate);
      console.log('Parsed exam date for update:', parsedExamDate.toISOString());
    }

    // Find and update exam detail
    const updatedExamDetail = await ExamDetails.findByIdAndUpdate(
      req.params.id,
      {
        examName,
        examDate: parsedExamDate,
        examTime,
        department,
        semester,
        location,
        description,
        startUniversityId,
        endUniversityId,
        isActive
      },
      { new: true, runValidators: true }
    );

    if (!updatedExamDetail) {
      return res.status(404).json({ message: 'Exam detail not found' });
    }

    res.status(200).json({
      message: 'Exam detail updated successfully',
      examDetail: updatedExamDetail
    });
  } catch (error) {
    console.error('Error updating exam detail:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete exam detail
export const deleteExamDetail = async (req, res) => {
  try {
    const examDetail = await ExamDetails.findById(req.params.id);

    if (!examDetail) {
      return res.status(404).json({ message: 'Exam detail not found' });
    }

    // Delete exam detail
    await ExamDetails.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Exam detail deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam detail:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
