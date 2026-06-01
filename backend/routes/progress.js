const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const progressService = require('../services/progressService');

// Middleware to verify token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    const decoded = jwt.verify(token, "mysecretkey");
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Log daily progress
router.post('/log', verifyToken, async (req, res) => {
  try {
    const { skinRating, routineCompleted, morningRoutineDone, nightRoutineDone, skinIssues, notes } = req.body;
    
    const progress = await progressService.logProgress(req.userId, {
      skinRating,
      routineCompleted,
      morningRoutineDone,
      nightRoutineDone,
      skinIssues,
      notes
    });
    
    res.json({
      success: true,
      progress: progress,
      message: "Progress logged successfully"
    });
  } catch (error) {
    console.error("Error logging progress:", error);
    res.status(500).json({ success: false, message: "Failed to log progress" });
  }
});

// Get progress statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const stats = await progressService.getStats(req.userId, days);
    
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, message: "Failed to fetch statistics" });
  }
});

// Get progress history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const history = await progressService.getProgressHistory(req.userId, days);
    
    res.json({
      success: true,
      history: history
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ success: false, message: "Failed to fetch history" });
  }
});

// Rate a product
router.post('/rate-product', verifyToken, async (req, res) => {
  try {
    const { productId, productName, rating } = req.body;
    
    if (!productName || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Invalid product data" });
    }
    
    const progress = await progressService.rateProduct(req.userId, productId, productName, rating);
    
    res.json({
      success: true,
      message: "Product rated successfully",
      progress: progress
    });
  } catch (error) {
    console.error("Error rating product:", error);
    res.status(500).json({ success: false, message: "Failed to rate product" });
  }
});

// Get product ratings
router.get('/product-ratings', verifyToken, async (req, res) => {
  try {
    const ratings = await progressService.getProductRatings(req.userId);
    
    res.json({
      success: true,
      ratings: ratings
    });
  } catch (error) {
    console.error("Error fetching product ratings:", error);
    res.status(500).json({ success: false, message: "Failed to fetch product ratings" });
  }
});

module.exports = router;