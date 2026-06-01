class EcoScoreService {
  constructor() {
    // Define eco-friendly ingredient database
    this.ecoDatabase = {
      // Excellent eco-friendly ingredients (score 80-100)
      excellent: {
        'aloe vera': { score: 92, rating: 'Excellent', bio: 'High', renewable: 'Yes', water: 'Low Risk', aquatic: 'Low', carbon: 'Low', note: 'Naturally derived, highly biodegradable, sustainable sourcing available' },
        'shea butter': { score: 88, rating: 'Excellent', bio: 'High', renewable: 'Yes', water: 'Low Risk', aquatic: 'Low', carbon: 'Medium', note: 'Fair trade options available, supports local communities' },
        'coconut oil': { score: 85, rating: 'Excellent', bio: 'High', renewable: 'Yes', water: 'Low Risk', aquatic: 'Low', carbon: 'Medium', note: 'Sustainably harvested coconut oil is eco-friendly' },
        'jojoba oil': { score: 87, rating: 'Excellent', bio: 'High', renewable: 'Yes', water: 'Low Risk', aquatic: 'Low', carbon: 'Low', note: 'Desert plant requires minimal water' },
        'argan oil': { score: 86, rating: 'Excellent', bio: 'High', renewable: 'Yes', water: 'Low Risk', aquatic: 'Low', carbon: 'Medium', note: 'Supports women\'s cooperatives in Morocco' },
        'green tea': { score: 90, rating: 'Excellent', bio: 'High', renewable: 'Yes', water: 'Low Risk', aquatic: 'Low', carbon: 'Low', note: 'Organic farming practices available' },
        'chamomile': { score: 89, rating: 'Excellent', bio: 'High', renewable: 'Yes', water: 'Low Risk', aquatic: 'Low', carbon: 'Low', note: 'Naturally pest-resistant, minimal pesticides needed' },
        'hyaluronic acid': { score: 82, rating: 'Excellent', bio: 'High', renewable: 'Yes', water: 'Low Risk', aquatic: 'Low', carbon: 'Medium', note: 'Can be bio-fermented, vegan options available' },
        'squalane': { score: 84, rating: 'Excellent', bio: 'High', renewable: 'Yes', water: 'Low Risk', aquatic: 'Low', carbon: 'Medium', note: 'Plant-derived squalane (from olives) is sustainable' }
      },
      
      // Good eco-friendly ingredients (score 60-79)
      good: {
        'vitamin c': { score: 75, rating: 'Good', bio: 'Medium', renewable: 'Partially', water: 'Low Risk', aquatic: 'Low', carbon: 'Medium', note: 'Natural sources available, synthetic options less eco-friendly' },
        'vitamin e': { score: 72, rating: 'Good', bio: 'Medium', renewable: 'Partially', water: 'Low Risk', aquatic: 'Low', carbon: 'Medium', note: 'Often plant-derived, check source' },
        'niacinamide': { score: 70, rating: 'Good', bio: 'Medium', renewable: 'Partially', water: 'Medium Risk', aquatic: 'Low', carbon: 'Medium', note: 'Synthetic but low environmental impact' },
        'salicylic acid': { score: 65, rating: 'Good', bio: 'Medium', renewable: 'Partially', water: 'Medium Risk', aquatic: 'Medium', carbon: 'Medium', note: 'Natural sources available (willow bark)' },
        'glycolic acid': { score: 68, rating: 'Good', bio: 'Medium', renewable: 'Partially', water: 'Medium Risk', aquatic: 'Medium', carbon: 'Medium', note: 'Can be derived from sugar cane' },
        'lactic acid': { score: 71, rating: 'Good', bio: 'Medium', renewable: 'Yes', water: 'Low Risk', aquatic: 'Low', carbon: 'Medium', note: 'Fermented from corn or beets' },
        'kaolin clay': { score: 78, rating: 'Good', bio: 'High', renewable: 'No', water: 'Low Risk', aquatic: 'Low', carbon: 'Low', note: 'Natural mineral, mining impact' },
        'witch hazel': { score: 80, rating: 'Good', bio: 'High', renewable: 'Yes', water: 'Low Risk', aquatic: 'Low', carbon: 'Low', note: 'Sustainable harvesting practices' }
      },
      
      // Fair eco-friendly ingredients (score 40-59)
      fair: {
        'zinc oxide': { score: 55, rating: 'Fair', bio: 'Low', renewable: 'No', water: 'Medium Risk', aquatic: 'Medium', carbon: 'High', note: 'Non-nano particles are safer for aquatic life' },
        'titanium dioxide': { score: 50, rating: 'Fair', bio: 'Low', renewable: 'No', water: 'Medium Risk', aquatic: 'Medium', carbon: 'High', note: 'Mining impact, non-nano forms preferred' },
        'benzoyl peroxide': { score: 45, rating: 'Fair', bio: 'Medium', renewable: 'No', water: 'Medium Risk', aquatic: 'Medium', carbon: 'Medium', note: 'Can harm aquatic life if not properly treated' },
        'retinol': { score: 48, rating: 'Fair', bio: 'Medium', renewable: 'Partially', water: 'Medium Risk', aquatic: 'Medium', carbon: 'Medium', note: 'Synthetic, but effective at low concentrations' },
        'ceramides': { score: 52, rating: 'Fair', bio: 'Medium', renewable: 'Partially', water: 'Medium Risk', aquatic: 'Medium', carbon: 'Medium', note: 'Can be plant-derived or synthetic' }
      },
      
      // Poor eco-friendly ingredients (score 20-39)
      poor: {
        'parabens': { score: 25, rating: 'Poor', bio: 'Low', renewable: 'No', water: 'High Risk', aquatic: 'High', carbon: 'Medium', note: 'Persistent in environment, potential endocrine disruptor' },
        'phthalates': { score: 20, rating: 'Poor', bio: 'Low', renewable: 'No', water: 'High Risk', aquatic: 'High', carbon: 'Medium', note: 'Highly persistent, toxic to aquatic life' },
        'sodium lauryl sulfate': { score: 30, rating: 'Poor', bio: 'Low', renewable: 'Partially', water: 'High Risk', aquatic: 'High', carbon: 'Medium', note: 'Can be derived from coconut, but toxic to aquatic life' },
        'sodium laureth sulfate': { score: 28, rating: 'Poor', bio: 'Low', renewable: 'Partially', water: 'High Risk', aquatic: 'High', carbon: 'Medium', note: 'Contains ethylene oxide, environmental concerns' },
        'mineral oil': { score: 35, rating: 'Poor', bio: 'Very Low', renewable: 'No', water: 'High Risk', aquatic: 'High', carbon: 'High', note: 'Petroleum-derived, non-biodegradable' },
        'petrolatum': { score: 32, rating: 'Poor', bio: 'Very Low', renewable: 'No', water: 'High Risk', aquatic: 'High', carbon: 'High', note: 'Petroleum-based, not renewable' },
        'silicones': { score: 38, rating: 'Poor', bio: 'Very Low', renewable: 'No', water: 'High Risk', aquatic: 'Medium', carbon: 'High', note: 'Non-biodegradable, accumulate in environment' },
        'synthetic fragrances': { score: 25, rating: 'Poor', bio: 'Low', renewable: 'No', water: 'High Risk', aquatic: 'High', carbon: 'Medium', note: 'Often contain phthalates, persistent' }
      },
      
      // Very Poor eco-friendly ingredients (score 0-19)
      veryPoor: {
        'microbeads': { score: 5, rating: 'Very Poor', bio: 'Very Low', renewable: 'No', water: 'Very High Risk', aquatic: 'Very High', carbon: 'Medium', note: 'Plastic pollution, banned in many countries' },
        'oxybenzone': { score: 10, rating: 'Very Poor', bio: 'Low', renewable: 'No', water: 'Very High Risk', aquatic: 'Very High', carbon: 'Medium', note: 'Toxic to coral reefs, banned in Hawaii and Key West' },
        'octinoxate': { score: 12, rating: 'Very Poor', bio: 'Low', renewable: 'No', water: 'Very High Risk', aquatic: 'Very High', carbon: 'Medium', note: 'Coral reef toxin, bioaccumulative' },
        'pfas': { score: 0, rating: 'Very Poor', bio: 'None', renewable: 'No', water: 'Very High Risk', aquatic: 'Very High', carbon: 'High', note: '"Forever chemicals", highly persistent' }
      }
    };
  }

  calculateEcoScore(ingredientName) {
    const name = ingredientName.toLowerCase();
    
    // Check each category
    for (const [category, ingredients] of Object.entries(this.ecoDatabase)) {
      for (const [ingredient, data] of Object.entries(ingredients)) {
        if (name.includes(ingredient)) {
          return {
            ecoScore: data.score,
            ecoRating: data.rating,
            biodegradability: data.bio,
            renewableSource: data.renewable,
            waterPollution: data.water,
            aquaticToxicity: data.aquatic,
            carbonFootprint: data.carbon,
            sustainabilityNotes: data.note
          };
        }
      }
    }
    
    // Default for unknown ingredients
    return {
      ecoScore: 50,
      ecoRating: 'Fair',
      biodegradability: 'Unknown',
      renewableSource: 'Unknown',
      waterPollution: 'Unknown',
      aquaticToxicity: 'Unknown',
      carbonFootprint: 'Unknown',
      sustainabilityNotes: 'More research needed on environmental impact'
    };
  }

  calculateProductEcoScore(ingredients) {
    if (!ingredients || ingredients.length === 0) {
      return {
        overallScore: 0,
        averageScore: 0,
        ingredientsBreakdown: [],
        recommendations: ['No ingredients provided for analysis']
      };
    }
    
    const breakdown = [];
    let totalScore = 0;
    
    for (const ingredient of ingredients) {
      const ecoData = this.calculateEcoScore(ingredient);
      breakdown.push({
        name: ingredient,
        ecoScore: ecoData.ecoScore,
        ecoRating: ecoData.ecoRating,
        sustainabilityNotes: ecoData.sustainabilityNotes
      });
      totalScore += ecoData.ecoScore;
    }
    
    const averageScore = totalScore / ingredients.length;
    
    const recommendations = [];
    if (averageScore >= 80) {
      recommendations.push("🌿 Excellent! This product has minimal environmental impact.");
    } else if (averageScore >= 60) {
      recommendations.push("👍 Good eco-friendly choice. Look for certified organic options to improve further.");
    } else if (averageScore >= 40) {
      recommendations.push("⚠️ Fair environmental impact. Consider switching to more natural alternatives.");
    } else if (averageScore >= 20) {
      recommendations.push("❌ Poor environmental impact. Look for eco-friendly alternatives.");
    } else {
      recommendations.push("🚫 Very poor environmental impact. Strongly consider replacing this product.");
    }
    
    // Add specific ingredient recommendations
    const poorIngredients = breakdown.filter(i => i.ecoScore < 40);
    if (poorIngredients.length > 0) {
      recommendations.push(`Ingredients to avoid: ${poorIngredients.map(i => i.name).join(', ')}`);
    }
    
    return {
      overallScore: Math.round(averageScore),
      ingredientsBreakdown: breakdown,
      recommendations: recommendations,
      ecoRating: this.getRatingFromScore(averageScore)
    };
  }

  getRatingFromScore(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Poor';
    return 'Very Poor';
  }

  getEcoAlternatives(ingredient) {
    const alternatives = {
      'sodium lauryl sulfate': ['Coco-glucoside', 'Decyl glucoside', 'Soap nuts'],
      'sodium laureth sulfate': ['Coco-glucoside', 'Lauryl glucoside'],
      'parabens': ['Phenoxyethanol', 'Potassium sorbate', 'Vitamin E', 'Rosemary extract'],
      'phthalates': ['Essential oils', 'Natural fragrances', 'Plant extracts'],
      'mineral oil': ['Jojoba oil', 'Argan oil', 'Squalane', 'Coconut oil'],
      'silicones': ['Hyaluronic acid', 'Aloe vera', 'Plant oils', 'Shea butter'],
      'oxybenzone': ['Zinc oxide (non-nano)', 'Titanium dioxide', 'Red raspberry seed oil'],
      'octinoxate': ['Zinc oxide', 'Titanium dioxide', 'Avobenzone'],
      'petrolatum': ['Shea butter', 'Coconut oil', 'Beeswax', 'Plant-based butters']
    };
    
    const lowerIngredient = ingredient.toLowerCase();
    for (const [key, value] of Object.entries(alternatives)) {
      if (lowerIngredient.includes(key)) {
        return value;
      }
    }
    
    return ["Look for plant-based, naturally derived alternatives"];
  }

  getEcoTips() {
    return [
      "🌿 Choose products with biodegradable ingredients",
      "📦 Look for packaging made from recycled materials",
      "🚫 Avoid products with microbeads - they pollute oceans",
      "🏆 Support brands with eco-certifications (Ecocert, USDA Organic)",
      "💧 Choose waterless products to reduce water footprint",
      "🌴 Look for palm oil-free or sustainably sourced palm oil",
      "🐠 Avoid oxybenzone and octinoxate - they harm coral reefs",
      "🔄 Choose refillable packaging to reduce waste",
      "⚡ Support brands that use renewable energy",
      "🌍 Choose locally-made products to reduce carbon footprint"
    ];
  }
}

module.exports = new EcoScoreService();