const mongoose = require("mongoose");

const IngredientSchema = new mongoose.Schema({
  ingredient: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  hazardScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  
  riskLevel: {
    type: String,
    enum: ['Low', 'Moderate', 'Medium', 'High', 'Unknown'],
    default: 'Unknown'
  },
  
  suitableFor: {
    type: String,
    default: ""
  },
  
  notSuitableFor: {
    type: String,
    default: ""
  },
  
  description: {
    type: String,
    default: ""
  },
  
  // ECO FIELDS
  ecoScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  ecoRating: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor', 'Unknown'],
    default: 'Unknown'
  },
  biodegradability: {
    type: String,
    enum: ['High', 'Medium', 'Low', 'Unknown'],
    default: 'Unknown'
  },
  renewableSource: {
    type: String,
    enum: ['Yes', 'Partially', 'No', 'Unknown'],
    default: 'Unknown'
  },
  waterPollution: {
    type: String,
    enum: ['Low Risk', 'Medium Risk', 'High Risk', 'Unknown'],
    default: 'Unknown'
  },
  aquaticToxicity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Unknown'],
    default: 'Unknown'
  },
  carbonFootprint: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Unknown'],
    default: 'Unknown'
  },
  sustainabilityNotes: {
    type: String,
    default: ""
  }
}, { timestamps: true });

const Ingredient = mongoose.models.Ingredient || mongoose.model("Ingredient", IngredientSchema);

module.exports = Ingredient;