import React, { useState, useEffect } from 'react';
import "./Navbar.css";
import { ChevronDown } from "lucide-react";

import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const headerEl = document.querySelector('.navbar');
    const handleScroll = () => {
      const y = window.scrollY || 0;
      const blur = Math.min(22, 18 + (y / 300) * 4);
      const opacity = Math.min(0.75, 0.65 + (y / 300) * 0.1);
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

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-bg-overlay"></div>
      <div className="nav-container">

        {/* Logo */}
        <div className="logo-section">
          <span className="logo-text">LERNEVO</span>
        </div>

        {/* Center Navigation */}
        <nav className="nav-menu">
          {/* UI-only links for now */}
          <Link
            to="/"
            className={`nav-item nav-home ${location.pathname === "/" ? "active" : ""}`}
          >
            HOME
          </Link>

          <div className="nav-item nav-how">
            HOW IT WORKS
          </div>
          <Link
            to="/about"
            className={`nav-item nav-about ${location.pathname === "/about" ? "active" : ""}`}
          >
            ABOUT US
          </Link>


          <div className="nav-item nav-why">
            DASHBOARD
          </div>

          {/* SERVICES Dropdown */}
          <div className="nav-item dropdown nav-services">
            <span className="dropdown-trigger">
              SERVICES </span>
            <div className="dropdown-menu">
              <div className="dropdown-link">
                <strong>FITNESS</strong>
                <span>Smart Workouts</span>
              </div>
              <div className="dropdown-link">
                <strong>NUTRITION</strong>
                <span>Smart Macros</span>
              </div>
              <div className="dropdown-link">
                <strong>Mental Health</strong>
                <span>Mindful Focus</span>
              </div>
              <div className="dropdown-link">
                <strong>LEARNING</strong>
                <span>Adaptive Growth</span>
              </div>
            </div>
          </div>
        <Link
            to="/faq"
            className={`nav-item nav-about ${location.pathname === "/faq" ? "active" : ""}`}
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
