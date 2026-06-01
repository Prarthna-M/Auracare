const mongoose = require('mongoose');
const Recommendation = require('../models/recommendation');

async function createIndexes() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/auracare');
    
    // Create indexes for faster queries
    await Recommendation.collection.createIndex({ queryHash: 1 }, { unique: true });
    await Recommendation.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days
    await Recommendation.collection.createIndex({ usageCount: -1 });
    
    console.log('✅ Indexes created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
}

createIndexes();