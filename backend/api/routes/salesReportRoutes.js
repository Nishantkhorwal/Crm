import express from 'express';
import { addFollowUpToMeeting, createSalesReport, deleteSalesReport, editSalesReport, getAllFollowUps, getSalesReports, getTodaysFollowUps } from '../controllers/salesReportController.js';
import upload from '../multerConfig.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/create',
  authenticateUser,
  upload.single('visitingCard'), // Only ONE file allowed
  createSalesReport
);

router.get('/followups', authenticateUser, getAllFollowUps);
router.get('/followups/today', authenticateUser, getTodaysFollowUps);

router.get('/get', authenticateUser, getSalesReports);
router.put(
  '/:reportId',
  authenticateUser,
  upload.single('visitingCard'), // Handles file upload
  editSalesReport
);

router.delete('/:reportId', authenticateUser, deleteSalesReport);

router.post(
  "/:salesReportId/follow-up",
  authenticateUser, // your auth middleware
  addFollowUpToMeeting
);

export default router;
