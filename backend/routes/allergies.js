const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const allergyService = require('../services/allergyService');

// Middleware to verify token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    const decoded = jwt.verify(token, "mysecretkey");
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Get user's allergies
router.get('/my-allergies', verifyToken, async (req, res) => {
  try {
    res.json({
      success: true,
      allergies: req.user.allergies || []
    });
  } catch (error) {
    console.error("Error fetching allergies:", error);
    res.status(500).json({ success: false, message: "Failed to fetch allergies" });
  }
});

// Update user's allergies
router.post('/update', verifyToken, async (req, res) => {
  try {
    const { allergies } = req.body;
    
    if (!Array.isArray(allergies)) {
      return res.status(400).json({ success: false, message: "Allergies must be an array" });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { allergies: allergies },
      { new: true }
    );
    
    res.json({
      success: true,
      allergies: user.allergies,
      message: "Allergies updated successfully"
    });
  } catch (error) {
    console.error("Error updating allergies:", error);
    res.status(500).json({ success: false, message: "Failed to update allergies" });
  }
});

// Get list of all available allergies
router.get('/list', verifyToken, async (req, res) => {
  try {
    const allergiesList = allergyService.getAllergiesList();
    res.json({
      success: true,
      allergies: allergiesList
    });
  } catch (error) {
    console.error("Error fetching allergies list:", error);
    res.status(500).json({ success: false, message: "Failed to fetch allergies list" });
  }
});

// Check ingredients against user's allergies
router.post('/check', verifyToken, async (req, res) => {
  try {
    const { ingredients } = req.body;
    
    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ success: false, message: "Please provide ingredients array" });
    }
    
    const result = allergyService.detectAllergies(ingredients, req.user.allergies);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Error checking allergies:", error);
    res.status(500).json({ success: false, message: "Failed to check allergies" });
  }
});

// Get safe alternatives for an allergen
router.post('/alternatives', verifyToken, async (req, res) => {
  try {
    const { allergen } = req.body;
    
    if (!allergen) {
      return res.status(400).json({ success: false, message: "Please provide an allergen" });
    }
    
    const alternatives = allergyService.getSafeAlternative(allergen);
    
    res.json({
      success: true,
      allergen: allergen,
      alternatives: alternatives
    });
  } catch (error) {
    console.error("Error fetching alternatives:", error);
    res.status(500).json({ success: false, message: "Failed to fetch alternatives" });
  }
});

module.exports = router;