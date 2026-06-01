import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-hidden" style={{ background: "linear-gradient(135deg, #FFE8E0 0%, #FFD9C5 100%)", position: "relative" }}>
      
      {/* Floating Hearts Animation - Left Side */}
      <div className="floating-hearts-left">
        {[...Array(12)].map((_, i) => (
          <div key={`left-${i}`} className="heart left-heart" style={{
            left: `${Math.random() * 30}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${5 + Math.random() * 8}s`,
            fontSize: `${16 + Math.random() * 24}px`
          }}>
            ❤️
          </div>
        ))}
      </div>

      {/* Floating Hearts Animation - Right Side */}
      <div className="floating-hearts-right">
        {[...Array(12)].map((_, i) => (
          <div key={`right-${i}`} className="heart right-heart" style={{
            right: `${Math.random() * 30}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${5 + Math.random() * 8}s`,
            fontSize: `${16 + Math.random() * 24}px`
          }}>
            ❤️
          </div>
        ))}
      </div>
      
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-12 py-6 sticky top-0 z-50" style={{ background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)", boxShadow: "0 2px 20px rgba(0,0,0,0.05)" }}>
        <h1 
          onClick={() => navigate("/")} 
          className="text-2xl font-bold cursor-pointer transition-all hover:opacity-80"
          style={{ color: "#D47B5C" }}
        >
          Auracare
        </h1>
        
        <div className="flex gap-6">
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 transition-all hover:text-opacity-70"
                style={{ color: "#5A4A42" }}
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-6 py-2 rounded-full transition-all hover:shadow-lg hover:scale-105"
                style={{ background: "#D47B5C", color: "white" }}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/profile")}
                className="px-4 py-2 transition-all hover:text-opacity-70"
                style={{ color: "#5A4A42" }}
              >
                Profile
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  setIsLoggedIn(false);
                  navigate("/");
                }}
                className="px-4 py-2 transition-all hover:text-opacity-70"
                style={{ color: "#D47B5C" }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="w-full min-h-[85vh] flex items-center justify-center px-8 py-16 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight" style={{ color: "#4A372F" }}>
            Your Personal
            <span style={{ color: "#D47B5C" }}> Skincare</span>
            <br />
            Intelligence
          </h1>
          
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed" style={{ color: "#6B584C" }}>
            Make informed skincare decisions with AI-powered ingredient analysis,
            personalized recommendations, and progress tracking.
          </p>

          <div className="flex gap-6 justify-center flex-wrap">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-10 py-4 rounded-full text-lg font-semibold transition-all hover:shadow-xl hover:scale-105"
                  style={{ background: "#D47B5C", color: "white" }}
                >
                  Start Your Journey
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-10 py-4 rounded-full text-lg font-semibold transition-all hover:shadow-xl hover:scale-105"
                  style={{ border: "2px solid #D47B5C", color: "#D47B5C", background: "transparent" }}
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/recommendations")}
                  className="px-10 py-4 rounded-full text-lg font-semibold transition-all hover:shadow-xl hover:scale-105"
                  style={{ background: "#D47B5C", color: "white" }}
                >
                  Get Recommendations
                </button>
                <button
                  onClick={() => navigate("/routine")}
                  className="px-10 py-4 rounded-full text-lg font-semibold transition-all hover:shadow-xl hover:scale-105"
                  style={{ border: "2px solid #D47B5C", color: "#D47B5C", background: "transparent" }}
                >
                  View Routine
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full py-24 px-8" style={{ background: "white" }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16" style={{ color: "#4A372F" }}>
            Everything you need for better skin
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center p-8 rounded-2xl transition-all hover:transform hover:-translate-y-2" style={{ background: "#FFF9F5" }}>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-3xl" style={{ background: "#FFE8E0", color: "#D47B5C" }}>
                AI
              </div>
              <h3 className="text-2xl font-semibold mb-4" style={{ color: "#4A372F" }}>Smart Analysis</h3>
              <p style={{ color: "#6B584C" }}>AI-powered ingredient safety analysis and personalized product recommendations</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl transition-all hover:transform hover:-translate-y-2" style={{ background: "#FFF9F5" }}>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-3xl" style={{ background: "#FFE8E0", color: "#D47B5C" }}>
                🌿
              </div>
              <h3 className="text-2xl font-semibold mb-4" style={{ color: "#4A372F" }}>Eco Conscious</h3>
              <p style={{ color: "#6B584C" }}>Check environmental impact scores and find sustainable alternatives</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl transition-all hover:transform hover:-translate-y-2" style={{ background: "#FFF9F5" }}>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-3xl" style={{ background: "#FFE8E0", color: "#D47B5C" }}>
                📊
              </div>
              <h3 className="text-2xl font-semibold mb-4" style={{ color: "#4A372F" }}>Track Progress</h3>
              <p style={{ color: "#6B584C" }}>Monitor your skincare journey and see real improvements over time</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full py-20 px-8" style={{ background: "linear-gradient(135deg, #D47B5C 0%, #B85C3D 100%)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ color: "white" }}>
            Ready for healthier skin?
          </h2>
          <p className="text-xl mb-10" style={{ color: "rgba(255,255,255,0.9)" }}>
            Join thousands of users who trust Auracare for their skincare journey
          </p>
          <button
            onClick={() => navigate(isLoggedIn ? "/recommendations" : "/signup")}
            className="px-12 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105 hover:shadow-xl"
            style={{ background: "white", color: "#D47B5C" }}
          >
            {isLoggedIn ? "Get Started Now" : "Create Free Account"}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-12 px-8 text-center" style={{ background: "#4A372F", color: "rgba(255,255,255,0.7)" }}>
        <p>© 2026 Auracare. Empowering safe, informed skincare decisions.</p>
      </footer>

      <style>{`
        .floating-hearts-left,
        .floating-hearts-right {
          position: absolute;
          top: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
        }

        .floating-hearts-left {
          left: 0;
          width: 150px;
        }

        .floating-hearts-right {
          right: 0;
          width: 150px;
        }

        .heart {
          position: absolute;
          opacity: 0.6;
          animation: floatUp linear infinite;
          pointer-events: none;
        }

        .left-heart {
          left: 0;
          transform: translateX(-20px);
        }

        .right-heart {
          right: 0;
          transform: translateX(20px);
        }

        @keyframes floatUp {
          0% {
            bottom: -50px;
            opacity: 0;
            transform: translateX(0) rotate(0deg);
          }
          10% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.8;
            transform: translateX(5px) rotate(10deg);
          }
          90% {
            opacity: 0.5;
          }
          100% {
            bottom: 100%;
            opacity: 0;
            transform: translateX(-10px) rotate(20deg);
          }
        }

        .right-heart {
          animation: floatUpRight linear infinite;
        }

        @keyframes floatUpRight {
          0% {
            bottom: -50px;
            opacity: 0;
            transform: translateX(0) rotate(0deg);
          }
          10% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.8;
            transform: translateX(-5px) rotate(-10deg);
          }
          90% {
            opacity: 0.5;
          }
          100% {
            bottom: 100%;
            opacity: 0;
            transform: translateX(10px) rotate(-20deg);
          }
        }

        @media (max-width: 768px) {
          .floating-hearts-left,
          .floating-hearts-right {
            width: 80px;
          }
          
          .heart {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;