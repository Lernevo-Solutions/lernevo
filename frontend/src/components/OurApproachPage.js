import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import ApproachPhilosophy from './ApproachPhilosophy';
import ApproachPillars from './ApproachPillars';
import ApproachTrust from './ApproachTrust';
import ApproachSupport from './ApproachSupport';
import GetStartedFlow from './GetStartedFlow';
import { FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import './LandingPage.css'; // Reuse existing footer styles

const OurApproachPage = () => {
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="our-approach-page">
      <Navbar onGetStarted={() => setIsGetStartedOpen(true)} />
      
      <GetStartedFlow isOpen={isGetStartedOpen} onClose={() => setIsGetStartedOpen(false)} />

      <div className="approach-page-content" style={{ paddingTop: '80px' }}>
        <ApproachPhilosophy />
        <ApproachPillars />
        <ApproachTrust />
        <ApproachSupport />
        {/* Additional approach steps will be added here later */}
      </div>
    </div>
  );
};

export default OurApproachPage;
