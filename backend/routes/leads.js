import express from 'express';
import {
  createLead,
  getSellerLeads,
  getBuyerLeads,
  updateLeadStatus,
  scheduleVisit,
  getAllLeads,
  getLeadStats,
  addFollowUpNote
} from '../controllers/leadController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes - Buyer
router.post('/', authenticate, authorize('Buyer'), createLead);
router.get('/buyer', authenticate, authorize('Buyer'), getBuyerLeads);

// Protected routes - Seller
router.get('/seller', authenticate, authorize('Seller', 'Admin'), getSellerLeads);
router.put('/:id/status', authenticate, authorize('Seller', 'Admin'), updateLeadStatus);
router.put('/:id/schedule-visit', authenticate, authorize('Seller', 'Admin'), scheduleVisit);
router.post('/:id/follow-up', authenticate, authorize('Seller', 'Admin'), addFollowUpNote);

// Protected routes - Admin
router.get('/admin', authenticate, authorize('Admin'), getAllLeads);
router.get('/stats', authenticate, getLeadStats);

export default router;
