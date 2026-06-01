import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RecommendationWizard = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    description: '',
    concerns: [],
    budget: '',
    age: '',
    goal: '',
    additionalInfo: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const concernsList = [
    'Acne', 'Pigmentation', 'Blackheads', 'Large Pores', 'Dryness',
    'Aging', 'Wrinkles', 'Redness', 'Sensitivity', 'Dullness',
    'Uneven Texture', 'Dark Circles', 'Oiliness', 'Dehydration'
  ];
  
  const goalsList = [
    'Anti-aging', 'Hydration', 'Brightening', 'Acne Treatment',
    'Pore Minimizing', 'Soothing', 'Exfoliation', 'Sun Protection',
    'Even Skin Tone', 'Texture Improvement'
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleConcernToggle = (concern) => {
    setFormData(prev => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter(c => c !== concern)
        : [...prev.concerns, concern]
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/recommendations/get',
        formData,
        { headers: { Authorization: token } }
      );
      
      if (response.data.success) {
        setRecommendations(response.data.data);
        setStep(3);
        if (response.data.fromCache) {
          console.log('Retrieved from cache!');
        }
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to get recommendations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  
  return (
    <div style={{ background: "linear-gradient(135deg, #FFF5F0 0%, #FFE8E0 100%)", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative" }}>
        
        {/* Back to Profile Button */}
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
            marginBottom: '24px',
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

        {/* Steps Indicator */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px", padding: "0 20px" }}>
          <div style={{
            flex: 1,
            textAlign: "center",
            padding: "10px",
            background: step >= 1 ? "#D47B5C" : "#F5F0EB",
            borderRadius: "40px",
            margin: "0 5px",
            color: step >= 1 ? "white" : "#6B584C",
            fontWeight: "500",
            transition: "all 0.3s"
          }}>
            1. Describe
          </div>
          <div style={{
            flex: 1,
            textAlign: "center",
            padding: "10px",
            background: step >= 2 ? "#D47B5C" : "#F5F0EB",
            borderRadius: "40px",
            margin: "0 5px",
            color: step >= 2 ? "white" : "#6B584C",
            fontWeight: "500",
            transition: "all 0.3s"
          }}>
            2. Details
          </div>
          <div style={{
            flex: 1,
            textAlign: "center",
            padding: "10px",
            background: step >= 3 ? "#D47B5C" : "#F5F0EB",
            borderRadius: "40px",
            margin: "0 5px",
            color: step >= 3 ? "white" : "#6B584C",
            fontWeight: "500",
            transition: "all 0.3s"
          }}>
            3. Results
          </div>
        </div>
        
        {step === 1 && (
          <div style={{ background: "white", padding: "32px", borderRadius: "24px", boxShadow: "0 8px 30px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "#4A372F", marginBottom: "8px" }}>Describe Your Skin Concerns</h2>
            <p style={{ color: "#6B584C", marginBottom: "20px" }}>Tell us about your skin issues, what you're experiencing, and what you'd like to improve.</p>
            
            <textarea
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #FFE0D0",
                borderRadius: "16px",
                fontSize: "14px",
                margin: "20px 0",
                background: "#FFF9F5",
                color: "#4A372F",
                resize: "vertical"
              }}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Example: I have oily skin with occasional acne on my chin. I've tried many products but they either make me break out more or leave my skin feeling dry. I'm looking for a gentle routine that won't irritate my sensitive areas..."
              rows="6"
            />
            
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
              <button 
                onClick={nextStep} 
                disabled={!formData.description.trim()}
                style={{
                  padding: "10px 24px",
                  background: formData.description.trim() ? "#D47B5C" : "#F5F0EB",
                  color: formData.description.trim() ? "white" : "#6B584C",
                  border: "none",
                  borderRadius: "40px",
                  cursor: formData.description.trim() ? "pointer" : "not-allowed",
                  fontWeight: "500"
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div style={{ background: "white", padding: "32px", borderRadius: "24px", boxShadow: "0 8px 30px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "#4A372F", marginBottom: "8px" }}>Additional Details</h2>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#6B584C" }}>Select your specific concerns (optional):</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", margin: "15px 0" }}>
                {concernsList.map(concern => (
                  <button
                    key={concern}
                    type="button"
                    onClick={() => handleConcernToggle(concern)}
                    style={{
                      padding: "8px 18px",
                      background: formData.concerns.includes(concern) ? "#D47B5C" : "#F5F0EB",
                      color: formData.concerns.includes(concern) ? "white" : "#6B584C",
                      border: "none",
                      borderRadius: "30px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      fontSize: "13px"
                    }}
                  >
                    {concern}
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#6B584C" }}>Budget per product (USD):</label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="e.g., 50"
                  step="10"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #FFE0D0",
                    borderRadius: "12px",
                    background: "#FFF9F5",
                    color: "#4A372F"
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#6B584C" }}>Age:</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g., 25"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #FFE0D0",
                    borderRadius: "12px",
                    background: "#FFF9F5",
                    color: "#4A372F"
                  }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#6B584C" }}>Primary skincare goal:</label>
              <select 
                name="goal" 
                value={formData.goal} 
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #FFE0D0",
                  borderRadius: "12px",
                  background: "#FFF9F5",
                  color: "#4A372F"
                }}
              >
                <option value="">Select a goal</option>
                {goalsList.map(goal => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#6B584C" }}>Additional information:</label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                placeholder="Any allergies, current products you're using, preferences for natural/organic, etc."
                rows="3"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #FFE0D0",
                  borderRadius: "12px",
                  background: "#FFF9F5",
                  color: "#4A372F",
                  resize: "vertical"
                }}
              />
            </div>
            
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
              <button 
                onClick={prevStep}
                style={{
                  padding: "10px 24px",
                  background: "#F5F0EB",
                  color: "#6B584C",
                  border: "none",
                  borderRadius: "40px",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                ← Back
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                style={{
                  padding: "10px 24px",
                  background: "#D47B5C",
                  color: "white",
                  border: "none",
                  borderRadius: "40px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: "500",
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Analyzing...' : 'Get Recommendations →'}
              </button>
            </div>
          </div>
        )}
        
        {step === 3 && recommendations && (
          <div style={{ background: "white", padding: "32px", borderRadius: "24px", boxShadow: "0 8px 30px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "bold", color: "#4A372F", marginBottom: "20px" }}>Your Personalized Skincare Plan</h2>
            
            <div style={{ background: "#FFF5F0", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
              <h3 style={{ fontWeight: "600", color: "#D47B5C", marginBottom: "12px" }}>Skin Analysis</h3>
              <p style={{ color: "#6B584C", marginBottom: "8px" }}><strong style={{ color: "#4A372F" }}>Skin Type:</strong> {recommendations.skinType}</p>
              <p style={{ color: "#6B584C" }}><strong style={{ color: "#4A372F" }}>Primary Concerns:</strong> {recommendations.concerns.join(', ')}</p>
            </div>
            
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontWeight: "600", color: "#4A372F", marginBottom: "16px" }}>Recommended Products</h3>
              {recommendations.recommendations.map((product, idx) => (
                <div key={idx} style={{ border: "1px solid #FFE0D0", borderRadius: "16px", padding: "16px", marginBottom: "12px", background: "#FFF9F5" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ fontSize: "18px", fontWeight: "600", color: "#4A372F" }}>{product.name}</h4>
                    {product.inDatabase && <span style={{ background: "#6B8C42", color: "white", padding: "2px 8px", borderRadius: "20px", fontSize: "10px" }}>✓ Verified</span>}
                  </div>
                  <p style={{ color: "#A98899", fontSize: "13px", marginBottom: "8px" }}>{product.brand}</p>
                  <p style={{ color: "#D47B5C", fontWeight: "500", marginBottom: "8px" }}>${product.price}</p>
                  <p style={{ color: "#6B584C", fontSize: "13px", marginBottom: "12px" }}>{product.description}</p>
                  <div style={{ background: "#F5F0EB", padding: "12px", borderRadius: "12px", marginBottom: "8px" }}>
                    <strong style={{ color: "#4A372F" }}>Why it's recommended:</strong> {product.whyRecommended}
                  </div>
                  {product.keyIngredients && product.keyIngredients.length > 0 && (
                    <p style={{ fontSize: "12px", color: "#6B584C", marginTop: "8px" }}>
                      <strong>Key ingredients:</strong> {product.keyIngredients.join(', ')}
                    </p>
                  )}
                  <p style={{ fontSize: "12px", color: "#A98899", marginTop: "8px" }}>
                    <strong>Where to buy:</strong> {product.whereToBuy}
                  </p>
                </div>
              ))}
            </div>
            
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontWeight: "600", color: "#4A372F", marginBottom: "16px" }}>🌅 Morning Routine</h3>
              {recommendations.routine.morning.map((step, idx) => (
                <div key={idx} style={{ background: "#F5F0EB", padding: "12px", borderRadius: "12px", marginBottom: "8px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: "bold", minWidth: "80px", color: "#D47B5C" }}>{step.step}:</span>
                  <span style={{ color: "#4A372F" }}>{step.name}</span>
                  <span style={{ color: "#6B584C", fontSize: "12px" }}>{step.description}</span>
                </div>
              ))}
            </div>
            
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ fontWeight: "600", color: "#4A372F", marginBottom: "16px" }}>🌙 Night Routine</h3>
              {recommendations.routine.night.map((step, idx) => (
                <div key={idx} style={{ background: "#F5F0EB", padding: "12px", borderRadius: "12px", marginBottom: "8px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: "bold", minWidth: "80px", color: "#D47B5C" }}>{step.step}:</span>
                  <span style={{ color: "#4A372F" }}>{step.name}</span>
                  <span style={{ color: "#6B584C", fontSize: "12px" }}>{step.description}</span>
                </div>
              ))}
            </div>
            
            <div style={{ background: "#FFF5F0", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
              <h3 style={{ fontWeight: "600", color: "#D47B5C", marginBottom: "12px" }}>Expert Tips</h3>
              <ul style={{ margin: 0, paddingLeft: "20px", color: "#6B584C" }}>
                {recommendations.tips.map((tip, idx) => (
                  <li key={idx} style={{ marginBottom: "6px" }}>{tip}</li>
                ))}
              </ul>
            </div>
            
            <div style={{ background: "#E8F0E0", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
              <h3 style={{ fontWeight: "600", color: "#6B8C42", marginBottom: "8px" }}>Summary</h3>
              <p style={{ color: "#6B584C" }}>{recommendations.summary}</p>
            </div>
            
            <button 
              onClick={() => setStep(1)} 
              style={{
                width: "100%",
                padding: "12px",
                background: "#F5F0EB",
                color: "#6B584C",
                border: "none",
                borderRadius: "40px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              Start New Request
            </button>
          </div>
        )}
        
        {error && (
          <div style={{ background: "#FCE8E8", color: "#D47B5C", padding: "12px", borderRadius: "12px", marginTop: "20px" }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationWizard;