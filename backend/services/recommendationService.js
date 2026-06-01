const OpenAI = require("openai");
const axios = require("axios");
const Recommendation = require("../models/recommendation");
const Product = require("../models/Product");
const { GoogleGenerativeAI } = require("@google/generative-ai");

class RecommendationService {
  constructor() {
    // Initialize OpenRouter
    this.openrouterApiKey = process.env.OPENROUTER_API_KEY;
    this.openrouterEnabled = !!this.openrouterApiKey;
    
    if (this.openrouterEnabled) {
      console.log("✅ OpenRouter AI initialized successfully");
    } else {
      console.warn("⚠️ OPENROUTER_API_KEY not found in environment variables");
    }
    
    // Initialize Gemini as backup
    try {
      if (!process.env.GEMINI_API_KEY) {
        console.log(" GEMINI_API_KEY not found (will use OpenRouter only)");
      } else {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.geminiModel = this.genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash"
        });
        console.log("✅ Gemini initialized as backup");
      }
    } catch (error) {
      console.error("❌ Failed to initialize Gemini:", error.message);
      this.geminiModel = null;
    }
    
    // Initialize OpenAI as optional fallback
    this.openai = null;
    try {
      if (process.env.OPENAI_API_KEY) {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
        console.log("✅ OpenAI initialized as fallback");
      }
    } catch (error) {
      console.warn("⚠️ OpenAI initialization skipped:", error.message);
    }
  }

  async getRecommendations(userQuery, userSkinType = null) {
    try {
      // Create query hash for caching
      const queryHash = Recommendation.createQueryHash(userQuery);
      
      // Check if we have cached recommendations
      let cachedRecommendation = await Recommendation.findOne({ queryHash });
      
      if (cachedRecommendation) {
        cachedRecommendation.usageCount += 1;
        await cachedRecommendation.save();
        console.log("✅ Returning cached recommendations");
        return {
          fromCache: true,
          data: cachedRecommendation.aiResponse
        };
      }
      
      console.log("🔄 No cache found, generating new recommendations...");
      console.log(`📝 Query: ${userQuery.description?.substring(0, 100)}...`);
      console.log(`👤 Skin type: ${userSkinType}`);
      
      // Try AI in order: OpenRouter -> Gemini -> OpenAI -> Database
      let aiRecommendations = null;
      let usedModel = null;
      
      // Try OpenRouter first (working!)
      if (this.openrouterEnabled) {
        try {
          console.log("🤖 Attempting to generate with OpenRouter (Llama 3)...");
          aiRecommendations = await this.generateWithOpenRouter(userQuery, userSkinType);
          usedModel = "OpenRouter (Llama 3)";
          console.log("✅ Successfully generated with OpenRouter");
        } catch (openrouterError) {
          console.error("❌ OpenRouter failed:", openrouterError.message);
        }
      }
      
      // Try Gemini as fallback if OpenRouter failed
      if (!aiRecommendations && this.geminiModel) {
        try {
          console.log("🤖 Attempting to generate with Gemini...");
          aiRecommendations = await this.generateWithGemini(userQuery, userSkinType);
          usedModel = "Gemini";
          console.log("✅ Successfully generated with Gemini");
        } catch (geminiError) {
          console.error("❌ Gemini failed:", geminiError.message);
        }
      }
      
      // Try OpenAI as second fallback
      if (!aiRecommendations && this.openai) {
        try {
          console.log("🤖 Attempting to generate with OpenAI...");
          aiRecommendations = await this.generateWithOpenAI(userQuery, userSkinType);
          usedModel = "OpenAI";
          console.log("✅ Successfully generated with OpenAI");
        } catch (openaiError) {
          console.error("❌ OpenAI failed:", openaiError.message);
        }
      }
      
      // Final fallback: database recommendations
      if (!aiRecommendations) {
        console.log("📊 Using database fallback recommendations");
        aiRecommendations = await this.generateFallbackRecommendations(userQuery, userSkinType);
        usedModel = "Database";
      }
      
      console.log(`✅ Final recommendations generated using: ${usedModel}`);
      
      // Enrich recommendations with product data from database
      const enrichedRecommendations = await this.enrichWithDatabaseProducts(aiRecommendations);
      
      // Save to cache
      const newRecommendation = new Recommendation({
        query: userQuery,
        aiResponse: enrichedRecommendations,
        queryHash: queryHash,
        usedModel: usedModel
      });
      
      await newRecommendation.save();
      console.log(`💾 Saved to cache with model: ${usedModel}`);
      
      return {
        fromCache: false,
        data: enrichedRecommendations,
        usedModel: usedModel
      };
    } catch (error) {
      console.error("❌ Recommendation service error:", error);
      throw error;
    }
  }
  
  // OpenRouter method using Meta's Llama 3 (FREE and working!)
  async generateWithOpenRouter(query, userSkinType) {
    try {
      console.log("🤖 Calling OpenRouter API with Llama 3...");
      
      const prompt = `You are a professional skincare consultant. Based on the user's information, provide personalized skincare recommendations.

User Information:
${query.description ? `- Description: ${query.description}` : ''}
${query.concerns?.length ? `- Concerns: ${query.concerns.join(', ')}` : ''}
${query.budget ? `- Budget: $${query.budget} per product` : ''}
${query.age ? `- Age: ${query.age}` : ''}
${userSkinType ? `- Skin Type: ${userSkinType}` : ''}
${query.goal ? `- Goal: ${query.goal}` : ''}
${query.additionalInfo ? `- Additional Info: ${query.additionalInfo}` : ''}

Provide a comprehensive skincare routine and product recommendations. Return ONLY a valid JSON object with no other text or markdown. Use this exact structure:

{
  "skinType": "Oily/Dry/Combination/Normal/Sensitive",
  "concerns": ["Concern1", "Concern2"],
  "recommendations": [
    {
      "name": "Product name",
      "brand": "Brand name",
      "category": "Cleanser/Moisturizer/Serum/Sunscreen/Toner/Exfoliator/Mask",
      "price": 25,
      "description": "Brief product description",
      "whyRecommended": "Why this product is suitable for the user",
      "keyIngredients": ["Ingredient1", "Ingredient2"],
      "suitabilityScore": 8,
      "whereToBuy": "Sephora/Ulta/Drugstore/Online"
    }
  ],
  "routine": {
    "morning": [
      {"name": "Product name", "step": "Cleanse/Tone/Treat/Moisturize/Protect", "description": "How to use"}
    ],
    "night": [
      {"name": "Product name", "step": "Cleanse/Tone/Treat/Moisturize", "description": "How to use"}
    ]
  },
  "tips": ["Skincare tip 1", "Skincare tip 2"],
  "summary": "Brief summary of the recommended routine"
}

Important: 
- Provide 5-7 product recommendations across different categories
- Consider the user's budget when suggesting products
- Make recommendations practical and accessible
- Return ONLY the JSON object, no other text`;

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
          max_tokens: 2000
        },
        {
          headers: {
            Authorization: `Bearer ${this.openrouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5000",
            "X-Title": "Auracare Skincare App"
          }
        }
      );

      let text = response.data.choices[0].message.content;
      console.log("📥 Received response from OpenRouter");
      
      // Clean up the response - remove markdown code blocks
      text = text.trim();
      if (text.startsWith('```json')) {
        text = text.replace(/```json\n?/, '');
        text = text.replace(/```\n?$/, '');
      } else if (text.startsWith('```')) {
        text = text.replace(/```\n?/, '');
        text = text.replace(/```\n?$/, '');
      }
      
      // Extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }
      
      const parsedResult = JSON.parse(text);
      console.log("✅ OpenRouter response parsed successfully");
      return parsedResult;
      
    } catch (error) {
      console.error("❌ OpenRouter generation error:", error.response?.data || error.message);
      throw error;
    }
  }
  
  // Gemini method (backup)
  async generateWithGemini(query, userSkinType) {
    try {
      console.log("🤖 Calling Gemini API...");
      
      const prompt = `You are a professional skincare consultant. Based on the user's information, provide personalized skincare recommendations.

User Information:
${query.description ? `- Description: ${query.description}` : ''}
${query.concerns?.length ? `- Concerns: ${query.concerns.join(', ')}` : ''}
${query.budget ? `- Budget: $${query.budget} per product` : ''}
${query.age ? `- Age: ${query.age}` : ''}
${userSkinType ? `- Skin Type: ${userSkinType}` : ''}
${query.goal ? `- Goal: ${query.goal}` : ''}
${query.additionalInfo ? `- Additional Info: ${query.additionalInfo}` : ''}

Provide a comprehensive skincare routine and product recommendations. Return ONLY a valid JSON object with no other text:

{
  "skinType": "Oily/Dry/Combination/Normal/Sensitive",
  "concerns": ["Concern1", "Concern2"],
  "recommendations": [
    {
      "name": "Product name",
      "brand": "Brand name",
      "category": "Cleanser/Moisturizer/Serum/Sunscreen",
      "price": 25,
      "description": "Brief product description",
      "whyRecommended": "Why this product is suitable",
      "keyIngredients": ["Ingredient1", "Ingredient2"],
      "suitabilityScore": 8,
      "whereToBuy": "Sephora/Ulta/Drugstore"
    }
  ],
  "routine": {
    "morning": [
      {"name": "Product name", "step": "Cleanse", "description": "How to use"}
    ],
    "night": [
      {"name": "Product name", "step": "Cleanse", "description": "How to use"}
    ]
  },
  "tips": ["Tip 1", "Tip 2"],
  "summary": "Summary of the routine"
}`;

      const result = await this.geminiModel.generateContent(prompt);
      let text = result.response.text();
      
      text = text.trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }
      
      return JSON.parse(text);
    } catch (error) {
      console.error("❌ Gemini generation error:", error.message);
      throw error;
    }
  }
  
  // OpenAI method (backup)
  async generateWithOpenAI(query, userSkinType) {
    try {
      console.log("🤖 Calling OpenAI API...");
      
      const prompt = `You are a professional skincare consultant. Based on the user's information, provide personalized skincare recommendations.

User Information:
${query.description ? `- Description: ${query.description}` : ''}
${query.concerns?.length ? `- Concerns: ${query.concerns.join(', ')}` : ''}
${query.budget ? `- Budget: $${query.budget} per product` : ''}
${query.age ? `- Age: ${query.age}` : ''}
${userSkinType ? `- Skin Type: ${userSkinType}` : ''}
${query.goal ? `- Goal: ${query.goal}` : ''}
${query.additionalInfo ? `- Additional Info: ${query.additionalInfo}` : ''}

Provide a comprehensive skincare routine and product recommendations. Return ONLY a JSON object.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });
      
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error("❌ OpenAI generation error:", error.message);
      throw error;
    }
  }
  
  // Enhanced database fallback (always works)
  async generateFallbackRecommendations(query, userSkinType) {
    try {
      const allProducts = await Product.find();
      
      let skinType = userSkinType || "Normal";
      
      // Extract concerns from description
      let concerns = query.concerns || [];
      if (query.description) {
        const desc = query.description.toLowerCase();
        const concernKeywords = {
          "Acne": ["acne", "pimple", "breakout", "zit"],
          "Pigmentation": ["pigment", "dark spot", "hyperpigmentation", "melasma"],
          "Oiliness": ["oily", "greasy", "shine"],
          "Dryness": ["dry", "flaky", "dehydrated"],
          "Pores": ["pore", "large pore"],
          "Aging": ["wrinkle", "fine line", "aging"],
          "Sensitivity": ["sensitive", "irritat", "redness"]
        };
        
        for (const [concern, keywords] of Object.entries(concernKeywords)) {
          if (keywords.some(keyword => desc.includes(keyword))) {
            concerns.push(concern);
          }
        }
      }
      
      concerns = [...new Set(concerns)];
      if (concerns.length === 0) {
        concerns = ["General skincare"];
      }
      
      console.log(`🎯 Identified concerns: ${concerns.join(", ")}`);
      
      // Score products
      const scoredProducts = allProducts.map(product => {
        let score = 0;
        
        if (product.suitableFor && product.suitableFor.toLowerCase().includes(skinType.toLowerCase())) {
          score += 5;
        } else if (product.suitableFor === "All") {
          score += 3;
        }
        
        if (product.concerns && product.concerns.length > 0) {
          concerns.forEach(concern => {
            if (product.concerns.some(c => c.toLowerCase().includes(concern.toLowerCase()))) {
              score += 4;
            }
          });
        }
        
        if (query.budget && product.price <= query.budget) {
          score += 2;
        }
        
        score += (product.rating || 3);
        
        return { ...product._doc, score };
      });
      
      scoredProducts.sort((a, b) => b.score - a.score);
      const topProducts = scoredProducts.slice(0, 6);
      
      // Format recommendations
      const recommendations = topProducts.map(product => ({
        name: product.productName,
        brand: product.brand,
        category: product.productType,
        price: product.price,
        description: product.description || `${product.productName} is a great ${product.productType} for ${product.suitableFor} skin.`,
        whyRecommended: `Perfect for ${skinType} skin${concerns.length > 0 ? `, helps with ${concerns.join(", ")}` : ""}. ${product.description || ''}`,
        keyIngredients: product.keyIngredients || product.ingredients || [],
        suitabilityScore: Math.min(10, Math.round((product.score / 15) * 10)),
        whereToBuy: product.whereToBuy || "Available online and in stores",
        imageUrl: product.imageUrl || "https://via.placeholder.com/200",
        inDatabase: true
      }));
      
      // Build routine
      const morningRoutine = [];
      const nightRoutine = [];
      
      const cleanser = topProducts.find(p => p.productType?.toLowerCase().includes("cleanser"));
      if (cleanser) {
        morningRoutine.push({
          name: cleanser.productName,
          step: "Cleanse",
          description: "Gently cleanse face with lukewarm water"
        });
        nightRoutine.push({
          name: cleanser.productName,
          step: "Double Cleanse",
          description: "Remove makeup and impurities"
        });
      }
      
      const serum = topProducts.find(p => p.productType?.toLowerCase().includes("serum"));
      if (serum) {
        nightRoutine.push({
          name: serum.productName,
          step: "Treat",
          description: "Apply serum after cleansing"
        });
      }
      
      const moisturizer = topProducts.find(p => p.productType?.toLowerCase().includes("moisturizer"));
      if (moisturizer) {
        morningRoutine.push({
          name: moisturizer.productName,
          step: "Moisturize",
          description: "Apply to damp skin"
        });
        nightRoutine.push({
          name: moisturizer.productName,
          step: "Moisturize",
          description: "Lock in hydration"
        });
      }
      
      const sunscreen = topProducts.find(p => p.productType?.toLowerCase().includes("sunscreen"));
      if (sunscreen) {
        morningRoutine.push({
          name: sunscreen.productName,
          step: "Protect",
          description: "Apply as final step"
        });
      }
      
      const tips = [
        "Always patch test new products before incorporating them into your routine",
        "Apply products from thinnest to thickest consistency",
        "Don't forget to wear sunscreen every day, even indoors",
        "Be consistent with your routine for at least 4-6 weeks to see results",
        "Listen to your skin - adjust routine based on how your skin reacts",
        "Drink plenty of water and maintain a healthy diet for better skin health",
        "Get adequate sleep as skin repairs itself during rest",
        "Don't over-exfoliate - 2-3 times per week is sufficient for most skin types"
      ];
      
      const summary = `Based on your ${skinType} skin type${concerns.length > 0 ? ` and concerns about ${concerns.join(", ")}` : ""}, we've curated a personalized routine using high-quality products. ${recommendations.length > 0 ? `We recommend starting with the ${recommendations[0].name} and building your routine gradually.` : "Start with the basics and introduce new products gradually."} Remember to be patient and consistent for best results.`;
      
      return {
        skinType: skinType,
        concerns: concerns,
        recommendations: recommendations,
        routine: {
          morning: morningRoutine.length > 0 ? morningRoutine : [{ name: "Basic Routine", step: "Cleanse, Moisturize, Protect", description: "Start with a gentle cleanser, followed by moisturizer, and always finish with sunscreen" }],
          night: nightRoutine.length > 0 ? nightRoutine : [{ name: "Basic Routine", step: "Cleanse, Treat, Moisturize", description: "Remove makeup, cleanse, apply treatments, and moisturize before sleep" }]
        },
        tips: tips,
        summary: summary
      };
    } catch (error) {
      console.error("Fallback recommendation error:", error);
      throw error;
    }
  }
  
  async enrichWithDatabaseProducts(aiRecommendations) {
    try {
      const enrichedRecommendations = [];
      
      for (const rec of aiRecommendations.recommendations) {
        const dbProduct = await Product.findOne({
          $or: [
            { productName: { $regex: rec.name, $options: 'i' } },
            { brand: { $regex: rec.brand, $options: 'i' } }
          ]
        });
        
        if (dbProduct) {
          enrichedRecommendations.push({
            ...rec,
            name: dbProduct.productName,
            brand: dbProduct.brand,
            price: dbProduct.price,
            description: dbProduct.description || rec.description,
            keyIngredients: dbProduct.keyIngredients || dbProduct.ingredients,
            whereToBuy: dbProduct.whereToBuy || rec.whereToBuy,
            imageUrl: dbProduct.imageUrl || rec.imageUrl,
            inDatabase: true
          });
        } else {
          enrichedRecommendations.push({
            ...rec,
            inDatabase: false
          });
        }
      }
      
      return {
        ...aiRecommendations,
        recommendations: enrichedRecommendations
      };
    } catch (error) {
      console.error("Error enriching with database products:", error);
      return aiRecommendations;
    }
  }
  
  async getPopularRecommendations() {
    try {
      const popular = await Recommendation.find()
        .sort({ usageCount: -1 })
        .limit(10)
        .select('query aiResponse usageCount createdAt');
      
      return popular;
    } catch (error) {
      console.error("Error getting popular recommendations:", error);
      throw error;
    }
  }
  
  async getRecommendationStats() {
    try {
      const total = await Recommendation.countDocuments();
      const avgUsage = await Recommendation.aggregate([
        { $group: { _id: null, avgUsage: { $avg: "$usageCount" } } }
      ]);
      
      return {
        totalRecommendations: total,
        averageUsageCount: avgUsage[0]?.avgUsage || 0
      };
    } catch (error) {
      console.error("Error getting stats:", error);
      throw error;
    }
  }
}

module.exports = new RecommendationService();