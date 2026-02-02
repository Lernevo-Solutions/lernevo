import React from 'react';
import './Hero.css';

const Hero = ({ heroImage, onGetStarted }) => {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <section className="hero-section" id="home">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-header-group">
            <h1 className="hero-title">
              Transform Your Life <br />
              <span className="hero-title-highlight">The Smarter Way</span>
            </h1>
          </div>

          <p className="hero-description">
            Lernevo personalizes your wellness journey with smart insights, human support, 
            and simple daily actions—so progress feels natural, not overwhelming. 
            Effortless progress, guided with care. Wellness that grows with you.Build lasting habits with clarity, balance, and confidence—at your own pace.
One platform, one companion, supporting every part of your well-being.One companion for complete wellness
          </p>

          {!isLoggedIn && (
            <button className="hero-pill-button" onClick={onGetStarted}>
              Start Your Journey
            </button>
          )}

          <div className="hero-trust-line">
            <span className="trust-item">Secure</span>
            <span className="trust-divider">•</span>
            <span className="trust-item">Personalized</span>
            <span className="trust-divider">•</span>
            <span className="trust-item">Human-guided AI</span>
          </div>
        </div>
        
        <div className="hero-image-container">
          <div className="hero-image-wrapper">
            <img 
              src={heroImage || '/assets/hero-image.png'} 
              alt="Healthy Lifestyle" 
              className="hero-main-image"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;