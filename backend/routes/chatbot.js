const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const Product = require('../models/Product');

// No authentication middleware - anyone can chat

// Check if query is skincare-related
function isSkincareRelated(query) {
  const skincareKeywords = [
    'skin', 'face', 'acne', 'pimple', 'breakout', 'oil', 'dry', 'sensitive',
    'moisturizer', 'cleanser', 'serum', 'sunscreen', 'retinol', 'vitamin c',
    'niacinamide', 'salicylic', 'glycolic', 'hyaluronic', 'ceramide', 'peptide',
    'wrinkle', 'aging', 'pigment', 'dark spot', 'redness', 'blackhead', 'pore',
    'exfoliate', 'toner', 'mask', 'cream', 'lotion', 'gel', 'foam', 'scrub',
    'routine', 'regimen', 'product', 'ingredient', 'chemical', 'natural',
    'organic', 'vegan', 'cruelty', 'sulfate', 'paraben', 'fragrance'
  ];
  
  const lowerQuery = query.toLowerCase();
  return skincareKeywords.some(keyword => lowerQuery.includes(keyword));
}

// Main chatbot endpoint - NO TOKEN REQUIRED
router.post('/skincare-query', async (req, res) => {
  try {
    const { message, isLoggedIn = false } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a question"
      });
    }
    
    // Check if query is skincare-related
    if (!isSkincareRelated(message)) {
      return res.json({
        success: true,
        response: "🌸 I'm your skincare assistant! I can only help with skincare-related questions. Please ask me about:\n\n• Skincare products\n• Skin concerns (acne, dryness, etc.)\n• Ingredients and their benefits\n• Skincare routines\n• Product recommendations\n\nWhat skincare question do you have? 💕"
      });
    }
    
    // Get products from database for context
    const products = await Product.find().limit(15);
    const productContext = products.map(p => 
      `${p.productName} (${p.brand}) - ${p.productType} - Suitable for: ${p.suitableFor || 'All'} - Price: $${p.price}`
    ).join('\n');
    
    // Prepare prompt for AI
    let prompt = `You are a friendly, helpful skincare consultant assistant. Be conversational and informative.

User's Question: ${message}

Available Products in Database:
${productContext}

Provide a helpful, friendly response. If recommending products, suggest from the available products above if they match. 
Keep responses conversational but informative (2-3 paragraphs max).
Include specific product names and prices if they match the user's needs.
If the user is asking about something not in the database, give general skincare advice.
Be encouraging and positive in your tone.`;

    // Add personalized note if user is logged in
    if (isLoggedIn) {
      prompt += `\n\nThe user is logged in, so you can assume they have a profile and can save recommendations.`;
    }

    // Call OpenRouter AI
    const aiResponse = await axios.post(
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
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "Auracare Skincare App"
        }
      }
    );
    
    let botResponse = aiResponse.data.choices[0].message.content;
    
    // Clean up response
    botResponse = botResponse.replace(/^Response:\s*/i, '');
    
    // Check if the response mentions any products
    const mentionedProducts = [];
    for (const product of products) {
      if (botResponse.toLowerCase().includes(product.productName.toLowerCase())) {
        mentionedProducts.push({
          name: product.productName,
          brand: product.brand,
          price: product.price,
          description: product.description
        });
      }
    }
    
    res.json({
      success: true,
      response: botResponse,
      products: mentionedProducts.slice(0, 3),
      suggestedLogin: !isLoggedIn && mentionedProducts.length > 0
    });
    
  } catch (error) {
    console.error("Chatbot error:", error.response?.data || error.message);
    
    // Fallback response
    res.json({
      success: true,
      response: "I'm here to help with your skincare questions! Could you please rephrase your question? I can help with product recommendations, ingredient information, skincare routines, and addressing specific skin concerns like acne, dryness, or sensitivity. 💕"
    });
  }
});

// Get quick skincare tips endpoint - NO TOKEN REQUIRED
router.get('/quick-tips', async (req, res) => {
  try {
    const tips = [
      "Always patch test new products before applying to your face",
      "Apply products from thinnest to thickest consistency",
      "Don't forget sunscreen - even on cloudy days!",
      "Drink plenty of water for hydrated skin",
      "Get 7-8 hours of sleep for skin repair",
      "Clean your makeup brushes weekly",
      "Never pop pimples - it can cause scarring",
      "Use lukewarm water, not hot, to wash your face",
      "Moisturize while skin is still damp for better absorption",
      "Exfoliate 2-3 times a week, not daily"
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    res.json({
      success: true,
      tip: randomTip
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get tip" });
  }
});

module.exports = router;