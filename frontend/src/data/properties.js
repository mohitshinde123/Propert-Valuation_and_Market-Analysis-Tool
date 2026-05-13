// Mock Data simulating Indian_Real_Estate_Clean_Data.csv

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];
const localities = {
  'Mumbai': ['Andheri', 'Bandra', 'Juhu', 'Powai', 'Thane', 'Navi Mumbai', 'Goregaon', 'Malad'],
  'Delhi': ['Dwarka', 'Rohini', 'Saket', 'Vasant Kunj', 'Greater Noida', 'Gurgaon', 'Noida', 'Lajpat Nagar'],
  'Bangalore': ['Whitefield', 'Koramangala', 'Indiranagar', 'HSR Layout', 'Electronic City', 'Marathahalli', 'JP Nagar', 'BTM Layout'],
  'Hyderabad': ['Gachibowli', 'Hitech City', 'Kondapur', 'Madhapur', 'Kukatpally', 'Miyapur', 'Banjara Hills', 'Jubilee Hills'],
  'Chennai': ['Adyar', 'Anna Nagar', 'T Nagar', 'Velachery', 'OMR', 'ECR', 'Porur', 'Tambaram'],
  'Pune': ['Hinjewadi', 'Kharadi', 'Wakad', 'Baner', 'Aundh', 'Viman Nagar', 'Kothrud', 'Hadapsar'],
  'Kolkata': ['Salt Lake', 'New Town', 'Rajarhat', 'Park Street', 'Alipore', 'Ballygunge', 'Jadavpur', 'Behala'],
  'Ahmedabad': ['Satellite', 'Vastrapur', 'Bopal', 'SG Highway', 'Prahlad Nagar', 'Maninagar', 'Navrangpura', 'Ambawadi']
};

const propertyTypes = ['Apartment', 'Villa', 'Plot', 'Independent House', 'Commercial'];
const statuses = ['Ready to Move', 'Under Construction', 'New Launch'];
const furnishings = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const facings = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];

const amenitiesList = [
  'Swimming Pool', 'Gym', 'Club House', 'Park', 'Security', 'Power Backup',
  'Lift', 'Parking', 'Garden', 'Play Area', 'Community Hall', 'Rain Water Harvesting',
  'Intercom', 'Fire Safety', 'Internet/Wi-Fi', 'Maintenance Staff', 'Shopping Center',
  'Hospital Nearby', 'School Nearby', 'Metro Connectivity'
];

const sellerNames = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Gupta', 'Vikram Singh',
  'Anita Verma', 'Suresh Reddy', 'Meera Iyer', 'Rahul Joshi', 'Kavita Nair'
];

function getCityState(city) {
  const stateMap = {
    'Mumbai': 'Maharashtra',
    'Delhi': 'Delhi',
    'Bangalore': 'Karnataka',
    'Hyderabad': 'Telangana',
    'Chennai': 'Tamil Nadu',
    'Pune': 'Maharashtra',
    'Kolkata': 'West Bengal',
    'Ahmedabad': 'Gujarat'
  };
  return stateMap[city] || 'India';
}

function generatePropertyImages(index) {
  const imageUrls = [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
  ];
  return [imageUrls[index % imageUrls.length], imageUrls[(index + 1) % imageUrls.length], imageUrls[(index + 2) % imageUrls.length]];
}

function generateProperties(count) {
  const properties = [];
  
  for (let i = 0; i < count; i++) {
    const city = cities[i % cities.length];
    const locality = localities[city][i % 8];
    const propertyType = propertyTypes[i % propertyTypes.length];
    const area = propertyType === 'Plot' ? 1000 + (i % 50) * 100 : 500 + (i % 30) * 50;
    const basePricePerSqft = 3000 + (cities.indexOf(city) * 500) + (i % 1000);
    const price = Math.round(area * basePricePerSqft / 100000) * 100000;
    
    properties.push({
      id: `PROP${String(i + 1).padStart(6, '0')}`,
      title: `${propertyType === 'Apartment' ? `${1 + (i % 4)} BHK` : propertyType} in ${locality}, ${city}`,
      description: `Beautiful ${propertyType.toLowerCase()} located in the prime area of ${locality}. This property offers modern amenities, excellent connectivity, and a comfortable living experience. Perfect for families looking for a dream home in ${city}.`,
      price,
      pricePerSqft: basePricePerSqft,
      area,
      areaUnit: 'sqft',
      bedrooms: propertyType === 'Plot' ? 0 : 1 + (i % 4),
      bathrooms: propertyType === 'Plot' ? 0 : 1 + (i % 3),
      balconies: propertyType === 'Plot' ? 0 : 1 + (i % 2),
      floor: propertyType === 'Plot' ? 'N/A' : `${1 + (i % 20)}`,
      totalFloors: propertyType === 'Plot' ? 0 : 10 + (i % 15),
      propertyType,
      status: statuses[i % statuses.length],
      furnishing: furnishings[i % furnishings.length],
      facing: facings[i % facings.length],
      age: i % 10,
      location: {
        address: `${100 + i}, ${locality} Main Road`,
        locality,
        city,
        state: getCityState(city),
        pincode: `${110000 + i}`,
        latitude: 12.9716 + (Math.random() - 0.5) * 10,
        longitude: 77.5946 + (Math.random() - 0.5) * 10
      },
      amenities: amenitiesList.slice(0, 5 + (i % 10)),
      images: generatePropertyImages(i),
      sellerId: `SELLER${(i % 10) + 1}`,
      sellerName: sellerNames[i % 10],
      sellerPhone: `+91 ${7000000000 + i}`,
      postedDate: new Date(Date.now() - (i % 90) * 24 * 60 * 60 * 1000).toISOString(),
      isVerified: i % 3 !== 0,
      isFeatured: i % 10 === 0,
      views: 50 + (i % 500),
      saves: 5 + (i % 50),
      isApproved: i % 5 !== 0 // Some properties pending approval
    });
  }
  
  return properties;
}

export const allProperties = generateProperties(500);

export const mockUsers = [
  {
    id: 'BUYER1',
    name: 'Arun Mehta',
    email: 'arun@example.com',
    phone: '+91 9876543210',
    role: 'Buyer',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    createdAt: '2024-01-15T10:00:00Z',
    isBlocked: false,
    savedProperties: ['PROP000001', 'PROP000005', 'PROP000010'],
    viewedProperties: ['PROP000001', 'PROP000002', 'PROP000003', 'PROP000004', 'PROP000005'],
    inquiries: []
  },
  {
    id: 'SELLER1',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91 9876543211',
    role: 'Seller',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    createdAt: '2024-01-10T10:00:00Z',
    isBlocked: false,
    savedProperties: [],
    viewedProperties: [],
    inquiries: []
  },
  {
    id: 'ADMIN1',
    name: 'Admin User',
    email: 'admin@indianrealestate.com',
    phone: '+91 9876543200',
    role: 'Admin',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    createdAt: '2024-01-01T10:00:00Z',
    isBlocked: false,
    savedProperties: [],
    viewedProperties: [],
    inquiries: []
  },
  {
    id: 'BUYER2',
    name: 'Priya Singh',
    email: 'priya@example.com',
    phone: '+91 9876543212',
    role: 'Buyer',
    createdAt: '2024-02-01T10:00:00Z',
    isBlocked: false,
    savedProperties: ['PROP000002'],
    viewedProperties: [],
    inquiries: []
  },
  {
    id: 'SELLER2',
    name: 'Vikram Patel',
    email: 'vikram@example.com',
    phone: '+91 9876543213',
    role: 'Seller',
    createdAt: '2024-02-15T10:00:00Z',
    isBlocked: true,
    savedProperties: [],
    viewedProperties: [],
    inquiries: []
  }
];

export const mockInquiries = [
  {
    id: 'INQ001',
    propertyId: 'PROP000001',
    buyerId: 'BUYER1',
    buyerName: 'Arun Mehta',
    buyerPhone: '+91 9876543210',
    sellerId: 'SELLER1',
    message: 'I am interested in this property. Can we schedule a visit?',
    status: 'Pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'INQ002',
    propertyId: 'PROP000005',
    buyerId: 'BUYER1',
    buyerName: 'Arun Mehta',
    buyerPhone: '+91 9876543210',
    sellerId: 'SELLER1',
    message: 'Is the price negotiable?',
    status: 'Contacted',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'INQ003',
    propertyId: 'PROP000010',
    buyerId: 'BUYER2',
    buyerName: 'Priya Singh',
    buyerPhone: '+91 9876543212',
    sellerId: 'SELLER1',
    message: 'Looking for immediate possession. Is this available?',
    status: 'Pending',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const marketAnalytics = {
  totalListings: 500,
  activeListings: 450,
  avgPrice: 7500000,
  avgPricePerSqft: 5500,
  topLocalities: [
    { name: 'Bandra, Mumbai', listings: 45, avgPrice: 25000000 },
    { name: 'Koramangala, Bangalore', listings: 42, avgPrice: 12000000 },
    { name: 'Gurgaon, Delhi NCR', listings: 38, avgPrice: 15000000 },
    { name: 'Hitech City, Hyderabad', listings: 35, avgPrice: 8000000 },
    { name: 'Anna Nagar, Chennai', listings: 30, avgPrice: 9000000 }
  ],
  propertyTypeDistribution: [
    { type: 'Apartment', count: 300 },
    { type: 'Villa', count: 80 },
    { type: 'Plot', count: 60 },
    { type: 'Independent House', count: 40 },
    { type: 'Commercial', count: 20 }
  ],
  priceTrends: [
    { month: 'Jan', avgPrice: 7200000 },
    { month: 'Feb', avgPrice: 7300000 },
    { month: 'Mar', avgPrice: 7400000 },
    { month: 'Apr', avgPrice: 7350000 },
    { month: 'May', avgPrice: 7500000 },
    { month: 'Jun', avgPrice: 7600000 },
    { month: 'Jul', avgPrice: 7550000 },
    { month: 'Aug', avgPrice: 7700000 },
    { month: 'Sep', avgPrice: 7800000 },
    { month: 'Oct', avgPrice: 7750000 },
    { month: 'Nov', avgPrice: 7900000 },
    { month: 'Dec', avgPrice: 8000000 }
  ]
};

export const adminStats = {
  totalUsers: 15234,
  totalBuyers: 12500,
  totalSellers: 2500,
  totalProperties: 14500,
  pendingApprovals: 234,
  activeListings: 12000,
  totalInquiries: 45000,
  revenue: 12500000
};
