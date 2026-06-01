const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const User = require("./models/User");

const app = express();
const communityRoutes = require('./routes/community');
const chatbotRoutes = require('./routes/chatbot'); // ✅ Import chatbot routes
const allergyRoutes = require('./routes/allergies');
const progressRoutes = require('./routes/progress');
const ecoScoreService = require('./services/ecoScoreService');
// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json());

require("dotenv").config();
app.use('/api/allergies', allergyRoutes);
app.use('/api/progress', progressRoutes);
// Initialize OpenRouter AI
let openrouterModel = null;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

try {
  if (!OPENROUTER_API_KEY) {
    console.warn("⚠️  Warning: OPENROUTER_API_KEY not found in environment variables");
  } else {
    console.log("✅ OpenRouter AI initialized successfully");
    openrouterModel = true;
  }
} catch (error) {
  console.error("❌ Failed to initialize OpenRouter:", error.message);
}

// Initialize OpenAI as optional fallback
let openai = null;
try {
  if (process.env.OPENAI_API_KEY) {
    const OpenAI = require("openai");
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    console.log("✅ OpenAI initialized as fallback");
  } else {
    console.log("ℹ️  OpenAI not configured");
  }
} catch (error) {
  console.warn("⚠️  OpenAI initialization skipped:", error.message);
}

/* MongoDB connection */
mongoose.connect("mongodb://127.0.0.1:27017/auracare")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB connection error:", err));

/* ---------------- SIGNUP ---------------- */
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.json({ message: "Signup error" });
  }
});

/* ---------------- LOGIN ---------------- */
/* ---------------- LOGIN ---------------- */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ message: "Invalid password" });
    }

    // Increase token expiration to 30 days
    const token = jwt.sign(
      { id: user._id },
      "mysecretkey",
      { expiresIn: "30d" }  // Changed from 1h to 30d
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.json({ message: "Login error" });
  }
});

/* ---------------- GET PROFILE ---------------- */
app.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, "mysecretkey");
    const user = await User.findById(decoded.id);

    res.json({
      name: user.name,
      email: user.email,
      skinType: user.skinType
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.json({ message: "Profile fetch error" });
  }
});

/* ---------------- SAVE SKIN PROFILE ---------------- */
app.post("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, "mysecretkey");
    const { oil, dry, sensitive } = req.body;

    let skinType = "Normal";
    if (oil === "Yes") {
      skinType = "Oily";
    } else if (dry === "Yes") {
      skinType = "Dry";
    } else if (sensitive === "Yes") {
      skinType = "Sensitive";
    }

    const user = await User.findByIdAndUpdate(
      decoded.id,
      {
        oil,
        dry,
        sensitive,
        skinType
      },
      { new: true }
    );

    res.json({
      message: "Skin profile updated",
      name: user.name,
      email: user.email,
      skinType: user.skinType
    });
  } catch (err) {
    console.log(err);
    res.json({ message: "Profile save error" });
  }
});

/* ---------------- BASIC ROUTE ---------------- */
app.get("/", (req, res) => {
  res.send("Auracare Backend Running");
});

const Product = require("./models/Product");

/* ---------------- ROUTINE RECOMMENDATION ---------------- */
app.get("/routine", async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, "mysecretkey");
    const user = await User.findById(decoded.id);
    const skinType = user.skinType;

    const products = await Product.find({
      $or: [
        { suitableFor: new RegExp(skinType, "i") },
        { suitableFor: /All/i }
      ]
    });

    const morning = products.filter(
      p => p.routineTime && p.routineTime.toLowerCase() === "morning"
    );

    const night = products.filter(
      p => p.routineTime && p.routineTime.toLowerCase() === "night"
    );

    res.json({
      skinType,
      morning,
      night
    });
  } catch (err) {
    console.log(err);
    res.json({ message: "Routine error" });
  }
});

const Ingredient = require("./models/Ingredient");

