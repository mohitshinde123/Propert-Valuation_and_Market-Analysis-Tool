import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  // Property Reference
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property reference is required']
  },
  propertyTitle: {
    type: String,
    default: ''
  },
  
  // Buyer Information (the person making inquiry)
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer reference is required']
  },
  buyerName: {
    type: String,
    required: [true, 'Buyer name is required']
  },
  buyerEmail: {
    type: String,
    default: ''
  },
  buyerPhone: {
    type: String,
    required: [true, 'Buyer phone is required']
  },
  
  // Seller Information (property owner)
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller reference is required']
  },
  sellerName: {
    type: String,
    default: ''
  },
  
  // Inquiry Details
  message: {
    type: String,
    required: [true, 'Inquiry message is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  inquiryType: {
    type: String,
    enum: ['General', 'Visit Request', 'Price Negotiation', 'Document Request', 'Call Back'],
    default: 'General'
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Visit Scheduled', 'Visit Completed', 'Negotiating', 'Converted', 'Lost', 'Spam'],
    default: 'New'
  },
  
  // Visit Scheduling
  preferredVisitDate: {
    type: Date,
    default: null
  },
  actualVisitDate: {
    type: Date,
    default: null
  },
  visitStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'],
    default: 'Pending'
  },
  
  // Follow-up
  lastFollowUpDate: {
    type: Date,
    default: null
  },
  nextFollowUpDate: {
    type: Date,
    default: null
  },
  followUpNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Source tracking
  source: {
    type: String,
    enum: ['Website', 'Mobile App', 'Phone Call', 'Walk-in', 'Referral', 'Other'],
    default: 'Website'
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  
  // Response time tracking
  responseTime: {
    type: Number, // in minutes
    default: null
  },
  firstResponseAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
leadSchema.index({ buyer: 1 });
leadSchema.index({ seller: 1 });
leadSchema.index({ property: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ seller: 1, status: 1 });
leadSchema.index({ nextFollowUpDate: 1 });

// Virtual for lead age
leadSchema.virtual('leadAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

// Method to add follow-up note
leadSchema.methods.addFollowUpNote = function(note, userId) {
  this.followUpNotes.push({
    note,
    addedBy: userId,
    addedAt: new Date()
  });
  this.lastFollowUpDate = new Date();
  return this.save();
};

// Method to update status
leadSchema.methods.updateStatus = function(newStatus, notes = '', userId = null) {
  this.status = newStatus;
  if (notes && userId) {
    this.addFollowUpNote(notes, userId);
  }
  
  // Set first response time
  if (!this.firstResponseAt && newStatus !== 'New') {
    this.firstResponseAt = new Date();
    this.responseTime = Math.floor((this.firstResponseAt - this.createdAt) / (1000 * 60));
  }
  
  return this.save();
};

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;

