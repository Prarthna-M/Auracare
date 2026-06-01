const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  
  // Daily tracking
  routineCompleted: {
    type: Boolean,
    default: false
  },
  morningRoutineDone: {
    type: Boolean,
    default: false
  },
  nightRoutineDone: {
    type: Boolean,
    default: false
  },
  
  // Skin condition
  skinRating: {
    type: Number,
    min: 1,
    max: 10,
    default: 5,
    description: "How does your skin feel today? (1=very bad, 10=excellent)"
  },
  skinIssues: {
    type: [String],
    default: [],
    enum: ['Acne', 'Dryness', 'Oiliness', 'Redness', 'Irritation', 'Pigmentation', 'None']
  },
  
  // Measurements (optional)
  photos: [{
    url: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Product usage
  productsUsed: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    rating: { type: Number, min: 1, max: 5 }
  }],
  
  // Notes
  notes: {
    type: String,
    maxlength: 500
  },
  
  // Goals tracking
  goals: {
    type: Map,
    of: Boolean,
    default: {}
  }
}, { timestamps: true });

// Index for efficient querying
progressSchema.index({ user: 1, date: -1 });

const Progress = mongoose.models.Progress || mongoose.model('Progress', progressSchema);

module.exports = Progress;