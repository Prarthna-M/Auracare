const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const recommendationService = require('../services/recommendationService');

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

// Get personalized recommendations with AI
router.post('/get', verifyToken, async (req, res) => {
  try {
    const {
      concerns,
      description,
      budget,
      age,
      goal,
      additionalInfo
    } = req.body;
    
    // Validate input
    if (!description && (!concerns || concerns.length === 0)) {
      return res.status(400).json({
        message: "Please provide either a description or list of concerns"
      });
    }
    
    console.log(`Processing recommendation request for user: ${req.user.name}`);
    console.log(`Description: ${description?.substring(0, 100)}...`);
    
    // Get recommendations from service (handles OpenRouter, Gemini, OpenAI, and fallback)
    const result = await recommendationService.getRecommendations(
      {
        concerns,
        description,
        budget: budget ? parseFloat(budget) : null,
        age: age ? parseInt(age) : null,
        goal,
        additionalInfo
      },
      req.user.skinType
    );
    
    // Log cache status
    if (result.fromCache) {
      console.log("✅ Returning cached recommendations");
    } else {
      console.log(`🆕 Generated new recommendations using: ${result.usedModel}`);
    }
    
    res.json({
      success: true,
      fromCache: result.fromCache,
      usedModel: result.usedModel,
      data: result.data,
      message: result.fromCache ? "Retrieved from cache" : `Generated fresh recommendations using ${result.usedModel}`
    });
  } catch (error) {
    console.error("Recommendation API error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate recommendations",
      error: error.message,
      tip: "Please try again or provide more details about your skin concerns"
    });
  }
});

// Get popular recommendations (for inspiration)
router.get('/popular', verifyToken, async (req, res) => {
  try {
    const popular = await recommendationService.getPopularRecommendations();
    
    res.json({
      success: true,
      count: popular.length,
      data: popular,
      message: `Found ${popular.length} popular recommendations`
    });
  } catch (error) {
    console.error("Popular recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch popular recommendations",
      error: error.message
    });
  }
});

// Get recommendation statistics
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const stats = await recommendationService.getRecommendationStats();
    
    res.json({
      success: true,
      data: stats,
      message: "Statistics retrieved successfully"
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message
    });
  }
});

// New endpoint: Test AI connection with OpenRouter
router.get('/test-ai', verifyToken, async (req, res) => {
  try {
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    let openrouterStatus = { available: false, message: "" };
    let geminiStatus = { available: false, message: "" };
    
    // Test OpenRouter
    if (openrouterKey) {
      try {
        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "meta-llama/llama-3-8b-instruct",
            messages: [{ role: "user", content: "Say 'working'" }],
            max_tokens: 10
          },
          {
            headers: {
              Authorization: `Bearer ${openrouterKey}`,
              "Content-Type": "application/json"
            }
          }
        );
        openrouterStatus = {
          available: true,
          message: "OpenRouter (Llama 3) is working!"
        };
      } catch (error) {
        openrouterStatus = {
          available: false,
          message: error.response?.data?.error?.message || error.message
        };
      }
    } else {
      openrouterStatus.message = "OPENROUTER_API_KEY not configured";
    }
    
    // Test Gemini (optional)
    if (geminiKey) {
      try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        await model.generateContent("Say 'working'");
        geminiStatus = {
          available: true,
          message: "Gemini is working!"
        };
      } catch (error) {
        geminiStatus = {
          available: false,
          message: error.message
        };
      }
    } else {
      geminiStatus.message = "GEMINI_API_KEY not configured";
    }
    
    res.json({
      success: true,
      ai_models: {
        openrouter: openrouterStatus,
        gemini: geminiStatus,
        openai: {
          available: !!openaiKey,
          message: openaiKey ? "OpenAI key present" : "OPENAI_API_KEY not configured"
        }
      },
      recommendation_service: {
        status: "active",
        cache_enabled: true
      }
    });
  } catch (error) {
    console.error("AI test error:", error);
    res.status(500).json({
      success: false,
      message: "AI connection test failed",
      error: error.message
    });
  }
});

// New endpoint: Clear cache for a specific query (admin/debug)
router.post('/clear-cache', verifyToken, async (req, res) => {
  try {
    const { queryHash } = req.body;
    
    if (!queryHash) {
      return res.status(400).json({
        success: false,
        message: "Please provide queryHash to clear"
      });
    }
    
    const Recommendation = require('../models/recommendation');
    const deleted = await Recommendation.findOneAndDelete({ queryHash });
    
    res.json({
      success: true,
      message: deleted ? "Cache cleared successfully" : "No cache found for this query",
      deleted: !!deleted
    });
  } catch (error) {
    console.error("Clear cache error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cache",
      error: error.message
    });
  }
});

// New endpoint: Get product suggestions by category
router.post('/by-category', verifyToken, async (req, res) => {
  try {
    const { category, skinType, budget } = req.body;
    const Product = require('../models/Product');
    
    const query = {
      productType: { $regex: category, $options: 'i' }
    };
    
    if (skinType && skinType !== 'All') {
      query.suitableFor = { $regex: skinType, $options: 'i' };
    }
    
    if (budget) {
      query.price = { $lte: parseFloat(budget) };
    }
    
    const products = await Product.find(query).limit(10);
    
    res.json({
      success: true,
      count: products.length,
      data: products,
      message: `Found ${products.length} products in ${category} category`
    });
  } catch (error) {
    console.error("Category products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products by category",
      error: error.message
    });
  }
});

// New endpoint: Get quick recommendations based on skin type only
router.get('/quick/:skinType', verifyToken, async (req, res) => {
  try {
    const { skinType } = req.params;
    const Product = require('../models/Product');
    
    const products = await Product.find({
      $or: [
        { suitableFor: { $regex: skinType, $options: 'i' } },
        { suitableFor: /All/i }
      ]
    }).limit(5);
    
    const morning = products.filter(p => p.routineTime === 'morning');
    const night = products.filter(p => p.routineTime === 'night');
    const both = products.filter(p => p.routineTime === 'both');
    
    res.json({
      success: true,
      skinType: skinType,
      recommendations: {
        morning: morning.slice(0, 3),
        night: night.slice(0, 3),
        anyTime: both.slice(0, 2)
      },
      tips: [
        `For ${skinType} skin, focus on gentle, non-irritating products`,
        "Always patch test new products before full application",
        "Consistency is key - stick to your routine for at least 4 weeks"
      ]
    });
  } catch (error) {
    console.error("Quick recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quick recommendations",
      error: error.message
    });
  }
});

// New endpoint: Get AI-powered product analysis
router.post('/analyze-product', verifyToken, async (req, res) => {
  try {
    const { productName, ingredients } = req.body;
    
    if (!productName && (!ingredients || ingredients.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Please provide product name or ingredients list"
      });
    }
    
    const prompt = `Analyze this skincare product and provide insights:
${productName ? `Product: ${productName}` : ''}
${ingredients ? `Ingredients: ${ingredients.join(', ')}` : ''}

Return JSON with:
- suitability: which skin types it's good for
- concerns: what skin concerns it addresses
- safety_rating: 1-10
- key_benefits: array of main benefits
- warnings: any potential issues`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    let text = response.data.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    
    const analysis = JSON.parse(text);
    
    res.json({
      success: true,
      analysis: analysis,
      message: "Product analysis completed"
    });
  } catch (error) {
    console.error("Product analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to analyze product",
      error: error.message
    });
  }
});

module.exports = router;