import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Lead from '../models/Lead.js';
import dns from 'node:dns';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Parse CSV data
const parseCSV = (csvContent) => {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    // Handle CSV with potential commas in quoted fields
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }
  
  return data;
};

// Map CSV row to Property schema
const mapCSVToProperty = (row, adminUser) => {
  // Helper function to parse numeric values
  const parseNumber = (value) => {
    if (!value) return 0;
    const cleaned = value.toString().replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
  };

  // Helper function to parse price (handle lakhs/crores)
  const parsePrice = (value) => {
    if (!value) return 0;
    const str = value.toString().toLowerCase();
    let num = parseFloat(str.replace(/[^\d.]/g, '')) || 0;
    
    if (str.includes('cr') || str.includes('crore')) {
      num = num * 10000000;
    } else if (str.includes('lac') || str.includes('lakh')) {
      num = num * 100000;
    }
    
    return Math.round(num);
  };

  // Map property type
  const mapPropertyType = (type) => {
    if (!type) return 'Apartment';
    const typeMap = {
      'apartment': 'Apartment',
      'flat': 'Apartment',
      'villa': 'Villa',
      'plot': 'Plot',
      'land': 'Plot',
      'house': 'Independent House',
      'independent house': 'Independent House',
      'commercial': 'Commercial',
      'office': 'Commercial',
      'shop': 'Commercial',
      'studio': 'Studio',
      'penthouse': 'Penthouse'
    };
    return typeMap[type.toLowerCase()] || 'Apartment';
  };

  // Map status
  const mapStatus = (status) => {
    if (!status) return 'Ready to Move';
    const statusMap = {
      'ready to move': 'Ready to Move',
      'ready': 'Ready to Move',
      'under construction': 'Under Construction',
      'new launch': 'New Launch',
      'resale': 'Resale'
    };
    return statusMap[status.toLowerCase()] || 'Ready to Move';
  };

  // Map furnishing
  const mapFurnishing = (furnishing) => {
    if (!furnishing) return 'Unfurnished';
    const furnishingMap = {
      'furnished': 'Furnished',
      'semi-furnished': 'Semi-Furnished',
      'semi furnished': 'Semi-Furnished',
      'unfurnished': 'Unfurnished'
    };
    return furnishingMap[furnishing.toLowerCase()] || 'Unfurnished';
  };

  // Map facing
  const mapFacing = (facing) => {
    if (!facing) return '';
    const facingMap = {
      'north': 'North',
      'south': 'South',
      'east': 'East',
      'west': 'West',
      'north-east': 'North-East',
      'north east': 'North-East',
      'north-west': 'North-West',
      'north west': 'North-West',
      'south-east': 'South-East',
      'south east': 'South-East',
      'south-west': 'South-West',
      'south west': 'South-West'
    };
    return facingMap[facing.toLowerCase()] || '';
  };

  // Get city state mapping
  const getCityState = (city) => {
    const stateMap = {
      'mumbai': 'Maharashtra',
      'pune': 'Maharashtra',
      'delhi': 'Delhi',
      'new delhi': 'Delhi',
      'bangalore': 'Karnataka',
      'bengaluru': 'Karnataka',
      'hyderabad': 'Telangana',
      'chennai': 'Tamil Nadu',
      'kolkata': 'West Bengal',
      'ahmedabad': 'Gujarat',
      'gurgaon': 'Haryana',
      'gurugram': 'Haryana',
      'noida': 'Uttar Pradesh',
      'greater noida': 'Uttar Pradesh'
    };
    return stateMap[city?.toLowerCase()] || '';
  };

  // Extract fields from CSV (handle various column names)
  const title = row['Title'] || row['title'] || row['Property_Title'] || 
    `${row['Bedrooms'] || '2'} BHK ${row['Property_Type'] || 'Apartment'} in ${row['Locality'] || row['City'] || 'Unknown'}`;
  
  const city = row['City'] || row['city'] || 'Mumbai';
  const locality = row['Locality'] || row['locality'] || row['Area'] || 'Central';
  const price = parsePrice(row['Price'] || row['price'] || row['Amount']);
  const area = parseNumber(row['Area'] || row['area'] || row['Size'] || row['Super_Area'] || row['Carpet_Area'] || 1000);
  const bedrooms = parseNumber(row['Bedrooms'] || row['BHK'] || row['bedrooms'] || 2);
  const bathrooms = parseNumber(row['Bathrooms'] || row['bathrooms'] || 1);
  const propertyType = mapPropertyType(row['Property_Type'] || row['Type'] || row['property_type']);
  const status = mapStatus(row['Status'] || row['status']);
  const furnishing = mapFurnishing(row['Furnishing'] || row['furnishing']);
  const facing = mapFacing(row['Facing'] || row['facing']);
  const age = parseNumber(row['Age'] || row['age'] || row['Property_Age'] || 0);
  const floor = row['Floor'] || row['floor'] || '0';
  const totalFloors = parseNumber(row['Total_Floors'] || row['total_floors'] || 0);

  return {
    title,
    description: row['Description'] || row['description'] || `Beautiful ${propertyType.toLowerCase()} located in ${locality}, ${city}`,
    price,
    pricePerSqft: area > 0 ? Math.round(price / area) : 0,
    area,
    areaUnit: 'sqft',
    bedrooms,
    bathrooms,
    balconies: parseNumber(row['Balconies'] || row['balconies'] || 1),
    floor: floor.toString(),
    totalFloors,
    propertyType,
    status,
    furnishing,
    facing,
    age,
    location: {
      address: row['Address'] || row['address'] || `${locality}, ${city}`,
      locality,
      city,
      state: row['State'] || row['state'] || getCityState(city),
      pinCode: row['Pincode'] || row['Pin_Code'] || row['pincode'] || '',
      latitude: parseNumber(row['Latitude'] || row['latitude']),
      longitude: parseNumber(row['Longitude'] || row['longitude'])
    },
    amenities: (row['Amenities'] || row['amenities'] || 'Parking,Security').split(',').map(a => a.trim()).filter(a => a),
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
    ],
    seller: adminUser._id,
    sellerName: adminUser.name,
    sellerPhone: adminUser.phone || '+91 9876543200',
    sellerEmail: adminUser.email,
    isVerified: Math.random() > 0.3,
    isFeatured: Math.random() > 0.8,
    isApproved: true, // Auto-approve seeded data
    views: Math.floor(Math.random() * 500),
    saves: Math.floor(Math.random() * 50),
    csvId: row['ID'] || row['id'] || null
  };
};

