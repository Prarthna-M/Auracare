import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ChemicalChecker() {
  const [ingredients, setIngredients] = useState("");
  const [results, setResults] = useState([]);
  const [allergyResults, setAllergyResults] = useState(null);
  const [productEcoScore, setProductEcoScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userAllergies, setUserAllergies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserAllergies();
  }, []);

  const fetchUserAllergies = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/allergies/my-allergies", {
        headers: { Authorization: token }
      });
      const data = await res.json();
      if (data.success) {
        setUserAllergies(data.allergies || []);
      }
    } catch (error) {
      console.error("Error fetching allergies:", error);
    }
  };

  const handleCheck = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!ingredients.trim()) {
      setError("Please enter ingredients to check");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);
    setAllergyResults(null);
    setProductEcoScore(null);

    const ingredientArray = ingredients
      .split(/[,\n]/)
      .map(i => i.trim())
      .filter(i => i !== "");

    if (ingredientArray.length === 0) {
      setError("Please enter valid ingredients");
      setLoading(false);
      return;
    }

    try {
      const chemicalRes = await fetch("http://localhost:5000/chemical-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({ ingredients: ingredientArray })
      });
      const chemicalData = await chemicalRes.json();
      setResults(chemicalData);

      const allergyRes = await fetch("http://localhost:5000/api/allergies/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({ ingredients: ingredientArray })
      });
      const allergyData = await allergyRes.json();
      if (allergyData.success) {
        setAllergyResults(allergyData);
      }

      const ecoRes = await fetch("http://localhost:5000/api/eco/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({ ingredients: ingredientArray })
      });
      const ecoData = await ecoRes.json();
      if (ecoData.success) {
        setProductEcoScore(ecoData);
      }

    } catch (err) {
      console.error("Error checking ingredients:", err);
      setError("Failed to check ingredients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low': return '#6B8C42';
      case 'Medium': return '#D47B5C';
      case 'High': return '#DCAAAB';
      default: return '#CDC5B8';
    }
  };

  const getRiskBgColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low': return '#E8F0E0';
      case 'Medium': return '#FFE8E0';
      case 'High': return '#FCE8E8';
      default: return '#F5F0EB';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#6B8C42';
    if (score >= 60) return '#A98899';
    if (score >= 40) return '#D47B5C';
    if (score >= 20) return '#DCAAAB';
    return '#CDC5B8';
  };

  const getEcoIcon = (rating) => {
    switch(rating) {
      case 'Excellent': return '🌿';
      case 'Good': return '✓';
      case 'Fair': return '○';
      case 'Poor': return '⚠';
      case 'Very Poor': return '✗';
      default: return '?';
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'High': return '#DCAAAB';
      case 'Medium': return '#D47B5C';
      default: return '#A98899';
    }
  };

  return (
    <div style={{ background: "linear-gradient(135deg, #FFF5F0 0%, #FFE8E0 100%)", minHeight: "100vh" }}>
      <div className="max-w-4xl mx-auto p-6">
        
        <button 
          onClick={() => navigate('/profile')} 
          style={{
            position: 'sticky',
            top: '20px',
            background: 'white',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '30px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: '#D47B5C',
            boxShadow: '0 2px 12px rgba(212, 123, 92, 0.15)',
            transition: 'all 0.3s ease',
            marginBottom: '30px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 10
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
        >
          ← Back to Profile
        </button>

        <div className="text-center mb-8">
          <h1 style={{ fontSize: '42px', fontWeight: '700', color: '#4A372F', marginBottom: '12px' }}>
            Ingredient Safety & Eco Checker
          </h1>
          <p style={{ color: '#6B584C', fontSize: '16px' }}>
            Check ingredient safety, environmental impact, and allergy warnings
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', marginBottom: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
          <div className="mb-4">
            <label style={{ display: 'block', color: '#4A372F', fontWeight: '600', marginBottom: '8px' }}>
              Enter Ingredients:
            </label>
            <textarea
              placeholder="Enter ingredients separated by commas or new lines...
              
Example:
Glycerin
Salicylic Acid
Parabens
Sodium Lauryl Sulfate"
              style={{
                width: '100%',
                border: '1px solid #FFE0D0',
                borderRadius: '16px',
                padding: '12px',
                background: '#FFF9F5',
                color: '#4A372F',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              rows="6"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
          </div>

          <button
            onClick={handleCheck}
            disabled={loading}
            style={{
              width: '100%',
              background: '#D47B5C',
              color: 'white',
              padding: '14px',
              borderRadius: '40px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(212, 123, 92, 0.3)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Analyzing Ingredients...
              </span>
            ) : (
              "Check Ingredients"
            )}
          </button>
        </div>

        {error && (
          <div style={{ background: '#FCE8E8', border: '1px solid #DCAAAB', color: '#D47B5C', padding: '12px', borderRadius: '12px', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {allergyResults && allergyResults.hasAllergens && (
          <div style={{ background: '#FFF5F0', border: '1px solid #FFE0D0', borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">⚠️</span>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#D47B5C' }}>Allergy Alert!</h2>
            </div>
            <p style={{ color: '#6B584C', marginBottom: '16px' }}>
              This product contains {allergyResults.warnings.length} ingredient(s) you're allergic to.
            </p>
            
            <div className="space-y-3">
              {allergyResults.warnings.map((warning, idx) => (
                <div key={idx} style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div className="flex items-start gap-3">
                    <div 
                      style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: getSeverityColor(warning.severity)
                      }}
                    >
                      {warning.severity}
                    </div>
                    <div className="flex-1">
                      <p style={{ fontWeight: 'bold', color: '#4A372F' }}>{warning.ingredient}</p>
                      <p style={{ fontSize: '13px', color: '#D47B5C', marginTop: '4px' }}>contains {warning.allergen}</p>
                      <p style={{ fontSize: '13px', color: '#6B584C', marginTop: '8px' }}>{warning.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {allergyResults.safeAlternatives && allergyResults.safeAlternatives.length > 0 && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#E8F0E0', borderRadius: '12px' }}>
                <h4 style={{ fontWeight: 'bold', color: '#6B8C42', marginBottom: '8px' }}>Safe Alternatives</h4>
                <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#6B584C' }}>
                  {allergyResults.safeAlternatives.map((alt, idx) => (
                    <li key={idx}>{alt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {productEcoScore && productEcoScore.ingredientsBreakdown && (
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', marginBottom: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#4A372F' }}>Environmental Impact Score</h2>
            
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <div className="text-center">
                <div 
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    border: `4px solid ${getScoreColor(productEcoScore.overallScore)}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'white'
                  }}
                >
                  <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#4A372F' }}>{productEcoScore.overallScore}</span>
                  <span style={{ fontSize: '10px', color: '#6B584C' }}>/100</span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: '600', color: getScoreColor(productEcoScore.overallScore) }}>
                  {getEcoIcon(productEcoScore.ecoRating)} {productEcoScore.ecoRating}
                </div>
              </div>
              
              <div className="flex-1">
                <p style={{ color: '#6B584C' }}>
                  {productEcoScore.overallScore >= 80 ? 'Excellent eco-friendly product!' :
                   productEcoScore.overallScore >= 60 ? 'Good environmental choice.' :
                   productEcoScore.overallScore >= 40 ? 'Fair environmental impact.' :
                   productEcoScore.overallScore >= 20 ? 'Poor environmental impact.' :
                   'Very poor environmental impact - consider alternatives.'}
                </p>
              </div>
            </div>

            <div style={{ background: '#F5F0EB', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
              <h4 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#4A372F' }}>Recommendations</h4>
              <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#6B584C' }}>
                {productEcoScore.recommendations?.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ fontWeight: 'bold', marginBottom: '12px', color: '#4A372F' }}>Ingredient Breakdown</h4>
              <div className="space-y-2">
                {productEcoScore.ingredientsBreakdown.map((ing, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded" style={{ color: '#6B584C' }}>
                    <span>{ing.name}</span>
                    <span style={{ fontWeight: '600', color: getScoreColor(ing.ecoScore) }}>
                      {ing.ecoScore}/100
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#4A372F' }}>Ingredient Analysis</h2>
            <div className="space-y-4">
              {results.map((item, index) => (
                <div
                  key={index}
                  style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#4A372F' }}>{item.ingredient}</h3>
                      <div 
                        style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: getRiskBgColor(item.riskLevel),
                          color: getRiskColor(item.riskLevel)
                        }}
                      >
                        Risk Level: {item.riskLevel}
                      </div>
                    </div>

                    <div style={{ background: '#F5F0EB', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
                      <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#4A372F' }}>Risk Assessment</h4>
                      {item.hazardScore !== undefined && (
                        <p style={{ fontSize: '13px', color: '#6B584C', marginBottom: '4px' }}>
                          <strong>Hazard Score:</strong> {item.hazardScore}/10
                        </p>
                      )}
                      <p style={{ fontSize: '13px', color: '#6B584C', marginBottom: '4px' }}>
                        <strong>Risk Level:</strong> {item.riskLevel}
                      </p>
                      {item.description && (
                        <p style={{ fontSize: '13px', color: '#6B584C' }}>
                          <strong>Description:</strong> {item.description}
                        </p>
                      )}
                    </div>

                    {(item.suitableFor || item.notSuitableFor) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {item.suitableFor && (
                          <div style={{ background: '#E8F0E0', borderRadius: '12px', padding: '12px' }}>
                            <p style={{ fontSize: '12px', fontWeight: '600', color: '#6B8C42', marginBottom: '4px' }}>Suitable For:</p>
                            <p style={{ fontSize: '13px', color: '#6B584C' }}>{item.suitableFor}</p>
                          </div>
                        )}
                        {item.notSuitableFor && (
                          <div style={{ background: '#FCE8E8', borderRadius: '12px', padding: '12px' }}>
                            <p style={{ fontSize: '12px', fontWeight: '600', color: '#DCAAAB', marginBottom: '4px' }}>Not Suitable For:</p>
                            <p style={{ fontSize: '13px', color: '#6B584C' }}>{item.notSuitableFor}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {item.ecoScore !== undefined && (
                      <div style={{ borderTop: '1px solid #FFE0D0', paddingTop: '12px', marginTop: '8px' }}>
                        <div className="flex justify-between items-center">
                          <span style={{ fontSize: '13px', fontWeight: '500', color: '#6B584C' }}>Environmental Impact:</span>
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: '13px' }}>{getEcoIcon(item.ecoRating)} {item.ecoRating}</span>
                            <span style={{ fontWeight: '600', color: getScoreColor(item.ecoScore) }}>
                              {item.ecoScore}/100
                            </span>
                          </div>
                        </div>
                        {item.biodegradability && (
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Biodegradability: {item.biodegradability}</span>
                            <span>Water Pollution: {item.waterPollution}</span>
                          </div>
                        )}
                        {item.sustainabilityNotes && (
                          <p style={{ fontSize: '11px', color: '#A98899', marginTop: '8px', fontStyle: 'italic' }}>{item.sustainabilityNotes}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && results.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p style={{ color: '#6B584C' }}>Enter ingredients above to check their safety and environmental impact</p>
            {userAllergies.length > 0 && (
              <p style={{ fontSize: '13px', color: '#D47B5C', marginTop: '8px' }}>
                Your allergies: {userAllergies.join(", ")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChemicalChecker;