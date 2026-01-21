import React, { useState, useEffect } from 'react';
import "./Navbar.css";
import { ChevronDown } from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const headerEl = document.querySelector('.navbar');
    const handleScroll = () => {
      const y = window.scrollY || 0;
      const blur = y > 0 ? Math.min(22, 12 + (y / 300) * 10) : 5;
      const opacity = y > 0 ? Math.min(0.8, 0.5 + (y / 300) * 0.3) : 0;
      if (headerEl) {
        headerEl.style.setProperty('--nav-blur', `${blur}px`);
        headerEl.style.setProperty('--nav-opacity', `${opacity}`);
      }
      setScrolled(y > 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, target, isSection = false) => {
    if (isSection) {
      if (location.pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Navigate to home with hash is handled by native browser if we use <a> or Link with hash,
        // but for smooth scroll we might need a useEffect on the home page.
      }
    }
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-bg-overlay"></div>
      <div className="nav-container">

        {/* Logo */}
        <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="logo-text">LERNEVO</span>
        </div>

        {/* Center Navigation */}
        <nav className="nav-menu">
          <Link
            to="/"
            onClick={(e) => handleNavClick(e, 'home', true)}
            className={`nav-item nav-home ${location.pathname === "/" && !location.hash ? "active" : ""}`}
          >
            HOME
          </Link>

          <Link
            to="/#how-it-works"
            onClick={(e) => handleNavClick(e, 'how-it-works', true)}
            className={`nav-item nav-how ${location.hash === "#how-it-works" ? "active" : ""}`}
          >
            HOW IT WORKS
          </Link>
          <Link
            to="/about"
            className={`nav-item nav-about ${location.pathname === "/about" ? "active" : ""}`}
          >
            ABOUT US
          </Link>


          <Link
            to="/dashboard"
            className={`nav-item nav-dashboard ${location.pathname === "/dashboard" ? "active" : ""}`}
          >
            DASHBOARD
          </Link>

          {/* SERVICES Dropdown */}
          <div className={`nav-item dropdown nav-services ${location.pathname.startsWith("/services") || location.hash === "#services" ? "active" : ""}`}>
            <span className="dropdown-trigger" onClick={(e) => handleNavClick(e, 'services', true)}>
              SERVICES </span>
            <div className="dropdown-menu">
              <Link to="/services/fitness" className="dropdown-link">
                <strong>FITNESS</strong>
                <span>Smart Workouts</span>
              </Link>
              <Link to="/services/nutrition" className="dropdown-link">
                <strong>NUTRITION</strong>
                <span>Smart Macros</span>
              </Link>
              <Link to="/services/mental-health" className="dropdown-link">
                <strong>Mental Health</strong>
                <span>Mindful Focus</span>
              </Link>
              <Link to="/services/learning" className="dropdown-link">
                <strong>LEARNING</strong>
                <span>Adaptive Growth</span>
              </Link>
            </div>
          </div>
        <Link
            to="/faq"
            className={`nav-item nav-faq ${location.pathname === "/faq" ? "active" : ""}`}
          >
            FAQ
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="nav-actions">
          <button className="cta-btn">
            GET STARTED
          </button>
        </div>

      </div>
    </header>
  );
}
