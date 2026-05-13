// @desc    Authorize specific roles
// @param   {...String} roles - Allowed roles
// @access  Private
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - Please login first',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Check if user role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
        code: 'UNAUTHORIZED_ROLE',
        allowedRoles: roles
      });
    }

    next();
  };
};

// @desc    Check if user is Admin
// @access  Private
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - Please login first',
      code: 'NOT_AUTHENTICATED'
    });
  }

  if (req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied - Admin privileges required',
      code: 'ADMIN_REQUIRED'
    });
  }

  next();
};

// @desc    Check if user is Seller
// @access  Private
export const isSeller = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - Please login first',
      code: 'NOT_AUTHENTICATED'
    });
  }

  if (req.user.role !== 'Seller' && req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied - Seller privileges required',
      code: 'SELLER_REQUIRED'
    });
  }

  next();
};

// @desc    Check if user is Buyer
// @access  Private
export const isBuyer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - Please login first',
      code: 'NOT_AUTHENTICATED'
    });
  }

  if (req.user.role !== 'Buyer' && req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied - Buyer privileges required',
      code: 'BUYER_REQUIRED'
    });
  }

  next();
};

// @desc    Check if user is Seller or Admin
// @access  Private
export const isSellerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - Please login first',
      code: 'NOT_AUTHENTICATED'
    });
  }

  if (req.user.role !== 'Seller' && req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied - Seller or Admin privileges required',
      code: 'SELLER_OR_ADMIN_REQUIRED'
    });
  }

  next();
};

// @desc    Check if user owns the resource or is Admin
// @param   {String} resourceUserField - Field name containing user ID in resource
// @access  Private
export const isOwnerOrAdmin = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - Please login first',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Admin can access everything
    if (req.user.role === 'Admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.resource?.[resourceUserField] || req.body?.[resourceUserField];
    
    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: 'Resource owner not found',
        code: 'OWNER_NOT_FOUND'
      });
    }

    if (resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized - You can only access your own resources',
        code: 'NOT_OWNER'
      });
    }

    next();
  };
};

// @desc    Check if user is seller of the property
// @access  Private
export const isPropertySeller = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - Please login first',
      code: 'NOT_AUTHENTICATED'
    });
  }

  // Admin can access everything
  if (req.user.role === 'Admin') {
    return next();
  }

  // Check if user is a seller
  if (req.user.role !== 'Seller') {
    return res.status(403).json({
      success: false,
      message: 'Access denied - Seller privileges required',
      code: 'SELLER_REQUIRED'
    });
  }

  // If property is loaded, check ownership
  if (req.property && req.property.seller) {
    if (req.property.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized - You can only manage your own properties',
        code: 'NOT_PROPERTY_OWNER'
      });
    }
  }

  next();
};

// @desc    Check if user is part of the lead (buyer or seller)
// @access  Private
export const isLeadParticipant = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - Please login first',
      code: 'NOT_AUTHENTICATED'
    });
  }

  // Admin can access everything
  if (req.user.role === 'Admin') {
    return next();
  }

  // If lead is loaded, check if user is participant
  if (req.lead) {
    const isBuyer = req.lead.buyer?.toString() === req.user._id.toString();
    const isSeller = req.lead.seller?.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized - You are not a participant in this lead',
        code: 'NOT_LEAD_PARTICIPANT'
      });
    }
  }

  next();
};

// @desc    Rate limiting based on role
// @param   {Object} limits - Object with role-based limits
// @access  Public
export const roleBasedRateLimit = (limits = {}) => {
  const defaultLimits = {
    Guest: 10,      // 10 requests per window
    Buyer: 50,      // 50 requests per window
    Seller: 100,    // 100 requests per window
    Admin: 500      // 500 requests per window
  };

  const mergedLimits = { ...defaultLimits, ...limits };

  return (req, res, next) => {
    const userRole = req.user?.role || 'Guest';
    req.rateLimit = mergedLimits[userRole] || mergedLimits.Guest;
    next();
  };
};

// @desc    Check account status
// @access  Private
export const checkAccountStatus = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized - Please login first',
      code: 'NOT_AUTHENTICATED'
    });
  }

  // Check if account is blocked
  if (req.user.isBlocked) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been blocked. Please contact support.',
      code: 'ACCOUNT_BLOCKED'
    });
  }

  // Check if account is verified (optional)
  if (req.user.isVerified === false && process.env.REQUIRE_VERIFICATION === 'true') {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email to access this feature',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }

  next();
};

export default { 
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
};
