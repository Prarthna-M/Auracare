const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  routineTime: {
    type: String,
    required: true,
    trim: true
  },
  productType: {
    type: String,
    required: true,
    trim: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  ingredients: {
    type: [String],
    default: []
  },
  suitableFor: {
    type: String,
    trim: true,
    default: "All"
  },
  concerns: {
    type: [String],
    default: []
  },
  goal: {
    type: [String],
    default: []
  },
  price: {
    type: Number,
    min: 0,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 3
  },
  description: {
    type: String,
    default: ""
  },
  keyIngredients: {
    type: [String],
    default: []
  },
  whereToBuy: {
    type: String,
    default: ""
  },
  imageUrl: {
    type: String,
    default: ""
  },
  routineStep: {
    type: String,
    enum: ['cleanse', 'tone', 'treat', 'moisturize', 'protect'],
    default: 'treat'
  }
}, { timestamps: true });

// Prevent model overwrite
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

module.exports = Product;