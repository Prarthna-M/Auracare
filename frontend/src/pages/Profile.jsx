import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentSkinType, setCurrentSkinType] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Quiz questions state
  const [skinQuestions, setSkinQuestions] = useState({
    oilAfterWash: "",
    oilDuringDay: "",
    shineLevel: "",
    feelsTight: "",
    flakySkin: "",
    roughTexture: "",
    reactsToProducts: "",
    rednessFrequency: "",
    stingingBurning: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:5000/profile", {
      headers: { Authorization: token }
    })
      .then(res => res.json())
      .then(data => {
        setName(data.name);
        setEmail(data.email);
        if (data.skinType && data.skinType !== "Normal") {
          setCurrentSkinType(data.skinType);
        } else if (data.skinType === "Normal") {
          setCurrentSkinType("Normal");
        }
      })
      .catch(err => console.error("Error fetching profile:", err));
  }, [navigate]);

  const calculateSkinType = () => {
    let oilyScore = 0;
    let dryScore = 0;
    let sensitiveScore = 0;
    let normalScore = 0;

    if (skinQuestions.oilAfterWash === "yes") oilyScore += 2;
    if (skinQuestions.oilAfterWash === "sometimes") oilyScore += 1;
    if (skinQuestions.oilDuringDay === "yes") oilyScore += 2;
    if (skinQuestions.oilDuringDay === "sometimes") oilyScore += 1;
    if (skinQuestions.shineLevel === "high") oilyScore += 2;
    if (skinQuestions.shineLevel === "medium") oilyScore += 1;

    if (skinQuestions.feelsTight === "yes") dryScore += 2;
    if (skinQuestions.feelsTight === "sometimes") dryScore += 1;
    if (skinQuestions.flakySkin === "yes") dryScore += 2;
    if (skinQuestions.flakySkin === "sometimes") dryScore += 1;
    if (skinQuestions.roughTexture === "yes") dryScore += 2;
    if (skinQuestions.roughTexture === "sometimes") dryScore += 1;

    if (skinQuestions.reactsToProducts === "yes") sensitiveScore += 3;
    if (skinQuestions.reactsToProducts === "sometimes") sensitiveScore += 1;
    if (skinQuestions.rednessFrequency === "often") sensitiveScore += 2;
    if (skinQuestions.rednessFrequency === "sometimes") sensitiveScore += 1;
    if (skinQuestions.stingingBurning === "yes") sensitiveScore += 2;
    if (skinQuestions.stingingBurning === "sometimes") sensitiveScore += 1;

    if (oilyScore === 0 && dryScore === 0 && sensitiveScore === 0) normalScore += 3;
    if (oilyScore <= 1 && dryScore <= 1 && sensitiveScore <= 1) normalScore += 2;

    const scores = { Oily: oilyScore, Dry: dryScore, Sensitive: sensitiveScore, Normal: normalScore };
    const primaryType = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    const total = oilyScore + dryScore + sensitiveScore + normalScore || 1;
    const percentages = {
      Oily: Math.round((oilyScore / total) * 100),
      Dry: Math.round((dryScore / total) * 100),
      Sensitive: Math.round((sensitiveScore / total) * 100),
      Normal: Math.round((normalScore / total) * 100)
    };

    return { primaryType, percentages };
  };

  const handleSubmitQuiz = () => {
    const { primaryType, percentages } = calculateSkinType();
    window.tempSkinResults = { primaryType, percentages };
    setQuizCompleted(true);
  };

  const confirmSkinType = async () => {
    if (!window.tempSkinResults) return;

    const { primaryType } = window.tempSkinResults;
    setLoading(true);
    const token = localStorage.getItem("token");

    let oil = "No";
    let dry = "No";
    let sensitive = "No";

    if (primaryType === "Oily") oil = "Yes";
    if (primaryType === "Dry") dry = "Yes";
    if (primaryType === "Sensitive") sensitive = "Yes";

    const res = await fetch("http://localhost:5000/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({ oil, dry, sensitive })
    });

    const data = await res.json();
    if (data.message) {
      setCurrentSkinType(primaryType);
      alert(`✅ ${data.message}\nYour skin type has been set to: ${primaryType}`);
      setShowQuiz(false);
      setQuizCompleted(false);
      window.tempSkinResults = null;
      setSkinQuestions({
        oilAfterWash: "",
        oilDuringDay: "",
        shineLevel: "",
        feelsTight: "",
        flakySkin: "",
        roughTexture: "",
        reactsToProducts: "",
        rednessFrequency: "",
        stingingBurning: ""
      });
    }
    setLoading(false);
  };

  const startQuiz = () => {
    setQuizCompleted(false);
    window.tempSkinResults = null;
    setSkinQuestions({
      oilAfterWash: "",
      oilDuringDay: "",
      shineLevel: "",
      feelsTight: "",
      flakySkin: "",
      roughTexture: "",
      reactsToProducts: "",
      rednessFrequency: "",
      stingingBurning: ""
    });
    setShowQuiz(true);
  };

  const resetQuiz = () => {
    setSkinQuestions({
      oilAfterWash: "",
      oilDuringDay: "",
      shineLevel: "",
      feelsTight: "",
      flakySkin: "",
      roughTexture: "",
      reactsToProducts: "",
      rednessFrequency: "",
      stingingBurning: ""
    });
    setShowQuiz(false);
    setQuizCompleted(false);
    window.tempSkinResults = null;
  };

  const handleQuestionChange = (question, value) => {
    setSkinQuestions(prev => ({ ...prev, [question]: value }));
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const { primaryType, percentages } = quizCompleted && window.tempSkinResults 
    ? window.tempSkinResults 
    : { primaryType: null, percentages: {} };

  const getSkinTypeInfo = (type) => {
    const info = {
      Oily: { emoji: "🧴", color: "#D47B5C", desc: "Your skin produces excess sebum. Look for oil-free, non-comedogenic products.", bg: "#FFF5F0", text: "#D47B5C" },
      Dry: { emoji: "💧", color: "#A98899", desc: "Your skin lacks moisture. Look for hydrating, nourishing products with ceramides.", bg: "#F5F0EB", text: "#A98899" },
      Sensitive: { emoji: "🌿", color: "#6B8C42", desc: "Your skin is easily irritated. Look for fragrance-free, gentle formulas.", bg: "#E8F0E0", text: "#6B8C42" },
      Normal: { emoji: "✨", color: "#D47B5C", desc: "Your skin is balanced! Maintain with gentle, hydrating products.", bg: "#FFE8E0", text: "#D47B5C" }
    };
    return info[type] || { emoji: "❓", color: "#6B584C", desc: "Complete the quiz to discover your skin type", bg: "#F5F0EB", text: "#6B584C" };
  };

  const skinInfo = getSkinTypeInfo(currentSkinType);

  return (
    <div style={{ background: "linear-gradient(135deg, #FFF5F0 0%, #FFE8E0 100%)", minHeight: "100vh", padding: "40px 20px" }}>
      <div className="max-w-2xl mx-auto">
        
        {/* Back to Home Button */}
        <button
          onClick={() => navigate("/")}
          style={{
            background: "white",
            border: "none",
            padding: "10px 24px",
            borderRadius: "30px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            color: "#D47B5C",
            boxShadow: "0 2px 12px rgba(212, 123, 92, 0.15)",
            transition: "all 0.3s ease",
            marginBottom: "24px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(-5px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}
        >
          ← Back to Home
        </button>

        {/* Header */}
        <div style={{ background: "white", borderRadius: "24px", padding: "24px", marginBottom: "24px", textAlign: "center", boxShadow: "0 8px 30px rgba(0,0,0,0.05)" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#4A372F", marginBottom: "8px" }}>
            ✨ Auracare Profile
          </h1>
          <p style={{ color: "#6B584C" }}>Manage your skincare profile and preferences</p>
        </div>

        {/* User Info */}
        <div style={{ background: "white", borderRadius: "24px", padding: "24px", marginBottom: "24px", boxShadow: "0 8px 30px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontWeight: "600", color: "#4A372F", marginBottom: "16px" }}>👤 Account Information</h2>
          <div className="mb-4">
            <label style={{ display: "block", color: "#6B584C", fontWeight: "500", marginBottom: "8px" }}>Name</label>
            <input
              value={name}
              readOnly
              style={{ width: "100%", border: "1px solid #FFE0D0", borderRadius: "12px", padding: "12px", background: "#FFF9F5", color: "#4A372F" }}
            />
          </div>
          <div className="mb-4">
            <label style={{ display: "block", color: "#6B584C", fontWeight: "500", marginBottom: "8px" }}>Email</label>
            <input
              value={email}
              readOnly
              style={{ width: "100%", border: "1px solid #FFE0D0", borderRadius: "12px", padding: "12px", background: "#FFF9F5", color: "#4A372F" }}
            />
          </div>
        </div>

        {/* Current Skin Type Display */}
        {currentSkinType && !showQuiz && (
          <div style={{ background: skinInfo.bg, borderRadius: "24px", padding: "24px", marginBottom: "24px", boxShadow: "0 8px 30px rgba(0,0,0,0.05)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontWeight: "bold", color: "#4A372F" }}>🧴 Your Current Skin Type</h2>
              <button
                onClick={startQuiz}
                style={{ fontSize: "13px", color: "#D47B5C", fontWeight: "500", cursor: "pointer", background: "none", border: "none" }}
              >
                Update Skin Type →
              </button>
            </div>
            <div style={{ textAlign: "center", padding: "20px", background: "white", borderRadius: "16px" }}>
              <div style={{ fontSize: "48px", marginBottom: "8px" }}>{skinInfo.emoji}</div>
              <p style={{ fontSize: "24px", fontWeight: "bold", color: skinInfo.text }}>{currentSkinType}</p>
              <p style={{ fontSize: "13px", color: "#6B584C", marginTop: "8px" }}>{skinInfo.desc}</p>
            </div>
          </div>
        )}

        {/* No Skin Type Set - Prompt to Take Quiz */}
        {!currentSkinType && !showQuiz && (
          <div style={{ background: "#FFF5F0", borderRadius: "24px", padding: "24px", marginBottom: "24px", border: "1px solid #FFE0D0" }}>
            <div className="text-center">
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
              <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#D47B5C", marginBottom: "8px" }}>Discover Your Skin Type</h2>
              <p style={{ color: "#6B584C", marginBottom: "16px" }}>
                Take our quick quiz to find out your skin type and get personalized recommendations!
              </p>
              <button
                onClick={startQuiz}
                style={{ background: "#D47B5C", color: "white", padding: "10px 24px", borderRadius: "40px", fontWeight: "600", border: "none", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                Take Skin Quiz →
              </button>
            </div>
          </div>
        )}

        {/* Quiz Section */}
        {showQuiz && (
          <div style={{ background: "white", borderRadius: "24px", padding: "24px", marginBottom: "24px", boxShadow: "0 8px 30px rgba(0,0,0,0.05)" }}>
            <div className="flex justify-between items-center mb-4">
              <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#4A372F" }}>🔍 Skin Type Quiz</h2>
              {currentSkinType && (
                <button onClick={resetQuiz} style={{ fontSize: "13px", color: "#A98899", cursor: "pointer", background: "none", border: "none" }}>
                  Cancel
                </button>
              )}
            </div>
            
            {!quizCompleted ? (
              <>
                <p style={{ color: "#6B584C", fontSize: "14px", marginBottom: "24px" }}>
                  Answer these questions to help us determine your skin type.
                </p>

                {/* Oiliness Section */}
                <div style={{ background: "#FFF5F0", borderRadius: "16px", padding: "16px", marginBottom: "20px" }}>
                  <h3 style={{ fontWeight: "600", color: "#D47B5C", marginBottom: "12px" }}>🧴 Oiliness Questions</h3>
                  
                  <div className="mb-3">
                    <label style={{ display: "block", color: "#6B584C", fontWeight: "500", marginBottom: "6px", fontSize: "13px" }}>
                      Does your skin feel oily 1-2 hours after washing?
                    </label>
                    <select
                      className="w-full p-2 rounded-lg border"
                      style={{ borderColor: "#FFE0D0", background: "#FFF9F5", borderRadius: "10px" }}
                      value={skinQuestions.oilAfterWash}
                      onChange={(e) => handleQuestionChange("oilAfterWash", e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="yes">Yes</option>
                      <option value="sometimes">Sometimes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label style={{ display: "block", color: "#6B584C", fontWeight: "500", marginBottom: "6px", fontSize: "13px" }}>
                      Does your face look shiny by midday?
                    </label>
                    <select
                      className="w-full p-2 rounded-lg border"
                      style={{ borderColor: "#FFE0D0", background: "#FFF9F5", borderRadius: "10px" }}
                      value={skinQuestions.oilDuringDay}
                      onChange={(e) => handleQuestionChange("oilDuringDay", e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="yes">Yes</option>
                      <option value="sometimes">Sometimes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label style={{ display: "block", color: "#6B584C", fontWeight: "500", marginBottom: "6px", fontSize: "13px" }}>
                      How would you describe the shine on your face?
                    </label>
                    <select
                      className="w-full p-2 rounded-lg border"
                      style={{ borderColor: "#FFE0D0", background: "#FFF9F5", borderRadius: "10px" }}
                      value={skinQuestions.shineLevel}
                      onChange={(e) => handleQuestionChange("shineLevel", e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="high">Very shiny (especially T-zone)</option>
                      <option value="medium">Moderately shiny</option>
                      <option value="low">Not shiny / Matte</option>
                    </select>
                  </div>
                </div>

                {/* Dryness Section */}
                <div style={{ background: "#F5F0EB", borderRadius: "16px", padding: "16px", marginBottom: "20px" }}>
                  <h3 style={{ fontWeight: "600", color: "#A98899", marginBottom: "12px" }}>💧 Dryness Questions</h3>
                  
                  <div className="mb-3">
                    <label style={{ display: "block", color: "#6B584C", fontWeight: "500", marginBottom: "6px", fontSize: "13px" }}>
                      Does your skin feel tight after washing?
                    </label>
                    <select
                      className="w-full p-2 rounded-lg border"
                      style={{ borderColor: "#FFE0D0", background: "#FFF9F5", borderRadius: "10px" }}
                      value={skinQuestions.feelsTight}
                      onChange={(e) => handleQuestionChange("feelsTight", e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="yes">Yes</option>
                      <option value="sometimes">Sometimes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label style={{ display: "block", color: "#6B584C", fontWeight: "500", marginBottom: "6px", fontSize: "13px" }}>
                      Do you have flaky or peeling skin?
                    </label>
                    <select
                      className="w-full p-2 rounded-lg border"
                      style={{ borderColor: "#FFE0D0", background: "#FFF9F5", borderRadius: "10px" }}
                      value={skinQuestions.flakySkin}
                      onChange={(e) => handleQuestionChange("flakySkin", e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="yes">Yes</option>
                      <option value="sometimes">Sometimes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label style={{ display: "block", color: "#6B584C", fontWeight: "500", marginBottom: "6px", fontSize: "13px" }}>
                      Does your skin feel rough or uneven?
                    </label>
                    <select
                      className="w-full p-2 rounded-lg border"
                      style={{ borderColor: "#FFE0D0", background: "#FFF9F5", borderRadius: "10px" }}
                      value={skinQuestions.roughTexture}
                      onChange={(e) => handleQuestionChange("roughTexture", e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="yes">Yes</option>
                      <option value="sometimes">Sometimes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>

                {/* Sensitivity Section */}
                <div style={{ background: "#E8F0E0", borderRadius: "16px", padding: "16px", marginBottom: "20px" }}>
                  <h3 style={{ fontWeight: "600", color: "#6B8C42", marginBottom: "12px" }}>🌿 Sensitivity Questions</h3>
                  
                  <div className="mb-3">
                    <label style={{ display: "block", color: "#6B584C", fontWeight: "500", marginBottom: "6px", fontSize: "13px" }}>
                      Does your skin react to new products?
                    </label>
                    <select
                      className="w-full p-2 rounded-lg border"
                      style={{ borderColor: "#FFE0D0", background: "#FFF9F5", borderRadius: "10px" }}
                      value={skinQuestions.reactsToProducts}
                      onChange={(e) => handleQuestionChange("reactsToProducts", e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="yes">Yes (redness, breakouts, irritation)</option>
                      <option value="sometimes">Sometimes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label style={{ display: "block", color: "#6B584C", fontWeight: "500", marginBottom: "6px", fontSize: "13px" }}>
                      How often do you experience redness?
                    </label>
                    <select
                      className="w-full p-2 rounded-lg border"
                      style={{ borderColor: "#FFE0D0", background: "#FFF9F5", borderRadius: "10px" }}
                      value={skinQuestions.rednessFrequency}
                      onChange={(e) => handleQuestionChange("rednessFrequency", e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="often">Often</option>
                      <option value="sometimes">Sometimes</option>
                      <option value="rarely">Rarely</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label style={{ display: "block", color: "#6B584C", fontWeight: "500", marginBottom: "6px", fontSize: "13px" }}>
                      Do you experience stinging or burning with products?
                    </label>
                    <select
                      className="w-full p-2 rounded-lg border"
                      style={{ borderColor: "#FFE0D0", background: "#FFF9F5", borderRadius: "10px" }}
                      value={skinQuestions.stingingBurning}
                      onChange={(e) => handleQuestionChange("stingingBurning", e.target.value)}
                    >
                      <option value="">Select...</option>
                      <option value="yes">Yes</option>
                      <option value="sometimes">Sometimes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSubmitQuiz}
                  style={{ width: "100%", background: "#D47B5C", color: "white", padding: "12px", borderRadius: "40px", fontWeight: "600", border: "none", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  Analyze My Skin →
                </button>
              </>
            ) : (
              // Results Section
              <>
                <div className="mb-6">
                  <h3 style={{ fontWeight: "600", color: "#4A372F", marginBottom: "16px" }}>Your Skin Analysis Results</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>🧴 Oily</span>
                        <span>{percentages.Oily}%</span>
                      </div>
                      <div style={{ width: "100%", background: "#F5F0EB", borderRadius: "10px", height: "8px", overflow: "hidden" }}>
                        <div style={{ width: `${percentages.Oily}%`, background: "#D47B5C", height: "100%", borderRadius: "10px" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>💧 Dry</span>
                        <span>{percentages.Dry}%</span>
                      </div>
                      <div style={{ width: "100%", background: "#F5F0EB", borderRadius: "10px", height: "8px", overflow: "hidden" }}>
                        <div style={{ width: `${percentages.Dry}%`, background: "#A98899", height: "100%", borderRadius: "10px" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>🌿 Sensitive</span>
                        <span>{percentages.Sensitive}%</span>
                      </div>
                      <div style={{ width: "100%", background: "#F5F0EB", borderRadius: "10px", height: "8px", overflow: "hidden" }}>
                        <div style={{ width: `${percentages.Sensitive}%`, background: "#6B8C42", height: "100%", borderRadius: "10px" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>✨ Normal</span>
                        <span>{percentages.Normal}%</span>
                      </div>
                      <div style={{ width: "100%", background: "#F5F0EB", borderRadius: "10px", height: "8px", overflow: "hidden" }}>
                        <div style={{ width: `${percentages.Normal}%`, background: "#D4C4AB", height: "100%", borderRadius: "10px" }}></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "center", padding: "16px", background: "#FFF5F0", borderRadius: "16px" }}>
                    <p style={{ fontSize: "13px", color: "#D47B5C", marginBottom: "4px" }}>Based on your answers, your skin type is likely:</p>
                    <p style={{ fontSize: "24px", fontWeight: "bold", color: "#D47B5C" }}>{primaryType}</p>
                    <p style={{ fontSize: "11px", color: "#6B584C", marginTop: "8px" }}>
                      {primaryType === "Oily" && "Your skin produces excess sebum. Look for oil-free, non-comedogenic products."}
                      {primaryType === "Dry" && "Your skin lacks moisture. Look for hydrating, nourishing products with ceramides."}
                      {primaryType === "Sensitive" && "Your skin is easily irritated. Look for fragrance-free, gentle formulas."}
                      {primaryType === "Normal" && "Your skin is balanced! Maintain with gentle, hydrating products."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setQuizCompleted(false);
                      window.tempSkinResults = null;
                    }}
                    style={{ flex: 1, background: "#F5F0EB", color: "#6B584C", padding: "10px", borderRadius: "40px", fontWeight: "600", border: "none", cursor: "pointer" }}
                  >
                    Retake Quiz
                  </button>
                  <button
                    onClick={confirmSkinType}
                    disabled={loading}
                    style={{ flex: 1, background: "#D47B5C", color: "white", padding: "10px", borderRadius: "40px", fontWeight: "600", border: "none", cursor: "pointer", opacity: loading ? 0.6 : 1 }}
                  >
                    {loading ? "Saving..." : "Confirm & Save"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 30px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontWeight: "600", color: "#4A372F", marginBottom: "16px" }}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/recommendations")}
              style={{ background: "#D47B5C", color: "white", padding: "10px", borderRadius: "40px", fontSize: "13px", fontWeight: "500", border: "none", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              ✨ Get Recommendations
            </button>
            <button
              onClick={() => navigate("/chemical-checker")}
              style={{ background: "#A98899", color: "white", padding: "10px", borderRadius: "40px", fontSize: "13px", fontWeight: "500", border: "none", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              🔬 Chemical Checker
            </button>
            <button
              onClick={() => navigate("/routine")}
              style={{ background: "#6B8C42", color: "white", padding: "10px", borderRadius: "40px", fontSize: "13px", fontWeight: "500", border: "none", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              📋 My Routine
            </button>
            <button
              onClick={() => navigate("/allergies")}
              style={{ background: "#DCAAAB", color: "white", padding: "10px", borderRadius: "40px", fontSize: "13px", fontWeight: "500", border: "none", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              ⚠️ Manage Allergies
            </button>
            <button
              onClick={() => navigate("/progress")}
              style={{ background: "#D4C4AB", color: "#4A372F", padding: "10px", borderRadius: "40px", fontSize: "13px", fontWeight: "500", border: "none", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              📊 Progress Tracker
            </button>
            <button
              onClick={() => navigate("/community")}
              style={{ background: "#FFE0D0", color: "#D47B5C", padding: "10px", borderRadius: "40px", fontSize: "13px", fontWeight: "500", border: "none", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              💬 Community
            </button>
          </div>
          
          {/* Wide Logout Button */}
          <button
            onClick={logout}
            style={{
              width: "100%",
              marginTop: "12px",
              background: "#DCAAAB",
              color: "white",
              padding: "12px",
              borderRadius: "40px",
              fontSize: "14px",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;