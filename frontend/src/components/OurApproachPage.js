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

      <footer className="footer-new">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <p className="footer-desc">
                Your AI-powered wellness companion helping you build
                healthier habits across body, mind, and lifestyle.
              </p>
              <div className="footer-social">
                <a className="twitter" href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
                <a className="instagram" href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                <a className="linkedin" href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
                <a className="youtube" href="https://youtube.com" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
              </div>
            </div>
            <div className="footer-top">
              <div className="link-col">
                <h4>Product</h4>
                <a>AI Coaching</a>
                <a>Fitness</a>
                <a>Mental Wellness</a>
                <a>Nutrition</a>
              </div>
              <div className="link-col">
                <h4>Company</h4>
                <a>About</a>
                <a>Careers</a>
                <a>Blog</a>
                <a>Contact</a>
              </div>
              <div className="link-col">
                <h4>Support</h4>
                <a>Help Center</a>
                <a>Privacy Policy</a>
                <a>Terms of Service</a>
                <a>Trust & Safety</a>
              </div>
              <div className="link-col">
                <h4>Business</h4>
                <a>Business Dashboard</a>
                <a>Partnerships</a>
                <a>Book a demo</a>
                <a>Enquire</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Lernevo Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OurApproachPage;
