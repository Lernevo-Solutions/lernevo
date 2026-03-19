import React from "react";
import { useNavigate } from "react-router-dom";
import "./ComingSoon.css";

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="cs-container">

      {/* Animated Background Mesh */}
      <div className="cs-bg">
        <div className="cs-gradient-mesh"></div>
        <div className="cs-blob cs-blob1"></div>
        <div className="cs-blob cs-blob2"></div>
        <div className="cs-blob cs-blob3"></div>
        <div className="cs-particle"></div>
        <div className="cs-particle"></div>
        <div className="cs-particle"></div>
        <div className="cs-particle"></div>
        <div className="cs-particle"></div>
      </div>

      {/* Floating decorative lines */}
      <div className="cs-line"></div>
      <div className="cs-line"></div>

      {/* Header */}
      <div className="cs-header">
        <h1 className="glitch" data-text="🚀 Upcoming Features">🚀 Upcoming Features</h1>
        <p className="typing">We are building powerful AI tools to boost your career 🚀</p>
      </div>

      {/* Feature Grid */}
      <div className="cs-grid">

        {/* Resume Builder - card style 1 */}
        <div className="cs-card card-1 active" data-tilt>
          <div className="cs-icon-wrapper">
            <div className="cs-icon-glow"></div>
            <span className="cs-icon">📄</span>
          </div>
          <h2>Resume Builder</h2>
          <p>Create stunning, ATS-friendly resumes in minutes.</p>
          <button onClick={() => navigate("/home")} className="cs-button">
            <span>Open Builder →</span>
          </button>
        </div>

        {/* Skill Gap Analyzer - card style 2 (highlight) */}
        <div className="cs-card card-2 highlight" data-tilt>
          <div className="cs-icon-wrapper">
            <div className="cs-icon-glow"></div>
            <span className="cs-icon">🧠</span>
          </div>
          <h2>Skill Gap Analyzer</h2>
          <p>Compare your skills with job roles & identify missing skills instantly.</p>
          <span className="cs-badge new">🔥 Upcoming</span>
        </div>

        {/* Add more cards here with different styles */}

      </div>
    </div>
  );
}