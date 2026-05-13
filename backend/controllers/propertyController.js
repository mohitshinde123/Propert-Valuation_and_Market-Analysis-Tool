import Property from '../models/Property.js';

// @desc    Get all properties with pagination and filters
// @route   GET /api/properties
// @access  Public
export const getProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // Build filter query
    let query = { isApproved: true };

    // Search filter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchRegex },
        { 'location.city': searchRegex },
        { 'location.locality': searchRegex },
        { description: searchRegex }
      ];
    }

    // City filter
    if (req.query.city) {
      query['location.city'] = new RegExp(req.query.city, 'i');
    }

    // Locality filter
    if (req.query.locality) {
      query['location.locality'] = new RegExp(req.query.locality, 'i');
    }

    // Property type filter
    if (req.query.propertyType) {
      query.propertyType = req.query.propertyType;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // Bedrooms filter
    if (req.query.bedrooms) {
      query.bedrooms = Number(req.query.bedrooms);
    }

    // Area filter
    if (req.query.minArea || req.query.maxArea) {
      query.area = {};
      if (req.query.minArea) query.area.$gte = Number(req.query.minArea);
      if (req.query.maxArea) query.area.$lte = Number(req.query.maxArea);
    }

    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Furnishing filter
    if (req.query.furnishing) {
      query.furnishing = req.query.furnishing;
    }

    // Build sort object
    let sort = { createdAt: -1 }; // Default: newest first
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'price_asc':
          sort = { price: 1 };
          break;
        case 'price_desc':
          sort = { price: -1 };
          break;
        case 'area_asc':
          sort = { area: 1 };
          break;
        case 'area_desc':
          sort = { area: -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        case 'oldest':
          sort = { createdAt: 1 };
          break;
      }
    }

    // Execute query
    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .populate('seller', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: properties
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching properties'
    });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
export const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('seller', 'name email phone');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Increment views
    property.views += 1;
    await property.save();

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching property'
    });
  }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Sellers only)
export const createProperty = async (req, res) => {
  try {
    // Add seller information
    req.body.seller = req.user._id;
    req.body.sellerName = req.user.name;
    req.body.sellerPhone = req.user.phone;
    req.body.sellerEmail = req.user.email;

    // Calculate price per sqft if not provided
    if (!req.body.pricePerSqft && req.body.price && req.body.area) {
      req.body.pricePerSqft = Math.round(req.body.price / req.body.area);
    }

    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property
    });
  } catch (error) {
    console.error('Create property error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating property'
    });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Seller who owns it or Admin)
export const updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership
    if (property.seller.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }

    // Recalculate price per sqft if price or area changed
    if (req.body.price || req.body.area) {
      const price = req.body.price || property.price;
      const area = req.body.area || property.area;
      req.body.pricePerSqft = Math.round(price / area);
    }

    property = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: property
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating property'
    });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Seller who owns it or Admin)
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check ownership
    if (property.seller.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property'
      });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting property'
    });
  }
};

// @desc    Get properties by seller
// @route   GET /api/properties/seller/my-properties
// @access  Private (Seller)
export const getSellerProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const total = await Property.countDocuments({ seller: req.user._id });
    const properties = await Property.find({ seller: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: properties
    });
  } catch (error) {
    console.error('Get seller properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get pending properties (Admin)
// @route   GET /api/properties/admin/pending
// @access  Private (Admin)
export const getPendingProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const total = await Property.countDocuments({ isApproved: false });
    const properties = await Property.find({ isApproved: false })
      .populate('seller', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: properties
    });
  } catch (error) {
    console.error('Get pending properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Approve property (Admin)
// @route   PUT /api/properties/:id/approve
// @access  Private (Admin)
export const approveProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, isVerified: true },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Property approved successfully',
      data: property
    });
  } catch (error) {
    console.error('Approve property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reject property (Admin)
// @route   PUT /api/properties/:id/reject
// @access  Private (Admin)
export const rejectProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Property rejected and deleted'
    });
  } catch (error) {
    console.error('Reject property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
export const getFeaturedProperties = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 6;

    const properties = await Property.find({ 
      isApproved: true, 
      isFeatured: true 
    })
      .populate('seller', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error('Get featured properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get property statistics (Admin)
// @route   GET /api/properties/stats
// @access  Private (Admin)
export const getPropertyStats = async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments();
    const approvedProperties = await Property.countDocuments({ isApproved: true });
    const pendingProperties = await Property.countDocuments({ isApproved: false });
    const featuredProperties = await Property.countDocuments({ isFeatured: true });

    // Properties by type
    const byType = await Property.aggregate([
      { $group: { _id: '$propertyType', count: { $sum: 1 } } }
    ]);

    // Properties by city
    const byCity = await Property.aggregate([
      { $group: { _id: '$location.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Average price
    const avgPrice = await Property.aggregate([
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total: totalProperties,
        approved: approvedProperties,
        pending: pendingProperties,
        featured: featuredProperties,
        byType,
        byCity,
        averagePrice: avgPrice[0]?.avgPrice || 0
      }
    });
  } catch (error) {
    console.error('Get property stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
