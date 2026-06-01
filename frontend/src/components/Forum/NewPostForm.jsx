import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function NewPostForm({ onPostCreated }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    productType: "",
    skinType: "",
    daysUsed: "",
    rating: 5,
    review: "",
    beforeAfter: "",
    wouldRepurchase: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ Check login status
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (!token) {
      setError("You must be logged in to post a review");
    }
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in. Please login first.");
      return;
    }

    // ✅ Basic validation
    if (!formData.productName || !formData.brand || !formData.productType || 
        !formData.skinType || !formData.review) {
      setError("Please fill all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const postData = {
        ...formData,
        daysUsed: parseInt(formData.daysUsed) || 0,
        rating: parseInt(formData.rating) || 5
      };

      const res = await fetch("http://localhost:5000/api/community/post", {
        method: "POST",
        headers: {
          "Authorization": token,  // Just the token, no "Bearer " prefix
          "Content-Type": "application/json"
        },
        body: JSON.stringify(postData)
      });

      const data = await res.json();

      if (res.ok) {
        alert("Review posted successfully!");
        onPostCreated();

        // Reset form
        setFormData({
          productName: "",
          brand: "",
          productType: "",
          skinType: "",
          daysUsed: "",
          rating: 5,
          review: "",
          beforeAfter: "",
          wouldRepurchase: true
        });
      } else {
        setError(data.error || "Failed to post review");

        if (res.status === 401) {
          setError("Session expired. Please login again.");
          localStorage.removeItem("token");
          setTimeout(() => navigate("/login"), 2000);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Backend may not be running.");
    } finally {
      setSubmitting(false);
    }
  };

  // ⭐ Star display
  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  // ❌ Not logged in UI
  if (!isLoggedIn) {
    return (
      <div style={{
        background: "white",
        borderRadius: "24px",
        padding: "32px",
        textAlign: "center",
        boxShadow: "0 8px 30px rgba(0,0,0,0.05)"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
        <p style={{ color: "#D47B5C", marginBottom: "16px", fontWeight: "500" }}>
          You must be logged in to post a review
        </p>
        <button
          onClick={() => navigate("/login")}
          style={{
            background: "#D47B5C",
            color: "white",
            padding: "10px 24px",
            borderRadius: "40px",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // ✅ Main UI
  return (
    <div style={{
      background: "white",
      borderRadius: "24px",
      padding: "32px",
      boxShadow: "0 8px 30px rgba(0,0,0,0.05)"
    }}>
      <h2 style={{
        fontSize: "24px",
        fontWeight: "bold",
        color: "#4A372F",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        <span style={{ color: "#D47B5C" }}>📝</span> Share Your Experience
      </h2>

      {error && (
        <div style={{
          background: "#FCE8E8",
          borderLeft: "4px solid #DCAAAB",
          color: "#D47B5C",
          padding: "16px",
          marginBottom: "24px",
          borderRadius: "12px"
        }}>
          <p style={{ fontWeight: "bold", marginBottom: "4px" }}>Error:</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Product Info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <input
            type="text"
            name="productName"
            placeholder="Product Name *"
            required
            value={formData.productName}
            onChange={handleChange}
            style={{
              padding: "12px",
              border: "1px solid #FFE0D0",
              borderRadius: "12px",
              background: "#FFF9F5",
              color: "#4A372F",
              outline: "none"
            }}
          />

          <input
            type="text"
            name="brand"
            placeholder="Brand *"
            required
            value={formData.brand}
            onChange={handleChange}
            style={{
              padding: "12px",
              border: "1px solid #FFE0D0",
              borderRadius: "12px",
              background: "#FFF9F5",
              color: "#4A372F",
              outline: "none"
            }}
          />
        </div>

        {/* Dropdowns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          <select
            name="productType"
            required
            value={formData.productType}
            onChange={handleChange}
            style={{
              padding: "12px",
              border: "1px solid #FFE0D0",
              borderRadius: "12px",
              background: "#FFF9F5",
              color: "#4A372F",
              outline: "none"
            }}
          >
            <option value="">Product Type *</option>
            <option>Cleanser</option>
            <option>Serum</option>
            <option>Moisturizer</option>
            <option>Sunscreen</option>
            <option>Toner</option>
            <option>Mask</option>
            <option>Treatment</option>
          </select>

          <select
            name="skinType"
            required
            value={formData.skinType}
            onChange={handleChange}
            style={{
              padding: "12px",
              border: "1px solid #FFE0D0",
              borderRadius: "12px",
              background: "#FFF9F5",
              color: "#4A372F",
              outline: "none"
            }}
          >
            <option value="">Skin Type *</option>
            <option>Oily</option>
            <option>Dry</option>
            <option>Combination</option>
            <option>Sensitive</option>
            <option>Normal</option>
          </select>

          <input
            type="number"
            name="daysUsed"
            placeholder="Days Used *"
            min="1"
            value={formData.daysUsed}
            onChange={handleChange}
            style={{
              padding: "12px",
              border: "1px solid #FFE0D0",
              borderRadius: "12px",
              background: "#FFF9F5",
              color: "#4A372F",
              outline: "none"
            }}
          />
        </div>

        {/* Rating */}
        <div>
          <label style={{ display: "block", color: "#6B584C", marginBottom: "8px", fontWeight: "500" }}>
            Rating (1-5) *
          </label>
          <input
            type="range"
            name="rating"
            min="1"
            max="5"
            step="1"
            value={formData.rating}
            onChange={handleChange}
            style={{ width: "100%", accentColor: "#D47B5C" }}
          />
          <p style={{ fontSize: "20px", color: "#F4A261", marginTop: "8px" }}>
            {renderStars(formData.rating)}
          </p>
        </div>

        {/* Review */}
        <textarea
          name="review"
          required
          placeholder="Write your review... *"
          value={formData.review}
          onChange={handleChange}
          rows="4"
          style={{
            padding: "12px",
            border: "1px solid #FFE0D0",
            borderRadius: "12px",
            background: "#FFF9F5",
            color: "#4A372F",
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit"
          }}
        />

        {/* Before/After (Optional) */}
        <input
          type="text"
          name="beforeAfter"
          placeholder="Before/After results (optional)"
          value={formData.beforeAfter}
          onChange={handleChange}
          style={{
            padding: "12px",
            border: "1px solid #FFE0D0",
            borderRadius: "12px",
            background: "#FFF9F5",
            color: "#4A372F",
            outline: "none"
          }}
        />

        {/* Checkbox */}
        <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#6B584C", cursor: "pointer" }}>
          <input
            type="checkbox"
            name="wouldRepurchase"
            checked={formData.wouldRepurchase}
            onChange={handleChange}
            style={{ width: "18px", height: "18px", accentColor: "#D47B5C" }}
          />
          Would repurchase this product
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            background: "#D47B5C",
            color: "white",
            padding: "14px",
            borderRadius: "40px",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "16px",
            transition: "all 0.2s",
            opacity: submitting ? 0.6 : 1
          }}
          onMouseEnter={(e) => !submitting && (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => !submitting && (e.currentTarget.style.transform = "scale(1)")}
        >
          {submitting ? "Posting..." : "Post Review"}
        </button>
      </form>
    </div>
  );
}

export default NewPostForm;