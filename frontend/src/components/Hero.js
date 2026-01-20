import React from 'react';
import './Hero.css';

const Hero = ({ heroImage }) => {
  return (
    <section className="hero-section" id="home">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Transform Your Life <br />
            <span className="hero-title-highlight">The Smarter Way</span>
          </h1>
          
          <div className="hero-pill-container">
            <span className="hero-pill-text">
              Your all-in-one AI companion for fitness, learning, nutrition, and mental well-being.
            </span>
          </div>

          <p className="hero-description">
            Lernevo personalizes your wellness journey with smart insights, human support, 
            and simple daily actions—so progress feels natural, not overwhelming. 
            Effortless progress, guided with care. Wellness that grows with you.
          </p>

          <button className="hero-pill-button">
            Start Your Journey
          </button>

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
              src={heroImage || "https://images.unsplash.com/photo-1543332164-6e82f355badc?q=80&w=2070&auto=format&fit=crop"} 
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
