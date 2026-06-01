import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div 
            onClick={() => navigate("/")} 
            className="text-2xl font-bold text-purple-600 cursor-pointer hover:text-purple-700 transition"
          >
            ✨ Auracare
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => navigate("/recommendations")}
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 transition"
                >
                  ✨ Recommendations
                </button>
                <button
                  onClick={() => navigate("/routine")}
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 transition"
                >
                  📋 Routine
                </button>
                <button
                  onClick={() => navigate("/chemical-checker")}
                  className="text-gray-700 hover:text-green-600 px-3 py-2 transition"
                >
                  🔬 Checker
                </button>
                <button
                  onClick={() => navigate("/allergies")}
                  className="text-gray-700 hover:text-orange-600 px-3 py-2 transition"
                >
                  ⚠️ Allergies
                </button>
                <button
                  onClick={() => navigate("/progress")}
                  className="text-gray-700 hover:text-teal-600 px-3 py-2 transition"
                >
                  📊 Progress
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 transition"
                >
                  👤 Profile
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/");
                    window.location.reload(); // Refresh to update navbar state
                  }}
                  className="text-red-600 hover:text-red-700 px-3 py-2 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;