const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  skinType: {
    type: String,
    default: "Normal"
  },
  oil: String,
  dry: String,
  sensitive: String,
  
  // NEW: Allergies field
  allergies: {
    type: [String],
    default: [],
    enum: [
      'Fragrance',
      'Parabens', 
      'Sulfates',
      'Phthalates',
      'Nuts',
      'Lanolin',
      'Formaldehyde',
      'Essential Oils',
      'Alcohol',
      'Aloe Vera',
      'Coconut',
      'Gluten',
      'Soy',
      'Dairy',
      'Latex',
      'Nickel'
    ]
  },
  
  // Progress tracking fields
  skincareGoals: {
    type: [String],
    default: []
  },
  skinConcerns: {
    type: [String],
    default: []
  }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;