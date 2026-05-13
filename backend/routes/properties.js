import express from 'express';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getSellerProperties,
  getPendingProperties,
  approveProperty,
  rejectProperty,
  getFeaturedProperties,
  getPropertyStats
} from '../controllers/propertyController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/:id', getProperty);

// Protected routes - Seller
router.post('/', authenticate, authorize('Seller', 'Admin'), createProperty);
router.put('/:id', authenticate, updateProperty);
router.delete('/:id', authenticate, deleteProperty);
router.get('/seller/my-properties', authenticate, authorize('Seller', 'Admin'), getSellerProperties);

// Protected routes - Admin
router.get('/admin/pending', authenticate, authorize('Admin'), getPendingProperties);
router.get('/admin/stats', authenticate, authorize('Admin'), getPropertyStats);
router.put('/:id/approve', authenticate, authorize('Admin'), approveProperty);
router.put('/:id/reject', authenticate, authorize('Admin'), rejectProperty);

export default router;
