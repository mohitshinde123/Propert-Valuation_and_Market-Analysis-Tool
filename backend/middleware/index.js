// Auth Middleware
export {
  protect,
  optionalAuth,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  sendTokenResponse
} from './authMiddleware.js';

// Role Middleware
export {
  authorize,
  isAdmin,
  isSeller,
  isBuyer,
  isSellerOrAdmin,
  isOwnerOrAdmin,
  isPropertySeller,
  isLeadParticipant,
  roleBasedRateLimit,
  checkAccountStatus
} from './roleMiddleware.js';

// Error Middleware
export {
  AppError,
  notFound,
  errorHandler,
  asyncHandler,
  formatValidationErrors,
  validate,
  rateLimitHandler,
  uncaughtExceptionHandler,
  unhandledRejectionHandler,
  developmentErrors,
  productionErrors,
  timeoutHandler,
  maintenanceMode
} from './errorMiddleware.js';
