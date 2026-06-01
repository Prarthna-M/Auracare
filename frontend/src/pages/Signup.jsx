import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      
      if (data.message === "User registered successfully" || data.message === "User registered") {
        navigate("/login");
      } else {
        setError(data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("Failed to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FFF5F0 0%, #FFE8E0 100%)" }}>
      <div className="bg-white p-10 rounded-2xl shadow-xl w-96" style={{ boxShadow: "0 20px 40px rgba(212, 123, 92, 0.1)" }}>
        
        {/* Back to Home Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 text-sm flex items-center gap-1 transition-all hover:translate-x-[-2px]"
          style={{ color: "#D47B5C" }}
        >
          ← Back to Home
        </button>

        <h1 className="text-4xl font-bold text-center mb-2" style={{ color: "#4A372F" }}>
          Join Auracare
        </h1>
        <p className="text-center mb-8" style={{ color: "#6B584C" }}>
          Start your personalized skincare journey
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-center" style={{ background: "#FFE8E0", color: "#D47B5C" }}>
            {error}
          </div>
        )}

        <input
          className="w-full p-3 mb-4 rounded-lg border transition-all focus:outline-none focus:ring-2"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ borderColor: "#FFE0D0", background: "#FFF9F5", color: "#4A372F" }}
          onFocus={(e) => e.target.style.borderColor = "#D47B5C"}
          onBlur={(e) => e.target.style.borderColor = "#FFE0D0"}
        />

        <input
          className="w-full p-3 mb-4 rounded-lg border transition-all focus:outline-none focus:ring-2"
          placeholder="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ borderColor: "#FFE0D0", background: "#FFF9F5", color: "#4A372F" }}
          onFocus={(e) => e.target.style.borderColor = "#D47B5C"}
          onBlur={(e) => e.target.style.borderColor = "#FFE0D0"}
        />

        <input
          type="password"
          className="w-full p-3 mb-6 rounded-lg border transition-all focus:outline-none focus:ring-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ borderColor: "#FFE0D0", background: "#FFF9F5", color: "#4A372F" }}
          onFocus={(e) => e.target.style.borderColor = "#D47B5C"}
          onBlur={(e) => e.target.style.borderColor = "#FFE0D0"}
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full py-3 rounded-full font-semibold transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "#D47B5C", color: "white" }}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <div className="mt-6 text-center">
          <span style={{ color: "#6B584C" }}>Already have an account? </span>
          <button
            onClick={() => navigate("/login")}
            className="font-semibold transition-all hover:underline"
            style={{ color: "#D47B5C" }}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;