// Generate sample properties if no CSV
const generateSampleProperties = (count, adminUser) => {
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'];
  const localities = {
    'Mumbai': ['Andheri', 'Bandra', 'Juhu', 'Powai', 'Thane', 'Navi Mumbai'],
    'Delhi': ['Dwarka', 'Rohini', 'Saket', 'Vasant Kunj', 'Gurgaon', 'Noida'],
    'Bangalore': ['Whitefield', 'Koramangala', 'Indiranagar', 'HSR Layout', 'Electronic City'],
    'Hyderabad': ['Gachibowli', 'Hitech City', 'Kondapur', 'Madhapur', 'Kukatpally'],
    'Chennai': ['Adyar', 'Anna Nagar', 'T Nagar', 'Velachery', 'OMR'],
    'Pune': ['Hinjewadi', 'Kharadi', 'Wakad', 'Baner', 'Aundh'],
    'Kolkata': ['Salt Lake', 'New Town', 'Rajarhat', 'Park Street', 'Alipore'],
    'Ahmedabad': ['Satellite', 'Vastrapur', 'Bopal', 'SG Highway', 'Prahlad Nagar']
  };
  
  const propertyTypes = ['Apartment', 'Villa', 'Plot', 'Independent House', 'Commercial'];
  const statuses = ['Ready to Move', 'Under Construction', 'New Launch'];
  const furnishings = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
  const facings = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];
  const amenitiesList = ['Swimming Pool', 'Gym', 'Club House', 'Park', 'Security', 'Power Backup', 'Lift', 'Parking', 'Garden', 'Play Area'];

  const properties = [];

  for (let i = 0; i < count; i++) {
    const city = cities[i % cities.length];
    const locality = localities[city][i % localities[city].length];
    const propertyType = propertyTypes[i % propertyTypes.length];
    const area = propertyType === 'Plot' ? 1000 + (i % 50) * 100 : 500 + (i % 30) * 50;
    const basePricePerSqft = 3000 + (cities.indexOf(city) * 500) + (i % 1000);
    const price = Math.round(area * basePricePerSqft / 100000) * 100000;

    properties.push({
      title: `${propertyType === 'Apartment' ? `${1 + (i % 4)} BHK` : propertyType} in ${locality}, ${city}`,
      description: `Beautiful ${propertyType.toLowerCase()} located in the prime area of ${locality}. This property offers modern amenities, excellent connectivity, and a comfortable living experience.`,
      price,
      pricePerSqft: basePricePerSqft,
      area,
      areaUnit: 'sqft',
      bedrooms: propertyType === 'Plot' ? 0 : 1 + (i % 4),
      bathrooms: propertyType === 'Plot' ? 0 : 1 + (i % 3),
      balconies: propertyType === 'Plot' ? 0 : 1 + (i % 2),
      floor: propertyType === 'Plot' ? '0' : `${1 + (i % 20)}`,
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
        pinCode: `${110000 + i}`,
        latitude: 12.9716 + (Math.random() - 0.5) * 10,
        longitude: 77.5946 + (Math.random() - 0.5) * 10
      },
      amenities: amenitiesList.slice(0, 5 + (i % 10)),
      images: [
        `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop`,
        `https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop`
      ],
      seller: adminUser._id,
      sellerName: adminUser.name,
      sellerPhone: adminUser.phone || '+91 9876543200',
      sellerEmail: adminUser.email,
      isVerified: i % 3 !== 0,
      isFeatured: i % 10 === 0,
      isApproved: true,
      views: 50 + (i % 500),
      saves: 5 + (i % 50)
    });
  }

  return properties;
};

