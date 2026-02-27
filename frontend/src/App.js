import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
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
import Features from './components/features';
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from './components/TermsOfService';
import TrustandSafety from "./components/TrustandSafety";
import Partnerships from "./components/Partnerships";
import BookaDemo from "./components/BookaDemo";
import Enquire from "./components/Enquire";
import Blog from "./components/Blog";
import Contact from "./components/Contact";




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
      <Navbar />
      <ScrollToTop />
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/our-approach" element={<OurApproachPage />} />
        <Route path="/get-started" element={<AuthPage />} />
       
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/book-demo" element={<BookaDemo />} />
        <Route path="/trust-safety" element={<TrustandSafety />} />
        <Route path="/partnerships" element={<Partnerships />} />
        <Route path="/enquire" element={<Enquire />} />
        <Route path="/Blog" element={<Blog />} />
        <Route path="/Contact" element={<Contact />} />
        
        
          <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/reset-password-confirm"
          element={<ResetPasswordConfirmPage />} />
        

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
        <Route path='/features' element={<Features />} />
      </Routes>

      {/* ✅ Footer conditionally */}
      {!hideFooter && <Footer />}
    </>
  );
};

/* ---------------- APP ---------------- */
function App() {
  useEffect(() => {
    // Set title immediately
    document.title = "Lernevo - Transform Your Life The Smarter Way";
    
    // Force it again after a tiny delay (overrides anything that runs after)
    setTimeout(() => {
      document.title = "Lernevo - Transform Your Life The Smarter Way";
    }, 100);
    
    // And one more time to be sure
    setTimeout(() => {
      document.title = "Lernevo - Transform Your Life The Smarter Way";
    }, 500);
  }, []);

  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
export default App;





