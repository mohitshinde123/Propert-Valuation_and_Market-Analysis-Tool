// @desc    Custom Error Class
export class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// @desc    Not Found Error Handler (404)
// @access  Public
export const notFound = (req, res, next) => {
  const error = new AppError(
    `Route not found: ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

// @desc    Global Error Handler
// @access  Public
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      statusCode: err.statusCode
    });
  }

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found - Invalid ${err.path}: ${err.value}`;
    error = new AppError(message, 400, 'INVALID_ID');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate value for field '${field}': '${value}' already exists`;
    error = new AppError(message, 400, 'DUPLICATE_FIELD');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    const message = messages.join('. ');
    error = new AppError(message, 400, 'VALIDATION_ERROR');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token - Please login again', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired - Please login again', 401, 'TOKEN_EXPIRED');
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new AppError('File size too large', 400, 'FILE_TOO_LARGE');
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = new AppError('Too many files uploaded', 400, 'TOO_MANY_FILES');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = new AppError('Unexpected file field', 400, 'UNEXPECTED_FILE');
  }

  // Syntax error in JSON
  if (err.type === 'entity.parse.failed') {
    error = new AppError('Invalid JSON in request body', 400, 'INVALID_JSON');
  }

  // Rate limit error
  if (err.statusCode === 429) {
    error = new AppError('Too many requests - Please try again later', 429, 'RATE_LIMITED');
  }

  // Network/Connection errors
  if (err.code === 'ECONNREFUSED') {
    error = new AppError('Service unavailable - Please try again later', 503, 'SERVICE_UNAVAILABLE');
  }

  if (err.code === 'ETIMEDOUT') {
    error = new AppError('Request timeout - Please try again', 408, 'REQUEST_TIMEOUT');
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    code: error.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err
    })
  });
};

// @desc    Async Handler - Wraps async functions to catch errors
// @param   {Function} fn - Async function
// @returns {Function} Express middleware
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// @desc    Validation Error Formatter
// @param   {Object} errors - Mongoose validation errors
// @returns {Array} Formatted error messages
export const formatValidationErrors = (errors) => {
  return Object.values(errors).map(err => ({
    field: err.path,
    message: err.message,
    value: err.value
  }));
};

// @desc    Request Validation Middleware
// @param   {Object} schema - Joi or validation schema
// @access  Public
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, '')
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors
      });
    }

    next();
  };
};

// @desc    Rate Limit Handler
// @param   {Number} retryAfter - Seconds to retry after
// @access  Public
export const rateLimitHandler = (retryAfter) => {
  return (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests - Please try again later',
      code: 'RATE_LIMITED',
      retryAfter
    });
  };
};

// @desc    Uncaught Exception Handler
export const uncaughtExceptionHandler = () => {
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
  });
};

// @desc    Unhandled Rejection Handler
export const unhandledRejectionHandler = (server) => {
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    server.close(() => {
      process.exit(1);
    });
  });
};

// @desc    Development Error Handler (with stack trace)
export const developmentErrors = (err, req, res, next) => {
  err.stack = err.stack || '';
  err.statusCode = err.statusCode || 500;

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    code: err.code || 'ERROR',
    stack: err.stack,
    error: err
  });
};

// @desc    Production Error Handler (no stack trace)
export const productionErrors = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // Only send operational errors to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code || 'ERROR'
    });
  } else {
    // Programming or unknown errors - don't leak details
    console.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      code: 'INTERNAL_ERROR'
    });
  }
};

// @desc    Timeout Handler
export const timeoutHandler = (timeout = 30000) => {
  return (req, res, next) => {
    req.setTimeout(timeout, () => {
      const err = new AppError('Request timeout', 408, 'REQUEST_TIMEOUT');
      next(err);
    });
    next();
  };
};

// @desc    Maintenance Mode Handler
export const maintenanceMode = (req, res, next) => {
  if (process.env.MAINTENANCE_MODE === 'true') {
    return res.status(503).json({
      success: false,
      message: 'Server is under maintenance. Please try again later.',
      code: 'MAINTENANCE_MODE'
    });
  }
  next();
};

export default {
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
};