// Get city state mapping
const getCityState = (city) => {
  const stateMap = {
    'mumbai': 'Maharashtra',
    'pune': 'Maharashtra',
    'delhi': 'Delhi',
    'bangalore': 'Karnataka',
    'hyderabad': 'Telangana',
    'chennai': 'Tamil Nadu',
    'kolkata': 'West Bengal',
    'ahmedabad': 'Gujarat'
  };
  return stateMap[city?.toLowerCase()] || '';
};

// Main seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Property.deleteMany({});
    await Lead.deleteMany({});

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@indianrealestate.com',
      password: 'admin123',
      phone: '+91 9876543200',
      role: 'Admin'
    });

    // Create sample sellers
    console.log('👤 Creating sample sellers...');
    const seller1 = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      password: 'seller123',
      phone: '+91 9876543211',
      role: 'Seller'
    });

    const seller2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: 'seller123',
      phone: '+91 9876543212',
      role: 'Seller'
    });

    // Create sample buyers
    console.log('👤 Creating sample buyers...');
    const buyer1 = await User.create({
      name: 'Arun Mehta',
      email: 'arun@example.com',
      password: 'buyer123',
      phone: '+91 9876543210',
      role: 'Buyer'
    });

    const buyer2 = await User.create({
      name: 'Sneha Gupta',
      email: 'sneha@example.com',
      password: 'buyer123',
      phone: '+91 9876543213',
      role: 'Buyer'
    });

    console.log('✅ Users created');

    // Import properties from CSV or generate sample data
    let properties = [];
    const csvPath = path.join(__dirname, '../data/Indian_Real_Estate_Clean_Data.csv');

    if (fs.existsSync(csvPath)) {
      console.log('📄 Reading CSV file...');
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const csvData = parseCSV(csvContent);
      
      console.log(`📊 Found ${csvData.length} rows in CSV`);
      
      // Map CSV data to properties
      properties = csvData.map((row, index) => {
        const property = mapCSVToProperty(row, adminUser);
        // Distribute among sellers
        property.seller = index % 2 === 0 ? seller1._id : seller2._id;
        property.sellerName = index % 2 === 0 ? seller1.name : seller2.name;
        property.sellerEmail = index % 2 === 0 ? seller1.email : seller2.email;
        return property;
      });
    } else {
      console.log('📄 No CSV file found, generating sample properties...');
      properties = generateSampleProperties(100, adminUser);
      
      // Distribute among sellers
      properties = properties.map((prop, index) => ({
        ...prop,
        seller: index % 2 === 0 ? seller1._id : seller2._id,
        sellerName: index % 2 === 0 ? seller1.name : seller2.name,
        sellerEmail: index % 2 === 0 ? seller1.email : seller2.email
      }));
    }

    // Insert properties in batches
    console.log(`🏠 Inserting ${properties.length} properties...`);
    const batchSize = 100;
    for (let i = 0; i < properties.length; i += batchSize) {
      const batch = properties.slice(i, i + batchSize);
      await Property.insertMany(batch);
      console.log(`   Inserted ${Math.min(i + batchSize, properties.length)} of ${properties.length}`);
    }

    // Create sample leads
    console.log('📋 Creating sample leads...');
    const sampleProperties = await Property.find().limit(5);
    
    const leads = sampleProperties.map((property, index) => ({
      property: property._id,
      propertyTitle: property.title,
      buyer: index % 2 === 0 ? buyer1._id : buyer2._id,
      buyerName: index % 2 === 0 ? buyer1.name : buyer2.name,
      buyerEmail: index % 2 === 0 ? buyer1.email : buyer2.email,
      buyerPhone: index % 2 === 0 ? buyer1.phone : buyer2.phone,
      seller: property.seller,
      sellerName: property.sellerName,
      message: [
        'I am interested in this property. Can we schedule a visit?',
        'Is the price negotiable?',
        'What are the nearby amenities?',
        'Looking for immediate possession. Is this available?',
        'Can you share more photos of the property?'
      ][index],
      inquiryType: ['General', 'Visit Request', 'Price Negotiation', 'General', 'General'][index],
      status: ['New', 'Contacted', 'Visit Scheduled', 'New', 'New'][index],
      source: 'Website'
    }));

    await Lead.insertMany(leads);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${await User.countDocuments()}`);
    console.log(`   Properties: ${await Property.countDocuments()}`);
    console.log(`   Leads: ${await Lead.countDocuments()}`);
    console.log('\n🔐 Demo Credentials:');
    console.log('   Admin:  admin@indianrealestate.com / admin123');
    console.log('   Seller: rajesh@example.com / seller123');
    console.log('   Buyer:  arun@example.com / buyer123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