/* ---------------- CHEMICAL CHECK ---------------- */
app.post("/chemical-check", async (req, res) => {
  try {
    const { ingredients } = req.body;
    const results = [];

    for (const ing of ingredients) {
      const data = await Ingredient.findOne({
        ingredient: { $regex: ing, $options: "i" }
      });

      if (data) {
        results.push({
          ingredient: data.ingredient,
          hazardScore: data.hazardScore,
          riskLevel: data.riskLevel,
          suitableFor: data.suitableFor,
          notSuitableFor: data.notSuitableFor,
          description: data.description
        });
      } else {
        results.push({
          ingredient: ing,
          riskLevel: "Unknown"
        });
      }
    }

    res.json(results);
  } catch (err) {
    console.log(err);
    res.json({ message: "Chemical check error" });
  }
});

/* ---------------- COMMUNITY ROUTES ---------------- */
app.use('/api/community', communityRoutes);

/* ---------------- CHATBOT ROUTES ---------------- */
app.use('/api/chatbot', chatbotRoutes);

/* ---------------- AI SKIN ANALYSIS WITH OPENROUTER ---------------- */
async function callOpenRouterAI(prompt) {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "Auracare Skincare App"
        },
        timeout: 30000
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("OpenRouter API error:", error.response?.data || error.message);
    return null;
  }
}

app.post("/analyze-skin", async (req, res) => {
  try {
    const { description } = req.body;

    const prompt = `
Extract skincare details from the text.

Return ONLY a valid JSON object with no other text:
{
  "skinType": "Oily | Dry | Normal | Sensitive",
  "concerns": ["Acne","Pigmentation","Blackheads","Pores","Dryness"]
}

Text: "${description}"
`;

    let result = null;
    
    // Try OpenRouter first
    if (OPENROUTER_API_KEY) {
      try {
        const aiResponse = await callOpenRouterAI(prompt);
        if (aiResponse) {
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[0]);
            console.log("✅ Analysis completed with OpenRouter");
          }
        }
      } catch (openrouterError) {
        console.log("OpenRouter failed:", openrouterError.message);
      }
    }
    
    // Try OpenAI fallback if available
    if (!result && openai) {
      try {
        const openaiResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }]
        });
        const text = openaiResponse.choices[0].message.content;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
          console.log("✅ Analysis completed with OpenAI fallback");
        }
      } catch (openaiError) {
        console.log("OpenAI failed:", openaiError.message);
      }
    }
    
    // Final fallback: keyword analysis
    if (!result) {
      result = analyzeSkinWithKeywords(description);
      console.log("⚠️ Used keyword-based analysis (no AI available)");
    }

    res.json(result);
  } catch (err) {
    console.error("AI analysis error:", err);
    const fallbackResult = analyzeSkinWithKeywords(req.body.description);
    res.json(fallbackResult);
  }
});

// Helper function for keyword-based analysis (fallback)
function analyzeSkinWithKeywords(description) {
  const lowerDesc = description.toLowerCase();
  let skinType = "Normal";
  const concerns = [];
  
  if (lowerDesc.includes("oily") || lowerDesc.includes("greasy") || lowerDesc.includes("shine")) {
    skinType = "Oily";
  } else if (lowerDesc.includes("dry") || lowerDesc.includes("flaky") || lowerDesc.includes("tight")) {
    skinType = "Dry";
  } else if (lowerDesc.includes("sensitive") || lowerDesc.includes("irritat") || lowerDesc.includes("redness")) {
    skinType = "Sensitive";
  }
  
  const concernKeywords = {
    "Acne": ["acne", "pimple", "breakout", "zit"],
    "Pigmentation": ["pigment", "dark spot", "hyperpigmentation", "melasma"],
    "Blackheads": ["blackhead", "clogged pore"],
    "Pores": ["pore", "large pore"],
    "Dryness": ["dry", "flaky", "dehydrated"],
    "Aging": ["wrinkle", "fine line", "aging", "anti-aging"],
    "Sensitivity": ["sensitive", "irritat", "redness", "burn"]
  };
  
  for (const [concern, keywords] of Object.entries(concernKeywords)) {
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      concerns.push(concern);
    }
  }
  
  return {
    skinType,
    concerns: concerns.length > 0 ? concerns : ["General skincare"]
  };
}

