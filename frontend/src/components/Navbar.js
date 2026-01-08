import React, { useState, useEffect } from 'react';
import "./Navbar.css";
import { ChevronDown } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-bg-overlay"></div>
      <div className="navbar-container">

        {/* Logo */}
        <div className="logo-section">
          <span className="logo-text">LERNEVO</span>
        </div>

        {/* Center Navigation */}
        <nav className="nav-menu">
          {/* UI-only links for now */}
          <div className="nav-item nav-home">
            HOME
          </div>

          <div className="nav-item nav-how">
            HOW IT WORKS
          </div>

          <div className="nav-item nav-about">
            ABOUT US
          </div>

          <div className="nav-item nav-why">
            DASHBOARD
          </div>

          {/* SERVICES Dropdown */}
          <div className="nav-item dropdown nav-services">
            <span className="dropdown-trigger">
              SERVICES <ChevronDown size={14} className="chevron" />
            </span>
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

          <div className="nav-item nav-why">
            FAQ
          </div>
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
