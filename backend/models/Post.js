const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  // Product information
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
  productType: {
    type: String,
    required: true,
    enum: ['Cleanser', 'Serum', 'Moisturizer', 'Sunscreen', 'Toner', 'Mask', 'Treatment']
  },
  
  // Review information
  skinType: {
    type: String,
    required: true,
    enum: ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal']
  },
  daysUsed: {
    type: Number,
    required: true,
    min: 1
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true,
    trim: true
  },
  beforeAfter: {
    type: String,
    default: ''
  },
  wouldRepurchase: {
    type: Boolean,
    default: true
  },
  
  // User information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  
  // Engagement metrics
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  comments: [commentSchema],
  commentsCount: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search functionality
postSchema.index({ productName: 'text', brand: 'text', review: 'text' });

module.exports = mongoose.model('Post', postSchema);