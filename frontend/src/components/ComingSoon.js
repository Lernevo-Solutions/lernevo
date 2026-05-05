import React from "react";
import { useNavigate } from "react-router-dom";
import "./ComingSoon.css";

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="cs-new-wrapper">
      {/* Enhanced White & Blue Background */}
      <div className="cs-bg-clean">
        <div className="cs-bg-shape-1"></div>
        <div className="cs-bg-shape-2"></div>
        <div className="cs-bg-shape-3"></div>
        <div className="cs-bg-grid"></div>
      </div>

      <div className="cs-container-clean">
        {/* Header Section - Enhanced */}
        <div className="cs-header-clean">
          <div className="cs-chip">
            <span className="cs-chip-dot"></span>
            What's Coming Next
            <span className="cs-chip-pulse"></span>
          </div>
          <h1 className="cs-main-title">
            <span className="cs-gradient-text">AI-Powered</span> Tools
            <br />
            for Your Career
          </h1>
          <div className="cs-title-underline"></div>
          <p className="cs-description">
            We're building intelligent solutions to help you land your dream job.
            <br />
            Get ready for a smarter way to grow professionally.
          </p>

          {/* Enhanced Email Signup */}
          <div className="cs-signup-box">
            <div className="cs-input-wrapper">
              <svg className="cs-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 6L12 13L2 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input type="email" placeholder="Enter your email address" />
            </div>
            <button>
              Get Early Access
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

         <div className="cs-trust-badges">
  <span>🧠 Smart resume builder</span>
  <span>⚡ Real-time preview</span>
  <span>🎯 Job-ready templates</span>
</div>
        </div>

        {/* Features Grid - Enhanced Cards */}
        <div className="cs-features-grid">
          {/* Resume Builder Card - Enhanced Active */}
          <div className="cs-feature-card cs-card-active">
            <div className="cs-card-glow"></div>
            <div className="cs-card-top">
              <div className="cs-card-icon cs-icon-blue">
                <div className="cs-icon-bg"></div>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 10H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M8 14H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="cs-card-badge cs-badge-live">
                <span className="badge-dot"></span>
                Live Now
              </div>
            </div>
            <h3 className="cs-card-title">Resume Builder</h3>
            <p className="cs-card-text">
              Create stunning, ATS-friendly resumes in minutes with our AI-powered templates and smart suggestions.
            </p>
            <div className="cs-card-features">
              <span>✨ 50+ Templates</span>
              <span>📄 ATS Optimized</span>
              <span>⚡ One-click Download</span>
            </div>
            <button onClick={() => navigate("/home")} className="cs-card-btn cs-btn-primary">
              <span>Build Your Resume</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="cs-card-shine"></div>
          </div>

          {/* Skill Gap Analyzer Card - Enhanced Coming Soon */}
          <div className="cs-feature-card cs-card-coming">
            <div className="cs-card-glow"></div>
            <div className="cs-card-top">
              <div className="cs-card-icon cs-icon-indigo">
                <div className="cs-icon-bg"></div>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M12 12V22" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="cs-card-badge cs-badge-soon">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                Coming Soon
              </div>
            </div>
            <h3 className="cs-card-title">Skill Gap Analyzer</h3>
            <p className="cs-card-text">
              Compare your skills with job roles and identify missing skills instantly. Get personalized learning recommendations.
            </p>
            <div className="cs-card-features">
              <span>🎯 Job Role Matching</span>
              <span>📊 Skill Assessment</span>
              <span>📚 Learning Paths</span>
            </div>
            
            {/* Enhanced Progress Section */}
            <div className="cs-progress-section">
              <div className="cs-progress-label">
                <span>Development Progress</span>
                <div className="cs-progress-percent">
                  <span className="percent-number">10%</span>
                  <div className="percent-wave"></div>
                </div>
              </div>
              <div className="cs-progress-bar">
                <div className="cs-progress-fill" style={{ width: "10%" }}>
                  <div className="progress-shine"></div>
                </div>
              </div>
            </div>
            
            <button className="cs-card-btn cs-btn-outline">
              <span>Notify Me</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8C20 8 22 10 22 12C22 15 18 18 12 18C6 18 2 15 2 12C2 10 4 8 6 8" strokeLinecap="round"/>
                <path d="M12 2V12M12 12L15 9M12 12L9 9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="cs-card-shine"></div>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="cs-floating-dots">
          <div className="cs-dot"></div>
          <div className="cs-dot"></div>
          <div className="cs-dot"></div>
          <div className="cs-dot"></div>
          <div className="cs-dot"></div>
        </div>
      </div>
    </div>
  );
}