import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import "./Navbar.css";
import { ChevronDown, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const location = useLocation();

  // Handle ScrollSpy only on Landing Page
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveTab('');
      return;
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Simple ScrollSpy
      const sections = ['how-it-works', 'why-lernevo', 'services'];
      let currentSection = '';

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Adjusted offset logic
          if (rect.top >= -100 && rect.top < 300) {
            currentSection = section;
            break;
          }
        }
      }
      if (currentSection) setActiveTab(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger once on mount/route change
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">

        {/* Logo */}
        <div className="logo-section" onClick={() => {
          setActiveTab('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}>
          <span className="logo-text">LERNEVO</span>
        </div>

        {/* Center Navigation */}
        <nav className="nav-menu">
          {/* HOME uses NavLink for route capabilities */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-item nav-home ${isActive && activeTab === 'home' ? 'active' : ''}`
            }
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            HOME
          </NavLink>

          <a href="/#how-it-works"
            className={`nav-item nav-how ${activeTab === 'how-it-works' ? 'active' : ''}`}
            onClick={() => setActiveTab('how-it-works')}>
            HOW IT WORKS
          </a>



          <a href="/#about-us"
            className={`nav-item nav-how ${activeTab === 'about-us' ? 'active' : ''}`}
            onClick={() => setActiveTab('about-us')}>
            ABOUT US
          </a>






          <a href="/#DASHBOARD"
            className={`nav-item nav-why ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}>
            DASHBOARD
          </a>

          {/* SERVICES Dropdown */}
          <div className={`nav-item dropdown nav-services ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => {
              const element = document.getElementById('services');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
              setActiveTab('services');
            }}>
            <span className="dropdown-trigger">
              SERVICES <ChevronDown size={14} className="chevron" />
            </span>
            <div className="dropdown-menu">
              <a href="/#FITNESS" className="dropdown-link">
                <strong>FITNESS</strong>
                <span>AI-driven workout plans</span>
              </a>
              <a href="/#NUTRITION" className="dropdown-link">
                <strong>NUTRITION</strong>
                <span>Smart meal tracking</span>
              </a>
              <a href="/#MENTAL-HEALTH" className="dropdown-link">
                <strong>Mental Health</strong>
                <span>Mindfulness & support</span>
              </a>
              <a href="/#LEARNING" className="dropdown-link">
                <strong>LEARNING</strong>
                <span>Personalized skill growth</span>
              </a>
            </div>
          </div>



          {/* For You Dropdown */}
          <div className="nav-item dropdown nav-foryou">
            <span className="dropdown-trigger">
              FOR YOU <ChevronDown size={14} className="chevron" />
            </span>
            <div className="dropdown-menu">
              <a href="/#USER" className="dropdown-link" style={{ '--d': 1 }}>
                <strong>USER</strong>
                <span>Achieve personal goals</span>
              </a>
              <a href="/#TRAINER" className="dropdown-link" style={{ '--d': 2 }}>
                <strong>TRAINER</strong>
                <span>Empower your clients</span>
              </a>
              <a href="/#ADMIN" className="dropdown-link" style={{ '--d': 3 }}>
                <strong>ADMIN</strong>
                <span>Corporate wellness</span>
              </a>
            </div>
          </div>




        </nav>

        {/* Right CTA */}
        <div className="nav-actions">
          <button className="cta-btn">
            GET STARTED
            <ArrowRight size={16} className="cta-arrow" />
          </button>
        </div>

      </div>
    </header>
  );
}
