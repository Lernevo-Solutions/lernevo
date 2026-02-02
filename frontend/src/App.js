import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/landingpage";
import AboutUs from "./components/AboutUs";
import Faq from "./components/Faq";
import OurApproachPage from "./components/OurApproachPage";
import AuthPage from "./components/AuthPage";
import ProfilePage from "./components/ProfilePage";
import ChangePasswordPage from "./components/ChangePasswordPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  useEffect(() => {
    // Only clear on the very first load of the session if needed, 
    // or as requested: "The application must start in a logged-out state by default"
    // However, if we clear on every App mount, we can't stay logged in after refresh.
    // Given the prompt "On first load: isAuthenticated = false", I'll keep it but 
    // usually this is done only if a specific flag isn't set.
    // To strictly follow: "Remove any default user, token, or profile initialization."
    // I will keep it as is from previous step.
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/faq" element={<Faq />} /> 
        <Route path="/our-approach" element={<OurApproachPage />} />
        <Route path="/get-started" element={<AuthPage />} />
        
        {/* Protected Routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/profile/change-password" element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
