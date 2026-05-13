import Inquiry from '../models/Inquiry.js';

// @desc    Create new inquiry
// @route   POST /api/inquiries
// @access  Private/Buyer
export const createInquiry = async (req, res) => {
  try {
    const { propertyId, sellerId, message, visitDate } = req.body;

    const inquiry = await Inquiry.create({
      propertyId,
      buyerId: req.user.id,
      buyerName: req.user.name,
      buyerPhone: req.user.phone,
      buyerEmail: req.user.email,
      sellerId,
      message,
      visitDate
    });

    res.status(201).json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get seller's inquiries
// @route   GET /api/inquiries/seller
// @access  Private/Seller
export const getSellerInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ sellerId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get buyer's inquiries
// @route   GET /api/inquiries/buyer
// @access  Private/Buyer
export const getBuyerInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ buyerId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id
// @access  Private/Seller
export const updateInquiryStatus = async (req, res) => {
  try {
    const { status, visitDate } = req.body;

    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Make sure user is the seller for this inquiry
    if (inquiry.sellerId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this inquiry'
      });
    }

    inquiry.status = status;
    if (visitDate) inquiry.visitDate = visitDate;
    await inquiry.save();

    res.status(200).json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all inquiries (Admin)
// @route   GET /api/inquiries/admin
// @access  Private/Admin
export const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
