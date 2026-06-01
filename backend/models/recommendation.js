const mongoose = require('mongoose');
const crypto = require('crypto');

// Check if the model already exists to prevent overwrite
const recommendationSchema = new mongoose.Schema({
  // User query parameters
  query: {
    concerns: [String],
    description: String,
    budget: Number,
    age: Number,
    skinType: String,
    goal: String,
    additionalInfo: String
  },
  
  // AI generated response
  aiResponse: {
    skinType: String,
    concerns: [String],
    recommendations: [{
      name: String,
      brand: String,
      category: String,
      price: Number,
      description: String,
      whyRecommended: String,
      keyIngredients: [String],
      suitabilityScore: Number,
      whereToBuy: String,
      imageUrl: String
    }],
    routine: {
      morning: [{
        name: String,
        step: String,
        description: String
      }],
      night: [{
        name: String,
        step: String,
        description: String
      }]
    },
    tips: [String],
    summary: String
  },
  
  // Hash of the query for quick lookup
  queryHash: {
    type: String,
    unique: true,
    index: true
  },
  
  // Cache metadata
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60 // Auto-delete after 30 days
  },
  
  usageCount: {
    type: Number,
    default: 1
  },
  
  usedModel: {
    type: String,
    default: "Unknown"
  }
});

// Create hash from query parameters
recommendationSchema.statics.createQueryHash = function(query) {
  const queryString = JSON.stringify({
    concerns: query.concerns?.sort(),
    description: query.description,
    budget: query.budget,
    age: query.age,
    skinType: query.skinType,
    goal: query.goal,
    additionalInfo: query.additionalInfo
  });
  
  return crypto.createHash('sha256').update(queryString).digest('hex');
};

// Prevent model overwrite by checking if it already exists
const Recommendation = mongoose.models.Recommendation || mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation;