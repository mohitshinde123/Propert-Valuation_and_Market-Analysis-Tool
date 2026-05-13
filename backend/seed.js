import fs from 'fs';
import csv from 'csv-parse';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './models/Property.js';
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const BATCH_SIZE = 1000;

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
};

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv.parse({ 
        columns: true, 
        skip_empty_lines: true,
        trim: true
      }))
      .on('data', (row) => {
        // Transform CSV row to match Property schema
        results.push({
          title: row.title || `${row.bhk}BHK ${row.property_type} in ${row.locality}`,
          city: row.city,
          locality: row.locality,
          state: row.state,
          propertyType: row.property_type,
          bhk: parseInt(row.bhk) || 0,
          price: parseFloat(row.price) || 0,
          priceUnit: row.price >= 10000000 ? 'Crores' : 'Lakhs',
          area: parseFloat(row.area) || 0,
          areaUnit: row.area_unit || 'sq.ft',
          bedrooms: parseInt(row.bedrooms) || parseInt(row.bhk),
          bathrooms: parseInt(row.bathrooms) || 1,
          balconies: parseInt(row.balconies) || 1,
          floor: row.floor || '1',
          totalFloors: parseInt(row.total_floors) || 1,
          facing: row.facing || 'East',
          furnishing: row.furnishing || 'Unfurnished',
          status: row.status || 'Ready to Move',
          listedBy: row.listed_by || 'Owner',
          amenities: row.amenities ? row.amenities.split(',') : [],
          description: row.description || '',
          images: row.images ? row.images.split(',') : [],
          ownerName: row.owner_name || 'Property Owner',
          ownerPhone: row.owner_phone || '',
          isVerified: row.is_verified === 'true',
          reraApproved: row.rera_approved === 'true'
        });
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Property.deleteMany({});
    console.log('Cleared existing properties');

    // Parse CSV
    console.log('Parsing CSV file...');
    const properties = await parseCSV('./data/Indian_Real_Estate_Clean_Data.csv');
    console.log(`Parsed ${properties.length} properties`);

    // Insert in batches
    const totalBatches = Math.ceil(properties.length / BATCH_SIZE);
    
    for (let i = 0; i < totalBatches; i++) {
      const start = i * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, properties.length);
      const batch = properties.slice(start, end);
      
      await Property.insertMany(batch, { ordered: false });
      console.log(`Inserted batch ${i + 1}/${totalBatches} (${batch.length} records)`);
    }

    console.log(`✅ Successfully seeded ${properties.length} properties`);
    
    // Create indexes
    await Property.createIndexes();
    console.log('✅ Indexes created');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();