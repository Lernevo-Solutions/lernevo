import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/landingpage";
import AboutUs from "./components/AboutUs";
import Faq from "./components/Faq";
import OurApproachPage from "./components/OurApproachPage";
import AuthPage from "./components/AuthPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/faq" element={<Faq />} /> 
        <Route path="/our-approach" element={<OurApproachPage />} />
        <Route path="/get-started" element={<AuthPage />} />
      </Routes>
    </Router>
  );
}

export default App;
