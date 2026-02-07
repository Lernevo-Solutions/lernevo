// src/pages/AiCoaching.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaMicrochip, FaBolt, FaArrowRight, FaCheckCircle, FaBrain, FaChartLine } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import './AICoaching.css';

const AiCoaching = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: <FaBrain />,
      title: "Hyper-Personalized AI Engine",
      description: "Our core intelligence analyzes your unique biological markers and daily habits to create a wellness roadmap that evolves with you.",
      points: ["Adaptive Workout Scaling", "Metabolic Habit Tracking", "Biometric Data Analysis"],
      badge: "Gemini Powered"
    },
    {
      icon: <FaChartLine />,
      title: "Predictive Health Insights",
      description: "Stay ahead of your health with AI that predicts fatigue, stress peaks, and recovery needs before you even feel them.",
      points: ["Stress Level Forecasting", "Recovery Optimization", "Injury Risk Assessment"],
      badge: "Deep Learning"
    },
    {
      icon: <FaBolt />,
      title: "24/7 Cognitive Companion",
      description: "Instant access to expert-level wellness advice. Whether it's midnight meal alternatives or morning motivation, your coach is one tap away.",
      points: ["Real-time Nutrition Advice", "Instant Goal Adjustments", "Behavioral Motivation"],
      badge: "Always Active"
    }
  ];

  return (
    <div className="ai-coaching-page-wrapper">
      <Navbar onGetStarted={() => navigate('/auth')} />
      
      <div className="ai-coaching-container">
        {/* HERO SECTION - Fitness Style */}
        <section className="ai-hero-card">
          <div className="ai-hero-icon-wrapper">
            <FaRobot size={40} />
          </div>
          <h1>AI-POWERED COACHING</h1>
          <div className="ai-underline"></div>
          <p className="ai-tagline">
            The Future of Wellness Guided by Lernevo Intelligence
          </p>
          <div className="ai-quote-box">
            "Stop Following Generic Plans - Get a Companion That Understands You"
          </div>
        </section>

        {/* CONTENT CARD - Wrapper for sections */}
        <div className="ai-main-content-card">
          
          {/* FEATURES SECTION */}
          <section className="ai-features-section">
            <div className="ai-section-header">
              <FaMicrochip size={32} />
              <h2>Intelligent Ecosystem</h2>
            </div>
            <div className="ai-section-underline"></div>
            <p className="ai-section-subtitle">
              Advanced features engineered for sustainable transformation and peak human performance.
            </p>

            <div className="ai-features-grid">
              {features.map((f, i) => (
                <div key={i} className="ai-feature-card">
                  <div className="ai-feature-icon">
                    {f.icon}
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.description}</p>
                  <ul className="ai-feature-list">
                    {f.points.map((p, index) => (
                      <li key={index}><FaCheckCircle size={16} /> {p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* ROADMAP SECTION - Coming Soon Style */}
          <section className="ai-roadmap-box">
            <div className="ai-roadmap-badge">CORE FEATURE</div>
            <div className="ai-roadmap-header">
              <div className="ai-roadmap-icon">
                <FaBolt size={32} />
              </div>
              <div>
                <h3>Real-Time Bio-Feedback</h3>
                <p className="ai-roadmap-sub">Currently in active development for V2.0</p>
              </div>
            </div>
            <div className="ai-roadmap-intro">
              <strong>Our AI doesn't just plan; it reacts.</strong> 
              Using Gemini AI, we are building a system that adjusts your intensity mid-workout based on your performance data.
            </div>
          </section>

        </div> {/* End of Main Content Card */}

        {/* CTA SECTION */}
        <section className="ai-cta-banner">
          <h2>Transform Your Life with AI</h2>
          <p>Get your hyper-personalized wellness plan today. No more guesswork, just data-driven results.</p>
          <button className="ai-cta-btn" onClick={() => navigate('/auth')}>
            Get Started Now <FaArrowRight size={20} />
          </button>
        </section>
      </div>
    </div>
  );
};

export default AiCoaching;