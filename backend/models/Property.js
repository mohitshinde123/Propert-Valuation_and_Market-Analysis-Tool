import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: ''
  },
  
  // Price & Area (converted from CSV strings to numbers)
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  pricePerSqft: {
    type: Number,
    min: [0, 'Price per sqft cannot be negative'],
    default: 0
  },
  area: {
    type: Number,
    required: [true, 'Area is required'],
    min: [1, 'Area must be at least 1']
  },
  areaUnit: {
    type: String,
    enum: ['sqft', 'sqyd', 'sqm', 'acre'],
    default: 'sqft'
  },
  
  // Property Details
  bedrooms: {
    type: Number,
    min: [0, 'Bedrooms cannot be negative'],
    default: 0
  },
  bathrooms: {
    type: Number,
    min: [0, 'Bathrooms cannot be negative'],
    default: 0
  },
  balconies: {
    type: Number,
    min: [0, 'Balconies cannot be negative'],
    default: 0
  },
  
  // Floor Information
  floor: {
    type: String,
    default: '0'
  },
  totalFloors: {
    type: Number,
    min: [0, 'Total floors cannot be negative'],
    default: 0
  },
  
  // Property Type & Status
  propertyType: {
    type: String,
    enum: ['Apartment', 'Villa', 'Plot', 'Independent House', 'Commercial', 'Studio', 'Penthouse'],
    required: [true, 'Property type is required']
  },
  status: {
    type: String,
    enum: ['Ready to Move', 'Under Construction', 'New Launch', 'Resale'],
    default: 'Ready to Move'
  },
  
  // Furnishing & Facing
  furnishing: {
    type: String,
    enum: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
    default: 'Unfurnished'
  },
  facing: {
    type: String,
    enum: ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West', ''],
    default: ''
  },
  
  // Age
  age: {
    type: Number,
    min: [0, 'Age cannot be negative'],
    default: 0
  },
  
  // Nested Location Object
  location: {
    address: {
      type: String,
      trim: true,
      default: ''
    },
    locality: {
      type: String,
      required: [true, 'Locality is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    pinCode: {
      type: String,
      trim: true,
      default: ''
    },
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    }
  },
  
  // Amenities
  amenities: [{
    type: String,
    trim: true
  }],
  
  // Images
  images: [{
    type: String
  }],
  
  // Seller Reference
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller reference is required']
  },
  sellerName: {
    type: String,
    default: ''
  },
  sellerPhone: {
    type: String,
    default: ''
  },
  sellerEmail: {
    type: String,
    default: ''
  },
  
  // Verification & Featured
  isVerified: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  saves: {
    type: Number,
    default: 0
  },
  
  // CSV Reference (for tracking imported data)
  csvId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
propertySchema.index({ 'location.city': 1 });
propertySchema.index({ 'location.locality': 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ bedrooms: 1 });
propertySchema.index({ seller: 1 });
propertySchema.index({ isApproved: 1 });
propertySchema.index({ createdAt: -1 });

// Text index for search
propertySchema.index({ 
  title: 'text', 
  'location.locality': 'text', 
  'location.city': 'text',
  description: 'text'
});

const Property = mongoose.model('Property', propertySchema);

export default Property;
