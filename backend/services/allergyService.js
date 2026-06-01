class AllergyService {
  constructor() {
    // Map of allergens and their common ingredient names
    this.allergenMap = {
      'Fragrance': ['fragrance', 'parfum', 'perfume', 'essential oil blend', 'aroma'],
      'Parabens': ['methylparaben', 'ethylparaben', 'propylparaben', 'butylparaben', 'isobutylparaben', 'paraben'],
      'Sulfates': ['sodium lauryl sulfate', 'sodium laureth sulfate', 'sls', 'sles', 'ammonium lauryl sulfate'],
      'Phthalates': ['phthalate', 'dbp', 'dep', 'dmp', 'bbp', 'dehp'],
      'Nuts': ['almond oil', 'walnut oil', 'macadamia oil', 'peanut oil', 'hazelnut oil', 'shea butter'],
      'Lanolin': ['lanolin', 'lanolin alcohol', 'wool wax', 'wool fat'],
      'Formaldehyde': ['formaldehyde', 'dmdm hydantoin', 'quaternium-15', 'diazolidinyl urea', 'imidazolidinyl urea'],
      'Essential Oils': ['essential oil', 'eucalyptus oil', 'peppermint oil', 'lavender oil', 'tea tree oil'],
      'Alcohol': ['alcohol denat', 'ethanol', 'isopropyl alcohol', 'benzyl alcohol', 'sd alcohol'],
      'Aloe Vera': ['aloe barbadensis', 'aloe vera', 'aloe leaf juice'],
      'Coconut': ['cocos nucifera', 'coconut oil', 'cocamide', 'coconut derived'],
      'Gluten': ['hydrolyzed wheat protein', 'wheat germ oil', 'barley extract', 'triticum vulgare'],
      'Soy': ['glycine soja', 'soybean oil', 'hydrolyzed soy protein', 'lecithin'],
      'Dairy': ['milk protein', 'lactic acid (from milk)', 'casein', 'whey', 'yogurt extract'],
      'Latex': 'natural rubber',
      'Nickel': 'nickel'
    };
  }

  detectAllergies(ingredients, userAllergies) {
    if (!userAllergies || userAllergies.length === 0) {
      return {
        hasAllergens: false,
        warnings: [],
        safeAlternatives: [],
        message: "No allergies set. Add allergies in your profile for personalized warnings."
      };
    }
    
    const warnings = [];
    const safeAlternatives = [];
    
    for (const ingredient of ingredients) {
      const lowerIngredient = ingredient.toLowerCase();
      
      for (const allergy of userAllergies) {
        const allergenKeywords = this.allergenMap[allergy] || [allergy.toLowerCase()];
        
        for (const keyword of allergenKeywords) {
          if (lowerIngredient.includes(keyword)) {
            const severity = this.getSeverity(allergy, ingredient);
            
            warnings.push({
              ingredient: ingredient,
              allergen: allergy,
              severity: severity,
              message: `⚠️ Contains ${allergy} which you are allergic to!`,
              recommendation: this.getRecommendation(allergy)
            });
            
            // Get safe alternative if not already added
            const alternative = this.getSafeAlternative(allergy);
            if (!safeAlternatives.includes(alternative)) {
              safeAlternatives.push(alternative);
            }
            break;
          }
        }
      }
    }
    
    return {
      hasAllergens: warnings.length > 0,
      warnings: warnings,
      safeAlternatives: [...new Set(safeAlternatives)], // Remove duplicates
      message: warnings.length > 0 
        ? `Found ${warnings.length} ingredient(s) you're allergic to!`
        : "No allergens detected in this product."
    };
  }
  
  getSeverity(allergy, ingredient) {
    const highSeverity = ['Nuts', 'Latex', 'Formaldehyde', 'Nickel'];
    const mediumSeverity = ['Fragrance', 'Parabens', 'Phthalates', 'Sulfates'];
    
    if (highSeverity.includes(allergy)) return 'High';
    if (mediumSeverity.includes(allergy)) return 'Medium';
    return 'Low';
  }
  
  getRecommendation(allergy) {
    const recommendations = {
      'Fragrance': 'Look for "fragrance-free" or "unscented" products',
      'Parabens': 'Choose paraben-free products with natural preservatives',
      'Sulfates': 'Look for sulfate-free cleansers with gentle surfactants',
      'Phthalates': 'Choose phthalate-free fragrances or unscented products',
      'Nuts': 'Check labels carefully for nut oils and butters',
      'Lanolin': 'Look for lanolin-free moisturizers with plant-based alternatives',
      'Formaldehyde': 'Avoid products with preservatives that release formaldehyde',
      'Essential Oils': 'Start with single-ingredient products to test tolerance',
      'Alcohol': 'Look for alcohol-free toners and moisturizers',
      'Aloe Vera': 'Check ingredient lists for aloe derivatives',
      'Coconut': 'Look for coconut-free alternatives like jojoba or argan oil',
      'Gluten': 'Look for certified gluten-free skincare',
      'Soy': 'Check for soy-derived ingredients in moisturizers',
      'Dairy': 'Choose vegan, dairy-free formulations'
    };
    
    return recommendations[allergy] || `Avoid products containing ${allergy}`;
  }
  
  getSafeAlternative(allergy) {
    const alternatives = {
      'Fragrance': 'Fragrance-free products or naturally scented with single essential oils',
      'Parabens': 'Phenoxyethanol, Potassium sorbate, Vitamin E, Rosemary extract',
      'Sulfates': 'Coco-glucoside, Decyl glucoside, Lauryl glucoside',
      'Phthalates': 'Fragrance-free products, essential oils',
      'Nuts': 'Jojoba oil, Argan oil, Squalane, Rosehip oil',
      'Lanolin': 'Shea butter, Cocoa butter, Plant-based oils',
      'Formaldehyde': 'Paraben-free preservatives, airless packaging',
      'Essential Oils': 'Unscented products, single-ingredient moisturizers',
      'Alcohol': 'Alcohol-free toners, hydrating serums',
      'Aloe Vera': 'Cucumber extract, Chamomile, Green tea',
      'Coconut': 'Jojoba oil, Squalane, MCT oil',
      'Gluten': 'Gluten-free certified products',
      'Soy': 'Sunflower oil, Olive oil, Jojoba oil',
      'Dairy': 'Plant-based creams, vegan moisturizers'
    };
    
    return alternatives[allergy] || `Look for ${allergy}-free products`;
  }
  
  // Get all available allergies for UI
  getAllergiesList() {
    return Object.keys(this.allergenMap);
  }
  
  // Check if a product is safe based on user's allergies
  isProductSafe(productIngredients, userAllergies) {
    const detection = this.detectAllergies(productIngredients, userAllergies);
    return !detection.hasAllergens;
  }
}

module.exports = new AllergyService();