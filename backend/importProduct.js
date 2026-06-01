const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");

const Product = require("./models/Product");

mongoose.connect("mongodb://127.0.0.1:27017/auracare")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB connection error:", err));

const products = [];
let rowCount = 0;

fs.createReadStream("routine-planner.csv")
  .pipe(csv())
  .on("data", (data) => {
    rowCount++;
    
    // Parse ingredients - handle both space-separated and comma-separated
    let ingredientsList = [];
    if (data["ingredients"]) {
      // Check if ingredients contain commas
      if (data["ingredients"].includes(',')) {
        ingredientsList = data["ingredients"].split(',').map(i => i.trim());
      } else {
        ingredientsList = data["ingredients"].split(' ').map(i => i.trim());
      }
      // Filter out empty strings and clean
      ingredientsList = ingredientsList.filter(i => i && i !== "" && i !== " ");
    }
    
    // Parse suitableFor - handle multiple skin types (space-separated or comma-separated)
    let suitableFor = data["suitableFor"]?.trim() || "All";
    
    // Determine concerns and goals based on product type and ingredients
    let concerns = [];
    let goal = [];
    const type = data["productType"]?.toLowerCase() || "";
    const productName = data["productName"]?.toLowerCase() || "";
    const ingredients = data["ingredients"]?.toLowerCase() || "";
    
    // Set default concerns based on product type
    if (type.includes("cleanser")) {
      concerns = ["Blackheads", "Oiliness"];
      goal = ["Pore Minimizing", "Cleansing"];
      if (ingredients.includes("salicylic") || ingredients.includes("bha")) {
        concerns.push("Acne");
        goal.push("Acne Control");
      }
      if (ingredients.includes("hyaluronic") || ingredients.includes("glycerin")) {
        concerns.push("Dryness");
        goal.push("Hydration");
      }
    }
    else if (type.includes("serum")) {
      concerns = ["Pigmentation", "Aging"];
      goal = ["Brightening", "Anti-aging"];
      if (ingredients.includes("vitamin c") || productName.includes("vitamin c")) {
        goal.push("Brightening");
        concerns.push("Dullness");
      }
      if (ingredients.includes("retinol") || productName.includes("retinol")) {
        goal.push("Anti-aging");
        concerns.push("Wrinkles");
      }
      if (ingredients.includes("niacinamide")) {
        goal.push("Pore Minimizing");
        concerns.push("Oiliness");
      }
      if (ingredients.includes("hyaluronic")) {
        goal.push("Hydration");
        concerns.push("Dryness");
      }
    }
    else if (type.includes("moisturizer")) {
      concerns = ["Dryness", "Dehydration"];
      goal = ["Hydration", "Moisturizing"];
      if (ingredients.includes("ceramide")) {
        goal.push("Barrier Repair");
      }
      if (ingredients.includes("shea butter") || ingredients.includes("squalane")) {
        goal.push("Nourishing");
      }
    }
    else if (type.includes("sunscreen")) {
      concerns = ["Pigmentation", "Aging"];
      goal = ["Protection", "Sun Care"];
      if (ingredients.includes("zinc") || ingredients.includes("titanium")) {
        goal.push("Mineral Protection");
      }
    }
    else if (type.includes("treatment") || type.includes("mask")) {
      concerns = ["Dullness", "Texture"];
      goal = ["Exfoliation", "Brightening"];
    }
    
    // Remove duplicates
    concerns = [...new Set(concerns)];
    goal = [...new Set(goal)];
    
    // Create product object
    const product = {
      routineTime: data["routineTime"]?.trim() || "both",
      productType: data["productType"]?.trim(),
      productName: data["productName"]?.trim(),
      brand: data["brand"]?.trim(),
      ingredients: ingredientsList,
      suitableFor: suitableFor,
      concerns: concerns,
      goal: goal,
      price: parseFloat((Math.random() * 80 + 5).toFixed(2)), // $5-$85
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0-5.0
      description: generateDescription(data),
      whereToBuy: getWhereToBuy(data["brand"]),
      keyIngredients: ingredientsList.slice(0, 3)
    };
    
    products.push(product);
    
    // Progress indicator
    if (rowCount % 100 === 0) {
      console.log(`📊 Processed ${rowCount} rows...`);
    }
  })
  .on("end", async () => {
    try {
      console.log(`\n📊 Total rows processed: ${rowCount}`);
      console.log(`📦 Valid products: ${products.length}`);
      
      if (products.length === 0) {
        console.log("❌ No valid products found in CSV. Please check your CSV format.");
        mongoose.connection.close();
        return;
      }
      
      // Clear existing products
      await Product.deleteMany();
      console.log("🗑️ Cleared existing products");
      
      // Insert in batches for better performance
      const batchSize = 500;
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        await Product.insertMany(batch);
        console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} products`);
      }
      
      console.log(`\n✅ Successfully imported ${products.length} products!`);
      
      // Show statistics
      const morningCount = products.filter(p => p.routineTime === "morning").length;
      const nightCount = products.filter(p => p.routineTime === "night").length;
      const bothCount = products.filter(p => p.routineTime === "both").length;
      
      console.log("\n📋 Import Statistics:");
      console.log(`   Morning products: ${morningCount}`);
      console.log(`   Night products: ${nightCount}`);
      console.log(`   Both (flexible): ${bothCount}`);
      
      // Show product type breakdown
      const typeStats = {};
      products.forEach(p => {
        typeStats[p.productType] = (typeStats[p.productType] || 0) + 1;
      });
      console.log("\n📊 Product Type Breakdown:");
      Object.entries(typeStats).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
      
      // Show sample products
      console.log("\n✨ Sample Products:");
      products.slice(0, 10).forEach(p => {
        console.log(`   - ${p.productName} (${p.productType}) - ${p.routineTime} - Suitable: ${p.suitableFor}`);
      });
      
    } catch (err) {
      console.log("❌ Error importing products:", err);
    }
    
    mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  })
  .on("error", (err) => {
    console.error("❌ Error reading CSV:", err);
    mongoose.connection.close();
  });

// Helper function to generate product description
function generateDescription(data) {
  const name = data["productName"] || "";
  const brand = data["brand"] || "";
  const type = data["productType"] || "";
  const suitable = data["suitableFor"] || "all";
  const ingredients = data["ingredients"] || "";
  
  let description = `${name} by ${brand} is a ${type.toLowerCase()} `;
  description += `formulated for ${suitable} skin. `;
  
  if (ingredients) {
    const ingList = ingredients.split(/[ ,]+/).slice(0, 3);
    if (ingList.length > 0) {
      description += `Key ingredients include ${ingList.join(", ")}. `;
    }
  }
  
  if (type.toLowerCase().includes("cleanser")) {
    description += "Gently removes impurities without stripping natural oils. ";
  } else if (type.toLowerCase().includes("serum")) {
    description += "Delivers concentrated active ingredients for targeted results. ";
  } else if (type.toLowerCase().includes("moisturizer")) {
    description += "Provides essential hydration and helps strengthen skin barrier. ";
  } else if (type.toLowerCase().includes("sunscreen")) {
    description += "Protects skin from harmful UV rays and prevents premature aging. ";
  }
  
  return description;
}

// Helper function to get where to buy based on brand
function getWhereToBuy(brand) {
  const brandStores = {
    "CeraVe": "Drugstores, Amazon, Target, Walmart",
    "La Roche-Posay": "Ulta, CVS, Target, Dermstore",
    "Cetaphil": "Drugstores, Amazon, Walmart",
    "Neutrogena": "Drugstores, Target, Walmart, Amazon",
    "Bioderma": "Dermstore, Amazon, CVS",
    "Kiehl's": "Kiehl's stores, Sephora, Nordstrom",
    "COSRX": "Ulta, Amazon, YesStyle, Soko Glam",
    "Dermalogica": "Ulta, Dermstore, Sephora",
    "Laneige": "Sephora, Amazon, Target",
    "DHC": "DHC website, Amazon, Ulta",
    "Innisfree": "Innisfree stores, Sephora, Amazon",
    "Avène": "CVS, Walgreens, Dermstore",
    "Klairs": "Amazon, YesStyle, Wishtrend",
    "PCA Skin": "Dermstore, PCA Skin website",
    "Murad": "Ulta, Sephora, Dermstore",
    "First Aid Beauty": "Sephora, Ulta, Amazon",
    "Hada Labo": "Amazon, YesStyle, Asian markets",
    "The Body Shop": "The Body Shop stores, Ulta",
    "Tatcha": "Sephora, Tatcha website",
    "Paula's Choice": "Paula's Choice website, Nordstrom",
    "Vanicream": "Drugstores, Amazon, Target",
    "Shiseido": "Sephora, Ulta, Nordstrom",
    "Sulwhasoo": "Sulwhasoo stores, Nordstrom",
    "Aveda": "Aveda salons, Ulta, Nordstrom",
    "Philosophy": "Ulta, Sephora, Amazon",
    "Sunday Riley": "Sephora, Ulta",
    "Kate Somerville": "Sephora, Dermstore",
    "Eucerin": "Drugstores, Amazon, Target",
    "Vichy": "CVS, Walgreens, Dermstore",
    "Garnier": "Drugstores, Target, Walmart",
    "Belif": "Sephora, Amazon",
    "Glossier": "Glossier website, Sephora",
    "Elemis": "Ulta, Nordstrom, Dermstore",
    "Tosowoong": "Amazon, YesStyle",
    "Origins": "Origins stores, Sephora, Ulta",
    "Farmacy": "Sephora, Farmacy website",
    "Alaffia": "Target, Whole Foods, Amazon",
    "Fresh": "Sephora, Nordstrom",
    "EO Products": "Whole Foods, Amazon",
    "Dr. Hauschka": "Whole Foods, Dermstore",
    "Dr. Jart+": "Sephora, Ulta, Amazon",
    "A'pieu": "Amazon, YesStyle",
    "Su:m37": "Sulwhasoo stores, Amazon",
    "Skinceuticals": "Dermstore, Skinceuticals website",
    "Drunk Elephant": "Sephora, Ulta",
    "The Ordinary": "Sephora, Ulta, Deciem website",
    "The Inkey List": "Sephora, Ulta",
    "NIOD": "Deciem website",
    "Summer Fridays": "Sephora",
    "Herbivore": "Sephora, Ulta",
    "Biossance": "Sephora, Biossance website",
    "Medik8": "Dermstore, Medik8 website",
    "Vichy": "CVS, Walgreens, Dermstore",
    "Biopelle": "Dermstore",
    "Peter Thomas Roth": "Sephora, Ulta",
    "La Prairie": "Neiman Marcus, Saks Fifth Avenue",
    "Clarins": "Ulta, Sephora, Nordstrom",
    "Amarte": "Dermstore",
    "Estee Lauder": "Sephora, Ulta, Nordstrom",
    "Lancome": "Sephora, Ulta, Nordstrom",
    "Babor": "Dermstore, Babor website",
    "EltaMD": "Dermstore, Amazon, CVS",
    "Blue Lizard": "Target, Amazon, Walmart",
    "Supergoop": "Sephora, Ulta",
    "Cotz": "Ulta, Dermstore",
    "Missha": "Amazon, YesStyle",
    "It Cosmetics": "Ulta, Sephora",
    "Ponds": "Drugstores, Target, Walmart",
    "Simple": "Drugstores, Target",
    "Yes To": "Target, Walmart",
    "Burt's Bees": "Target, Walmart, Amazon",
    "Prescription": "Prescription only - consult dermatologist"
  };
  
  return brandStores[brand] || "Available at major retailers and online";
}