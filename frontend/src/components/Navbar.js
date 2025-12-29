import React, { useState } from 'react';
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <div className="nav-logo">
          <span className="logo-icon">🌊</span>
          <span className="logo-text">BlueWave</span>
        </div>

        <div className={`nav-links ${isOpen ? 'open' : ''}`}>
          <a href="#home" className="nav-link">Home</a>
          <a href="#services" className="nav-link">Services</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#testimonials" className="nav-link">Testimonials</a>
          <a href="#contact" className="nav-link">Contact</a>
          <button className="btn-primary nav-btn">Get Started</button>
        </div>

        <button 
          className="menu-toggle" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;