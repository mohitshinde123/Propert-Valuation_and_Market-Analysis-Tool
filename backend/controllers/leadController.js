import Lead from '../models/Lead.js';
import Property from '../models/Property.js';

// @desc    Create new lead/inquiry
// @route   POST /api/leads
// @access  Private (Buyers)
export const createLead = async (req, res) => {
  try {
    const { propertyId, message, inquiryType, preferredVisitDate, buyerPhone, buyerName } = req.body;

    // Validate property exists
    const property = await Property.findById(propertyId).populate('seller', 'name email phone');
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Prevent seller from creating lead on own property
    if (property.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create inquiry on your own property'
      });
    }

    // Create lead
    const lead = await Lead.create({
      property: propertyId,
      propertyTitle: property.title,
      buyer: req.user._id,
      buyerName: buyerName || req.user.name,
      buyerEmail: req.user.email,
      buyerPhone: buyerPhone || req.user.phone,
      seller: property.seller._id,
      sellerName: property.seller.name,
      message,
      inquiryType: inquiryType || 'General',
      preferredVisitDate: preferredVisitDate || null,
      source: 'Website'
    });

    res.status(201).json({
      success: true,
      message: 'Inquiry sent successfully',
      data: lead
    });
  } catch (error) {
    console.error('Create lead error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating inquiry'
    });
  }
};

// @desc    Get leads for seller
// @route   GET /api/leads/seller
// @access  Private (Seller)
export const getSellerLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const status = req.query.status;

    let query = { seller: req.user._id };
    if (status) {
      query.status = status;
    }

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('property', 'title price location images')
      .populate('buyer', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: leads.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: leads
    });
  } catch (error) {
    console.error('Get seller leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get leads for buyer
// @route   GET /api/leads/buyer
// @access  Private (Buyer)
export const getBuyerLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const total = await Lead.countDocuments({ buyer: req.user._id });
    const leads = await Lead.find({ buyer: req.user._id })
      .populate('property', 'title price location images')
      .populate('seller', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: leads.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: leads
    });
  } catch (error) {
    console.error('Get buyer leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update lead status
// @route   PUT /api/leads/:id/status
// @access  Private (Seller who owns the lead)
export const updateLeadStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check ownership
    if (lead.seller.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lead'
      });
    }

    // Update status
    await lead.updateStatus(status, notes, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Lead status updated',
      data: lead
    });
  } catch (error) {
    console.error('Update lead status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Schedule visit
// @route   PUT /api/leads/:id/schedule-visit
// @access  Private (Seller)
export const scheduleVisit = async (req, res) => {
  try {
    const { visitDate } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    if (lead.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    lead.preferredVisitDate = visitDate;
    lead.visitStatus = 'Confirmed';
    lead.status = 'Visit Scheduled';
    await lead.save();

    res.status(200).json({
      success: true,
      message: 'Visit scheduled successfully',
      data: lead
    });
  } catch (error) {
    console.error('Schedule visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all leads (Admin)
// @route   GET /api/leads/admin
// @access  Private (Admin)
export const getAllLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const status = req.query.status;

    let query = {};
    if (status) {
      query.status = status;
    }

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('property', 'title price location')
      .populate('buyer', 'name email phone')
      .populate('seller', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: leads.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: leads
    });
  } catch (error) {
    console.error('Get all leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get lead statistics (Admin/Seller)
// @route   GET /api/leads/stats
// @access  Private
export const getLeadStats = async (req, res) => {
  try {
    let matchQuery = {};
    
    // If seller, only show their leads
    if (req.user.role === 'Seller') {
      matchQuery.seller = req.user._id;
    }

    const totalLeads = await Lead.countDocuments(matchQuery);
    
    const byStatus = await Lead.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const byInquiryType = await Lead.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$inquiryType', count: { $sum: 1 } } }
    ]);

    // Recent leads (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentLeads = await Lead.countDocuments({
      ...matchQuery,
      createdAt: { $gte: sevenDaysAgo }
    });

    // Average response time
    const avgResponseTime = await Lead.aggregate([
      { $match: { ...matchQuery, responseTime: { $ne: null } } },
      { $group: { _id: null, avgTime: { $avg: '$responseTime' } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total: totalLeads,
        recent: recentLeads,
        byStatus,
        byInquiryType,
        avgResponseTime: avgResponseTime[0]?.avgTime || 0
      }
    });
  } catch (error) {
    console.error('Get lead stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add follow-up note to lead
// @route   POST /api/leads/:id/follow-up
// @access  Private (Seller)
export const addFollowUpNote = async (req, res) => {
  try {
    const { note } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    if (lead.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await lead.addFollowUpNote(note, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Follow-up note added',
      data: lead
    });
  } catch (error) {
    console.error('Add follow-up note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