/* ---------------- SMART RECOMMENDATION (Enhanced) ---------------- */
app.post("/recommend-smart", async (req, res) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, "mysecretkey");
    const user = await User.findById(decoded.id);
    const { concerns, budget, goal, aiData } = req.body;

    const finalSkinType = aiData?.skinType || user.skinType;
    const finalConcerns = [
      ...new Set([
        ...(concerns || []),
        ...(aiData?.concerns || [])
      ])
    ];

    const products = await Product.find();

    const scoredProducts = products.map(p => {
      let score = 0;

      if (p.suitableFor && p.suitableFor.toLowerCase().includes(finalSkinType.toLowerCase())) {
        score += 5;
      }

      finalConcerns.forEach(c => {
        if (p.concerns && p.concerns.includes(c)) {
          score += 4;
        }
      });

      if (goal && p.goal && p.goal.includes(goal)) {
        score += 3;
      }

      if (budget && p.price <= budget) {
        score += 2;
      }

      score += p.rating || 0;

      return {
        ...p._doc,
        score
      };
    });

    scoredProducts.sort((a, b) => b.score - a.score);

    res.json({
      skinType: finalSkinType,
      concerns: finalConcerns,
      recommendations: scoredProducts.slice(0, 10)
    });
  } catch (err) {
    console.log(err);
    res.json({ message: "Recommendation error" });
  }
});

/* =============== NEW RECOMMENDATION SYSTEM WITH CACHING =============== */

// Import Recommendation model and service
const Recommendation = require("./models/recommendation");
const recommendationService = require("./services/recommendationService");

/* ---------------- GET PERSONALIZED RECOMMENDATIONS WITH CACHING ---------------- */
app.post("/api/recommendations/get", async (req, res) => {
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

    const {
      concerns,
      description,
      budget,
      age,
      goal,
      additionalInfo
    } = req.body;

    if (!description && (!concerns || concerns.length === 0)) {
      return res.status(400).json({
        message: "Please provide either a description or list of concerns"
      });
    }

    const result = await recommendationService.getRecommendations(
      {
        concerns,
        description,
        budget: budget ? parseFloat(budget) : null,
        age: age ? parseInt(age) : null,
        goal,
        additionalInfo
      },
      user.skinType
    );

    res.json({
      success: true,
      fromCache: result.fromCache,
      data: result.data
    });
  } catch (error) {
    console.error("Recommendation API error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate recommendations",
      error: error.message
    });
  }
});

/* ---------------- GET POPULAR RECOMMENDATIONS ---------------- */
app.get("/api/recommendations/popular", async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, "mysecretkey");
    const popular = await recommendationService.getPopularRecommendations();

    res.json({
      success: true,
      data: popular
    });
  } catch (error) {
    console.error("Popular recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch popular recommendations"
    });
  }
});

/* ---------------- GET RECOMMENDATION STATISTICS ---------------- */
app.get("/api/recommendations/stats", async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, "mysecretkey");
    const stats = await recommendationService.getRecommendationStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics"
    });
  }
});

/* ---------------- TEST AI CONNECTION ENDPOINT ---------------- */
app.get("/api/test-ai", async (req, res) => {
  res.json({
    openrouter: {
      available: !!OPENROUTER_API_KEY,
      keyPresent: !!OPENROUTER_API_KEY
    },
    openai: {
      available: !!openai,
      keyPresent: !!process.env.OPENAI_API_KEY
    }
  });
});

app.get('/api/eco/tips', async (req, res) => {
  const tips = ecoScoreService.getEcoTips();
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  res.json({ success: true, tip: randomTip });
});

// Add eco score calculation endpoint
app.post('/api/eco/calculate', async (req, res) => {
  try {
    const { ingredients } = req.body;
    const result = ecoScoreService.calculateProductEcoScore(ingredients);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ---------------- SERVER ---------------- */
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📊 MongoDB: Connected`);
  console.log(`🤖 AI Status:`);
  console.log(`   - OpenRouter: ${OPENROUTER_API_KEY ? '✅ Available' : '❌ Not configured'}`);
  console.log(`   - OpenAI: ${openai ? '✅ Available' : '❌ Not configured (optional)'}`);
  console.log(`\n💡 Tip: Add OPENROUTER_API_KEY to .env file for AI features`);
  console.log(`💬 Chatbot endpoint: http://localhost:${PORT}/api/chatbot/test\n`);
});