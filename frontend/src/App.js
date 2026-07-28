import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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
import Features from "./components/features";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import TrustandSafety from "./components/TrustandSafety";
import Partnerships from "./components/Partnerships";
import BookaDemo from "./components/BookaDemo";
import Enquire from "./components/Enquire";
import Blog from "./components/Blog";
import Contact from "./components/Contact";
import HelpCenter from "./components/HelpCenter";
import FeedbackWidget from "./components/feedback/FeedbackWidget";

import ResumeBuilder from "./components/Resumebuilderrouter";
import Homepage from "./components/HomePage";
import MyResumes from "./components/MyResumes";
import Templates from "./components/Templates";
import ComingSoon from "./components/ComingSoon";
import Skill from "./components/skill";
import { APP_ENV, API_BASE_URL } from "./config";
import SkilDashboard from "./components/skilldashboard";
import SkillHome from "./components/Skillhome";
import FeedbackList from "./components/FeedbackList";
import AdminRolesPage, { TrainerRolesPage } from "./components/user";

const AppLayout = () => {
  const location = useLocation();
  const currentRole = localStorage.getItem("user_role") || "USER";

  const RolesRedirect = () => {
    if (currentRole === "ADMIN") {
      return <Navigate to="/admin/roles" replace />;
    }
    if (currentRole === "TRAINER") {
      return <Navigate to="/trainer/roles" replace />;
    }
    return <Navigate to="/" replace />;
  };

  const hideFooterRoutes = [
    "/get-started",
    "/reset-password",
    "/reset-password-confirm",
    "/features/coming-soon",
    "/builder",
    "/my-resumes",
    "/skill",
    "/skill-gap-analyzer",
    "/skilldashboard",
    "/user",
    "/admin/roles",
    "/trainer/roles",
    "/feedback",
  ];

  const hideNavbarRoutes = [
    "/my-resumes",
    "/builder",
    "/home",
    "/templates",
    "/admin/roles",
    "/trainer/roles",
  ];

  const hideFooter = hideFooterRoutes.includes(location.pathname);
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);
  const hideFeedbackWidget = ["/feedback", "/user", "/admin/roles", "/trainer/roles"].includes(
    location.pathname
  );

  return (
    <>
      {!hideNavbar && <Navbar />}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/our-approach" element={<OurApproachPage />} />
        <Route path="/get-started" element={<AuthPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/book-demo" element={<BookaDemo />} />
        <Route path="/trust-safety" element={<TrustandSafety />} />
        <Route path="/partnerships" element={<Partnerships />} />
        <Route path="/enquire" element={<Enquire />} />
        <Route path="/Blog" element={<Blog />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/features/coming-soon" element={<ComingSoon />} />
        <Route
          path="/reset-password-confirm"
          element={<ResetPasswordConfirmPage />}
        />

        <Route path="/admin/roles" element={<AdminRolesPage />} />
        <Route path="/trainer/roles" element={<TrainerRolesPage />} />
        <Route path="/user" element={<RolesRedirect />} />
        <Route path="/skillhome" element={<SkillHome />} />

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
        <Route path="/services/nutrition" element={<Nutrition />} />
        <Route path="/services/fitness" element={<Fitness />} />
        <Route path="/services/learning" element={<Learning />} />
        <Route path="/services/mental-health" element={<MentalHealth />} />
        <Route path="/ai-coaching" element={<AiCoaching />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/features" element={<Features />} />
        <Route path="/feedback" element={<FeedbackList />} />
        <Route
          path="/builder"
          element={
            <ProtectedRoute featureName="Resume Builder">
              <ResumeBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute featureName="Resume Builder">
              <Homepage />
            </ProtectedRoute>
          }
        />
        <Route path="/my-resumes" element={<MyResumes />} />
        <Route
          path="/templates"
          element={
            <ProtectedRoute featureName="resume templates">
              <Templates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/skill-gap-analyzer"
          element={
            <ProtectedRoute featureName="Skill Gap Analyzer">
              <Skill />
            </ProtectedRoute>
          }
        />
        <Route
          path="/skill"
          element={<Navigate to="/skill-gap-analyzer" replace />}
        />
        <Route path="/skilldashboard" element={<SkilDashboard />} />
      </Routes>

      {!hideFooter && <Footer />}
      {!hideFeedbackWidget && <FeedbackWidget />}
    </>
  );
};

console.log("APP_ENV:", APP_ENV);
console.log("API_BASE_URL:", API_BASE_URL);

function App() {
  useEffect(() => {
    document.title = "Lernevo - Transform Your Life The Smarter Way";
  }, []);

  return (
    <Router>
      <AppLayout />
    </Router>
  );
}


export default App;
