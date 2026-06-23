import React, { useState, useEffect, useRef } from 'react';
import "./Navbar.css";
import { User, LogOut, Key, Users, LayoutDashboard, Shield } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUser] = useState(null);
  const [userRole, setUserRole] = useState('USER');
  const [profileImage, setProfileImage] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(null);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    const roleMap = {
      'ADMIN': '#7c3aed',
      'USER': '#10b981',
      'TRAINER': '#f59e0b',
      'SUPER_ADMIN': '#ef4444'
    };
    return roleMap[role] || '#6b7280';
  };

  // Get role icon
  const getRoleIcon = (role) => {
    const iconMap = {
      'ADMIN': '🛡️',
      'USER': '👤',
      'TRAINER': '🏋️',
      'SUPER_ADMIN': '👑'
    };
    return iconMap[role] || '👤';
  };

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('user_name');
    const image = localStorage.getItem('profile_image');
    const role = localStorage.getItem('user_role') || 'USER';
    
    if (token && token !== 'undefined' && token !== 'null' && token.trim() !== "") {
      setIsAuthenticated(true);
      setUser(name || "User");
      setProfileImage(image);
      setUserRole(role);
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setProfileImage(null);
      setUserRole('USER');
    }
  };

  useEffect(() => {
    checkAuth();
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
    const handleScroll = () => {
      const y = window.scrollY || 0;
      setScrolled(y > 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
    setUserRole('USER');
    setShowProfileDropdown(false);
    setMobileMenuOpen(false);
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
          setMobileMenuOpen(false);
        }
      }
    }
  };

  const toggleMobileDropdown = (dropdownName) => {
    if (mobileDropdownOpen === dropdownName) {
      setMobileDropdownOpen(null);
    } else {
      setMobileDropdownOpen(dropdownName);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileDropdownOpen(null);
  };

  const featureItems = [
    {
      to: '/home',
      title: 'Resume Builder',
      subtitle: 'Create your resume in minutes',
    },
    {
      to: '/skillhome',
      title: 'Skill Gap Analysis',
      subtitle: 'Compare Resume with Job Description',
    },
    {
      to: '/features/coming-soon',
      title: 'Coming Soon',
      subtitle: 'More exciting features',
    },
  ];

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-bg-overlay"></div>
      <div className="nav-container">

        <div className="logo-section" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <span className="logo-text">LERNEVO</span>
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Nav menu - Left aligned */}
        <nav className={`nav-menu ${mobileMenuOpen ? "mobile-open" : ""}`}>
          {/* ✅ ADMIN NAVIGATION - ONLY USER MANAGEMENT */}
          {userRole === 'ADMIN' ? (
            <>
              {/* ✅ Only User Management - No Dashboard, No Admin */}
              <Link
                to="/user"
                onClick={() => closeMobileMenu()}
                className={`nav-item nav-admin-users ${location.pathname === "/user" ? "active" : ""}`}
              >
                <Users size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                USER MANAGEMENT
              </Link>
            </>
          ) : (
            // ✅ USER NAVIGATION
            <>
              <Link
                to="/"
                onClick={(e) => {
                  handleNavClick(e, 'home', true);
                  closeMobileMenu();
                }}
                className={`nav-item nav-home ${location.pathname === "/" && !location.hash ? "active" : ""}`}
              >
                HOME
              </Link>

              <Link
                to="/our-approach"
                onClick={() => closeMobileMenu()}
                className={`nav-item nav-how ${location.pathname === "/our-approach" ? "active" : ""}`}
              >
                OUR APPROACH
              </Link>

              <Link
                to="/about"
                onClick={() => closeMobileMenu()}
                className={`nav-item nav-about ${location.pathname === "/about" ? "active" : ""}`}
              >
                ABOUT US
              </Link>

              <Link
                to="/dashboard"
                onClick={() => closeMobileMenu()}
                className={`nav-item nav-dashboard ${location.pathname === "/dashboard" ? "active" : ""}`}
              >
                DASHBOARD
              </Link>

              <div className="nav-item dropdown nav-services">
                <span 
                  className="dropdown-trigger"
                  onClick={() => toggleMobileDropdown('services')}
                >
                  SERVICES
                </span>
                <div className={`dropdown-menu ${mobileDropdownOpen === 'services' ? 'mobile-dropdown-open' : ''}`}>
                  <Link to="/services/fitness" className="dropdown-link" onClick={() => closeMobileMenu()}>
                    <strong>FITNESS</strong>
                    <span>Smart Workouts</span>
                  </Link>
                  <Link to="/services/nutrition" className="dropdown-link" onClick={() => closeMobileMenu()}>
                    <strong>NUTRITION</strong>
                    <span>Smart Macros</span>
                  </Link>
                  <Link to="/services/mental-health" className="dropdown-link" onClick={() => closeMobileMenu()}>
                    <strong>Mental Health</strong>
                    <span>Mindful Focus</span>
                  </Link>
                  <Link to="/services/learning" className="dropdown-link" onClick={() => closeMobileMenu()}>
                    <strong>LEARNING</strong>
                    <span>Adaptive Growth</span>
                  </Link>
                </div>
              </div>
              
              <div className="nav-item dropdown nav-features">
                <span 
                  className="dropdown-trigger"
                  onClick={() => toggleMobileDropdown('features')}
                >
                  FEATURES
                </span>
                <div className={`dropdown-menu ${mobileDropdownOpen === 'features' ? 'mobile-dropdown-open' : ''}`}>
                  {featureItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="dropdown-link"
                      onClick={() => closeMobileMenu()}
                    >
                      <strong>{item.title}</strong>
                      <span>{item.subtitle}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                to="/faq"
                onClick={() => closeMobileMenu()}
                className={`nav-item nav-faq ${location.pathname === "/faq" ? "active" : ""}`}
              >
                FAQ
              </Link>
            </>
          )}
        </nav>

        <div className="nav-actions">
          {!isAuthenticated && (
            <button className="cta-btn" onClick={() => navigate('/get-started')}>
              GET STARTED
            </button>
          )}

          {isAuthenticated && (
            <div className="user-welcome-container">
              <span className="welcome-message">
                Welcome, {username ? username.charAt(0).toUpperCase() + username.slice(1) : "User"}!
              </span>
              
              
              <div className="profile-container" ref={dropdownRef}>
                <div 
                  className="profile-avatar" 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  title={username}
                >
                  {profileImage ? (
                    <img src={profileImage} alt="Avatar" className="navbar-avatar-image" />
                  ) : (
                    getInitials(username)
                  )}
                </div>
                
                {showProfileDropdown && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <p className="user-name">{username}</p>
                      <p className="user-status">
                        <span 
                          className="role-indicator"
                          style={{
                            backgroundColor: getRoleBadgeColor(userRole),
                            color: 'white',
                            padding: '2px 12px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            display: 'inline-block'
                          }}
                        >
                          {getRoleIcon(userRole)} {userRole}
                        </span>
                      </p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={() => {navigate('/profile'); setShowProfileDropdown(false); closeMobileMenu();}}>
                      <User size={16} />
                      <span>View Profile</span>
                    </button>
                    
                    {/* ✅ Admin users see User Management in dropdown too */}
                    {userRole === 'ADMIN' && (
                      <button className="dropdown-item" onClick={() => {navigate('/user'); setShowProfileDropdown(false); closeMobileMenu();}}>
                        <Users size={16} />
                        <span>User Management</span>
                      </button>
                    )}

                    <button className="dropdown-item" onClick={() => {navigate('/profile/change-password'); setShowProfileDropdown(false); closeMobileMenu();}}>
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
            </div>
          )}
        </div>
      </div>
    </header>
  );
}