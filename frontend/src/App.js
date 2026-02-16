import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import LandingPage from "./components/landingpage";
import AboutUs from "./components/AboutUs";
import Faq from "./components/Faq";
import OurApproachPage from "./components/OurApproachPage";
import AuthPage from "./components/AuthPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import ResetPasswordConfirmPage from "./components/ResetPasswordConfirmPage";
import ProfilePage from "./components/ProfilePage";
import ChangePasswordPage from "./components/ChangePasswordPage";
import DashboardPage from "./components/DashboardPage";

import Nutrition from "./components/Nutrition";
import Fitness from "./components/Fitness";
import Learning from "./components/Learning";
import MentalHealth from "./components/MentalHealth";
import AiCoaching from "./components/AICoachingPage";
import Careers from "./components/Careers";
import ResumeBuilder from './components/ResumeBuilder';
import MyResumes from './components/MyResumes';
import SkillGapAnalyzer from './components/SkillGapAnalyzer';
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";
import Home from "./components/HomePage";
/* ---------------- LAYOUT ---------------- */
const AppLayout = () => {
  const location = useLocation();

  // 👉 intha pages-la footer vendam
  const hideFooterRoutes = [
    "/get-started",
    "/reset-password",
    "/reset-password-confirm",
  ];

  const hideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/our-approach" element={<OurApproachPage />} />
        <Route path="/get-started" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/reset-password-confirm"
          element={<ResetPasswordConfirmPage />}
        />

        {/* Protected Pages */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Services */}
        <Route path="/services/nutrition" element={<Nutrition />} />
        <Route path="/services/fitness" element={<Fitness />} />
        <Route path="/services/learning" element={<Learning />} />
        <Route path="/services/mental-health" element={<MentalHealth />} />
        <Route path="/ai-coaching" element={<AiCoaching />} />
        <Route path='/careers' element={<Careers />} />
         <Route path="/home" element={<Home />} />
         <Route path="/builder" element={<ResumeBuilder />} />
        <Route path="/my-resumes" element={<MyResumes />} />
        <Route path="/analyzer" element={<SkillGapAnalyzer />} />
      </Routes>

      {/* ✅ Footer conditionally */}
      {!hideFooter && <Footer />}
    </>
  );
};

/* ---------------- APP ---------------- */
function App() {
  useEffect(() => {
    // initial app logic if needed
  }, []);

  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
