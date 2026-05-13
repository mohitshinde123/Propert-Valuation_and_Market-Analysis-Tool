import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  propertyId: {
    type: String,
    required: [true, 'Please provide property ID']
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerName: {
    type: String,
    required: true
  },
  buyerPhone: {
    type: String,
    required: true
  },
  buyerEmail: {
    type: String
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Please provide a message'],
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['Pending', 'Contacted', 'Scheduled', 'Completed'],
    default: 'Pending'
  },
  visitDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
inquirySchema.index({ sellerId: 1, status: 1 });
inquirySchema.index({ buyerId: 1 });

const Inquiry = mongoose.model('Inquiry', inquirySchema);

export default Inquiry;
