// src/components/Footer.js
import React from 'react';
import { FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';

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
              <a>AI Coaching</a>
              <a>Fitness</a>
              <a>Mental Wellness</a>
              <a>Nutrition</a>
            </div>

            {/* COMPANY */}
            <div className="link-col">
              <h4>Company</h4>
              <a>About</a>
              <a>Careers</a>
              <a>Blog</a>
              <a>Contact</a>
            </div>

            {/* SUPPORT */}
            <div className="link-col">
              <h4>Support</h4>
              <a>Help Center</a>
              <a>Privacy Policy</a>
              <a>Terms of Service</a>
              <a>Trust & Safety</a>
            </div>

            {/* BUSINESS ENQUIRY */}
            <div className="link-col">
              <h4>Business</h4>
              <a>Business Dashboard</a>
              <a>Partnerships</a>
              <a>Book a demo</a>
              <a>Enquire</a>
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