// src/components/Footer.js
import React from 'react';
import { FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer-new">
      <div className="container">
        {/* TOP SECTION */}
        <div className="footer-top">
          {/* BRAND */}
          <div className="footer-brand">
            <p className="footer-desc">
              Your AI-powered wellness companion helping you build
              healthier habits across body, mind, and lifestyle.
            </p>

            <div className="footer-social">
              <a className="twitter" href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </a>
              <a className="instagram" href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a className="linkedin" href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
              </a>
              <a className="youtube" href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                <FaYoutube />
              </a>
            </div>
          </div>

          <div className="footer-top">
            {/* PRODUCT */}
           <div className="link-col">
  <h4>Product</h4>
  <Link to="/ai-coaching">AI Coaching</Link>
  <Link to="/services/fitness">Fitness</Link>
  <Link to="/services/mental-health">Mental Wellness</Link>
  <Link to="/services/nutrition">Nutrition</Link>
</div>

            {/* COMPANY */}
           <div className="link-col">
  <h4>Company</h4>
  <Link to="/about">About</Link>
  <Link to="/careers">Careers</Link>
  <Link to="/blog">Blog</Link>
  <Link to="/contact">Contact</Link>
</div>


            {/* SUPPORT */}
           <div className="link-col">
  <h4>Support</h4>
  <Link to="/help-center">Help Center</Link>
  <Link to="/privacy-policy">Privacy Policy</Link>
  <Link to="/terms-of-service">Terms of Service</Link>
  <Link to="/trust-safety">Trust & Safety</Link>
</div>


            {/* BUSINESS ENQUIRY */}
            <div className="link-col">
  <h4>Business</h4>
  <Link to="/dashboard">Business Dashboard</Link>
  <Link to="/partnerships">Partnerships</Link>
  <Link to="/book-demo">Book a demo</Link>
  <Link to="/enquire">Enquire</Link>
</div>

          </div>
        </div>

        {/* BOTTOM */}
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Lernevo Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;