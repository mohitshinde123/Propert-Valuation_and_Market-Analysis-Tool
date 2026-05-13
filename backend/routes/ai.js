import express from 'express';
import {
  getPropertyValuation,
  getMarketAnalysis,
  getPropertyRecommendations,
  getPricePrediction,
  compareProperties
} from '../controllers/aiController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/valuation', getPropertyValuation);
router.get('/market-analysis', getMarketAnalysis);
router.post('/price-prediction', getPricePrediction);
router.post('/compare', compareProperties);

// Protected routes
router.post('/recommendations', authenticate, getPropertyRecommendations);

export default router;
