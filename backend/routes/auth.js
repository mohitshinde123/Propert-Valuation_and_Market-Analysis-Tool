import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  toggleSaveProperty,
  getAllUsers,
  toggleUserBlock,
  updateUserRole
} from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/save-property/:propertyId', authenticate, toggleSaveProperty);

// Admin routes
router.get('/users', authenticate, authorize('Admin'), getAllUsers);
router.put('/users/:id/block', authenticate, authorize('Admin'), toggleUserBlock);
router.put('/users/:id/role', authenticate, authorize('Admin'), updateUserRole);

export default router;
