const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");

const Ingredient = require("./models/Ingredient");

mongoose.connect("mongodb://127.0.0.1:27017/auracare")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB connection error:", err));

// Function to standardize risk level
function standardizeRiskLevel(riskLevel) {
  if (!riskLevel) return 'Unknown';
  
  const lowerRisk = riskLevel.toLowerCase();
  
  if (lowerRisk === 'low') return 'Low';
  if (lowerRisk === 'moderate' || lowerRisk === 'medium') return 'Medium';
  if (lowerRisk === 'high') return 'High';
  
  return 'Unknown';
}

// Function to calculate eco score based on ingredient
function calculateEcoData(ingredientName, hazardScore) {
  const name = ingredientName.toLowerCase();
  
  // Define eco-friendly ingredients
  const ecoFriendly = [
    'water', 'glycerin', 'hyaluronic acid', 'aloe vera', 'chamomile', 
    'green tea', 'centella asiatica', 'panthenol', 'allantoin', 'squalane',
    'jojoba oil', 'argan oil', 'rosehip oil', 'niacinamide', 'ceramides',
    'sodium hyaluronate', 'xanthan gum', 'guar gum', 'betaine', 'sodium pca'
  ];
  
  const moderateEco = [
    'vitamin c', 'vitamin e', 'titanium dioxide', 'zinc oxide', 'caffeine',
    'coenzyme q10', 'butylene glycol', 'pentylene glycol', 'caprylyl glycol',
    'dimethicone', 'lactic acid', 'glycolic acid'
  ];
  
  const poorEco = [
    'salicylic acid', 'retinol', 'benzoyl peroxide', 'tea tree oil',
    'witch hazel', 'menthol', 'eucalyptus oil', 'phenoxyethanol',
    'propylene glycol', 'polysorbate', 'carbomer', 'sodium chloride'
  ];
  
  const veryPoorEco = [
    'cyclopentasiloxane', 'cyclohexasiloxane', 'parabens', 'phthalates'
  ];
  
  if (ecoFriendly.some(e => name.includes(e))) {
    return {
      ecoScore: 85,
      ecoRating: 'Excellent',
      biodegradability: 'High',
      renewableSource: 'Yes',
      waterPollution: 'Low Risk',
      aquaticToxicity: 'Low',
      carbonFootprint: 'Low',
      sustainabilityNotes: 'Natural, biodegradable ingredient with minimal environmental impact.'
    };
  } else if (moderateEco.some(e => name.includes(e))) {
    return {
      ecoScore: 65,
      ecoRating: 'Good',
      biodegradability: 'Medium',
      renewableSource: 'Partially',
      waterPollution: 'Medium Risk',
      aquaticToxicity: 'Medium',
      carbonFootprint: 'Medium',
      sustainabilityNotes: 'Moderate environmental impact. Look for sustainably sourced options.'
    };
  } else if (poorEco.some(e => name.includes(e))) {
    return {
      ecoScore: 35,
      ecoRating: 'Poor',
      biodegradability: 'Low',
      renewableSource: 'No',
      waterPollution: 'High Risk',
      aquaticToxicity: 'High',
      carbonFootprint: 'High',
      sustainabilityNotes: 'High environmental impact. Consider eco-friendly alternatives.'
    };
  } else if (veryPoorEco.some(e => name.includes(e))) {
    return {
      ecoScore: 15,
      ecoRating: 'Very Poor',
      biodegradability: 'Very Low',
      renewableSource: 'No',
      waterPollution: 'Very High Risk',
      aquaticToxicity: 'Very High',
      carbonFootprint: 'Very High',
      sustainabilityNotes: 'Highly harmful to environment. Avoid when possible.'
    };
  }
  
  // Default based on hazard score
  let ecoScore = 50;
  let ecoRating = 'Fair';
  if (hazardScore <= 1) {
    ecoScore = 75;
    ecoRating = 'Good';
  } else if (hazardScore <= 3) {
    ecoScore = 55;
    ecoRating = 'Fair';
  } else if (hazardScore <= 5) {
    ecoScore = 35;
    ecoRating = 'Poor';
  } else {
    ecoScore = 20;
    ecoRating = 'Very Poor';
  }
  
  return {
    ecoScore,
    ecoRating,
    biodegradability: 'Medium',
    renewableSource: 'Unknown',
    waterPollution: 'Medium Risk',
    aquaticToxicity: 'Medium',
    carbonFootprint: 'Medium',
    sustainabilityNotes: 'More research needed on environmental impact.'
  };
}

const BATCH_SIZE = 500;
let batch = [];
let totalProcessed = 0;

const stream = fs.createReadStream("cosmetics-dataset.csv")
  .pipe(csv());

stream.on("data", async (data) => {
  stream.pause();
  
  const riskLevel = standardizeRiskLevel(data["riskLevel"]);
  const hazardScore = Number(data["hazardScore"]) || 0;
  const ecoData = calculateEcoData(data["ingredient"], hazardScore);
  
  batch.push({
    ingredient: data["ingredient"]?.trim(),
    hazardScore: hazardScore,
    riskLevel: riskLevel,
    suitableFor: data["suitableFor"]?.trim() || "",
    notSuitableFor: data["notSuitableFor"]?.trim() || "",
    description: data["description"]?.trim() || "",
    // Eco fields
    ecoScore: ecoData.ecoScore,
    ecoRating: ecoData.ecoRating,
    biodegradability: ecoData.biodegradability,
    renewableSource: ecoData.renewableSource,
    waterPollution: ecoData.waterPollution,
    aquaticToxicity: ecoData.aquaticToxicity,
    carbonFootprint: ecoData.carbonFootprint,
    sustainabilityNotes: ecoData.sustainabilityNotes
  });
  
  if (batch.length >= BATCH_SIZE) {
    try {
      await Ingredient.insertMany(batch, { ordered: false });
      totalProcessed += batch.length;
      console.log(`✅ Inserted ${totalProcessed} ingredients...`);
      batch = [];
    } catch (err) {
      console.error("❌ Error inserting batch:", err.message);
    }
  }
  
  stream.resume();
});

stream.on("end", async () => {
  if (batch.length > 0) {
    try {
      await Ingredient.insertMany(batch, { ordered: false });
      totalProcessed += batch.length;
      console.log(`✅ Inserted final ${batch.length} ingredients`);
    } catch (err) {
      console.error("❌ Error inserting final batch:", err.message);
    }
  }
  
  console.log(`\n🎉 Import completed! Total ingredients imported: ${totalProcessed}`);
  
  // Show sample of imported data
  const sample = await Ingredient.find().limit(5);
  console.log("\n📋 Sample imported ingredients:");
  sample.forEach(ing => {
    console.log(`   - ${ing.ingredient}: Risk: ${ing.riskLevel}, Eco: ${ing.ecoRating} (${ing.ecoScore}/100)`);
  });
  
  mongoose.connection.close();
  console.log("🔌 MongoDB connection closed");
});

stream.on("error", (err) => {
  console.error("❌ Error reading CSV:", err);
  mongoose.connection.close();
});