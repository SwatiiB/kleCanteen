import express from 'express';
import {
  createExamDetail,
  getAllExamDetails,
  getActiveExams,
  getExamsNext24Hours,
  getExamDetailsByDeptSem,
  getExamDetailById,
  updateExamDetail,
  deleteExamDetail
} from '../controllers/examController.js';
import { protect, userOnly, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes for checkout process
router.get('/active', getActiveExams);
router.get('/next24hours', getExamsNext24Hours);

// Admin routes
router.post('/', protect, adminOnly, createExamDetail);
router.get('/', protect, adminOnly, getAllExamDetails);
router.get('/department/:department/semester/:semester', protect, adminOnly, getExamDetailsByDeptSem);
router.put('/:id', protect, adminOnly, updateExamDetail);
router.delete('/:id', protect, adminOnly, deleteExamDetail);

// Common routes
router.get('/:id', protect, getExamDetailById);

export default router;
