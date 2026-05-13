import express from 'express';
import multer from 'multer';
import {
  uploadSingleImage,
  uploadMultiple,
  uploadFromUrl,
  removeImage,
  removeMultipleImages,
  getUploadAuth,
  listUploadedImages,
  getOptimizedImage
} from '../controllers/uploadController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'), false);
  }
};

// Single file upload config
const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Multiple files upload config
const uploadMulti = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10 // Max 10 files
  }
});

// Public routes
router.get('/optimize', getOptimizedImage);

// Protected routes - Seller/Admin
router.post('/single', authenticate, authorize('Seller', 'Admin'), uploadSingle.single('image'), uploadSingleImage);
router.post('/multiple', authenticate, authorize('Seller', 'Admin'), uploadMulti.array('images', 10), uploadMultiple);
router.post('/url', authenticate, authorize('Seller', 'Admin'), uploadFromUrl);
router.delete('/:fileId', authenticate, authorize('Seller', 'Admin'), removeImage);
router.delete('/bulk', authenticate, authorize('Seller', 'Admin'), removeMultipleImages);

// Protected routes - Any authenticated user
router.get('/auth', authenticate, getUploadAuth);

// Protected routes - Admin only
router.get('/list', authenticate, authorize('Admin'), listUploadedImages);

export default router;
