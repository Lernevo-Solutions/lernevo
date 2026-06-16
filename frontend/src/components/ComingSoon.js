import React from "react";
import { useNavigate } from "react-router-dom";
import "./ComingSoon.css";
import f1 from "./f1.png";
import f2 from "./f2.png";
import f3 from "./f3.png";
import f4 from "./f4.png";
import f5 from "./f5.png";
import f6 from "./f6.png";
import f7 from "./f7.png";
import f8 from "./f8.png";
export default function ComingSoon() {
  const navigate = useNavigate();

  const handleProtectedNavigation = (path, featureName) => {
    const token = localStorage.getItem("token");
    const isAuthenticated =
      token && token !== "undefined" && token !== "null" && token.trim() !== "";

    if (!isAuthenticated) {
      window.alert(`Please signup or login to access ${featureName}.`);
      navigate("/get-started?mode=login");
      return;
    }

    navigate(path);
  };

  return (
    <div className="cs-new-wrapper">
      {/* Enhanced White & Blue Background */}
      <div className="cs-bg-clean">
        <div className="cs-bg-shape-1"></div>
        <div className="cs-bg-shape-2"></div>
        <div className="cs-bg-shape-3"></div>
        <div className="cs-bg-grid"></div>
      </div>
      <div className="cs-side-ad cs-left-ad">
  <div className="cs-ad-track cs-move-down">
    <img src={f1} alt="banner" />
    <img src={f2} alt="banner" />
    <img src={f3} alt="banner" />
    <img src={f4} alt="banner" />
  </div>
</div>

<div className="cs-side-ad cs-right-ad">
  <div className="cs-ad-track cs-move-up">
    <img src={f5} alt="banner" />
    <img src={f6} alt="banner" />
    <img src={f7} alt="banner" />
    <img src={f8} alt="banner" />
  </div>
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

        <div className="cs-features-grid">
  <div className="cs-feature-card cs-card-coming">
    <div className="cs-card-glow"></div>

    <div className="cs-card-top">
      <div className="cs-card-icon cs-icon-indigo">
        <div className="cs-icon-bg"></div>

        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3"
            y="3"
            width="8"
            height="8"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="13"
            y="3"
            width="8"
            height="5"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="13"
            y="10"
            width="8"
            height="11"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="3"
            y="13"
            width="8"
            height="8"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="cs-card-badge cs-badge-soon">
        🚀 Coming Soon
      </div>
    </div>

    <h3 className="cs-card-title">Admin Dashboard</h3>

    <p className="cs-card-text">
      A powerful dashboard designed for administrators to manage users,
      monitor platform activity, track analytics, and gain valuable
      insights from one centralized workspace.
    </p>

    <div className="cs-card-features">
      <span>👥 User Management</span>
      <span>📊 Analytics & Reports</span>
      <span>🛡️ Role-Based Access</span>
      <span>📈 Real-Time Insights</span>
      <span>⚡ Activity Monitoring</span>
    </div>

    <div className="cs-progress-section">
      <div className="cs-progress-label">
  <span>Current Status</span>
  <span className="percent-number">Planning Phase</span>
</div>

      <div className="cs-progress-bar">
        <div
          className="cs-progress-fill"
          style={{ width: "85%" }}
        >
          <div className="progress-shine"></div>
        </div>
      </div>
    </div>

    <button className="cs-card-btn cs-btn-outline">
      <span>Launching Soon</span>
    </button>

    <div className="cs-card-shine"></div>
  </div>
</div>
       
      </div>
    </div>
  );
}
