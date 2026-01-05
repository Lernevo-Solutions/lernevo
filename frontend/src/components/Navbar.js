import React, { useEffect, useState, useCallback } from 'react';
import "./Navbar.css";

const AnimatedText = ({ text }) => {
  return (
    <span className="animated-text">
      {text.split("").map((char, index) => (
        <span key={index} style={{ transitionDelay: `${index * 40}ms` }}>
          {char}
        </span>
      ))}
    </span>
  );
};

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="nav-content">
        <div className="logo">
          <span className="logo-text">LERNEVO</span>
        </div>

        <nav className="nav-links">
          <a href="#home"><AnimatedText text="HOME" /></a>
          <a href="#services"><AnimatedText text="SERVICES" /></a>
          <a href="#about"><AnimatedText text="ABOUT US" /></a>
          <a href="#faq"><AnimatedText text="FAQ" /></a>
        </nav>

        <button className="cta">GET STARTED</button>
      </div>

    </header> 
  );
}

