import express from 'express';
import {
  createInquiry,
  getSellerInquiries,
  getBuyerInquiries,
  updateInquiryStatus,
  getAllInquiries
} from '../controllers/inquiryController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Private routes - Buyer
router.post('/', authenticate, authorize('Buyer'), createInquiry);
router.get('/buyer', authenticate, authorize('Buyer'), getBuyerInquiries);

// Private routes - Seller
router.get('/seller', authenticate, authorize('Seller'), getSellerInquiries);
router.put('/:id', authenticate, authorize('Seller'), updateInquiryStatus);

// Private routes - Admin
router.get('/admin', authenticate, authorize('Admin'), getAllInquiries);

export default router;
