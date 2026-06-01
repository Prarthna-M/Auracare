import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import SkincareChatbot from './pages/SkincareChatBot';
import "./App.css";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Routine from "./pages/Routine";
import ChemicalChecker from "./pages/ChemicalChecker";
import CommunityForum from "./pages/CommunityForum";
import RecommendationWizard from "./pages/RecommendationWizard";
import AllergySettings from "./pages/AllergySettings"; // ✅ Add this
import ProgressTracker from "./pages/ProgressTracker"; // ✅ Add this

function App() {

  // ✅ Proper place for global error handler
  useEffect(() => {
    window.onerror = function (msg, url, line, col, error) {
      console.log("GLOBAL ERROR:", error);
    };
  }, []);

  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/recommendations" element={<RecommendationWizard />} />
        <Route path="/routine" element={<Routine />} /> 
        <Route path="/chemical-checker" element={<ChemicalChecker />} />
        <Route path="/community" element={<CommunityForum />} />
        <Route path="/allergies" element={<AllergySettings />} /> {/* ✅ New route */}
        <Route path="/progress" element={<ProgressTracker />} /> {/* ✅ New route */}
      </Routes>
      
      <SkincareChatbot />
    </BrowserRouter>
  );
}

export default App;