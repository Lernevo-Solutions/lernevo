import React, { useState, useEffect, useRef } from 'react';
import "./Navbar.css";
import { ChevronDown, User, LogOut, Key } from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('user_name');
    const image = localStorage.getItem('profile_image');
    
    if (token && token !== 'undefined' && token !== 'null' && token.trim() !== "") {
      setIsAuthenticated(true);
      setUser(name || "User");
      setProfileImage(image);
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setProfileImage(null);
    }
  };

  useEffect(() => {
    checkAuth();
    
    // Listen for storage changes (handles logout in other tabs/windows)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
    setShowProfileDropdown(false);
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name[0].toUpperCase();
  };

  const handleNavClick = (e, target, isSection = false) => {
    if (isSection) {
      if (location.pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
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
            to="/our-approach"
            className={`nav-item nav-how ${location.pathname === "/our-approach" ? "active" : ""}`}
          >
            OUR APPROACH
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

        {/* Right Actions */}
        <div className="nav-actions">
          {!isAuthenticated && (
            <button className="cta-btn" onClick={() => navigate('/get-started')}>
              GET STARTED
            </button>
          )}

          {isAuthenticated && (
            <div className="profile-container" ref={dropdownRef}>
              <div 
                className="profile-avatar" 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                title={user}
              >
                {profileImage ? (
                  <img src={profileImage} alt="Avatar" className="navbar-avatar-image" />
                ) : (
                  getInitials(user)
                )}
              </div>
              
              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <p className="user-name">{user}</p>
                    <p className="user-status">Online</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={() => {navigate('/profile'); setShowProfileDropdown(false);}}>
                    <User size={16} />
                    <span>View Profile</span>
                  </button>
                  <button className="dropdown-item" onClick={() => {navigate('/profile/change-password'); setShowProfileDropdown(false);}}>
                    <Key size={16} />
                    <span>Change Password</span>
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
