import React from "react";
import "./Blog.css";

const Blog = () => {

  const handleClick = () => {
    alert("Full blog coming soon 🚀");
  };

  return (
    <div className="blog-wrapper">
      <div className="blog-single">

        {/* Header */}
        <div className="blog-header">
          <div className="brand-icon">
            <i className="fas fa-brain"></i>
          </div>
          <div className="title-section">
            <h1>Lernevo · Compass</h1>
            <div className="tagline">
              <i className="fas fa-venus"></i> female-first AI companion · holistic health
            </div>
          </div>
        </div>

        {/* Insight Banner */}
        <div className="insight-banner">
          <div className="insight-item">
            <i className="fas fa-rocket"></i>
            <span>mission control <small>single source of truth</small></span>
          </div>

          <div className="insight-item">
            <i className="fas fa-heart-pulse"></i>
            <span>body · mind · growth <small>holistic AI</small></span>
          </div>

          <div className="insight-item">
            <i className="fas fa-shield"></i>
            <span>human-in-the-loop <small>certified trainers</small></span>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="blog-grid">

          <div className="post-card">
            <span className="card-category">AI COMPANION</span>
            <h3>
              <i className="fas fa-robot"></i> One AI, whole health
            </h3>
            <p>
              Integrates learning, fitness, nutrition & mental health
              with real-time personalization.
            </p>
            <div className="post-meta">
              <span><i className="fas fa-database"></i> 360° view</span>
              <button onClick={handleClick} className="read-link">
                insight <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <div className="post-card">
            <span className="card-category">TRAINER COACHING</span>
            <h3>
              <i className="fas fa-user-check"></i> Expert guidance
            </h3>
            <p>
              Certified coaches use real-time wearable data
              to personalize your plans securely.
            </p>
            <div className="post-meta">
              <span><i className="fas fa-lock"></i> secure</span>
              <button onClick={handleClick} className="read-link">
                realtime <i className="fas fa-chart-line"></i>
              </button>
            </div>
          </div>

          <div className="post-card">
            <span className="card-category">HEALTH DASHBOARD</span>
            <h3>
              <i className="fas fa-chart-pie"></i> Unified wellbeing
            </h3>
            <p>
              Nutrition, sleep, mood & workouts —
              all in one powerful dashboard.
            </p>
            <div className="post-meta">
              <span><i className="fas fa-clock"></i> daily insights</span>
              <button onClick={handleClick} className="read-link">
                overview <i className="fas fa-eye"></i>
              </button>
            </div>
          </div>

          <div className="post-card">
            <span className="card-category">ACCOUNTABILITY</span>
            <h3>
              <i className="fas fa-trophy"></i> Groups & challenges
            </h3>
            <p>
              Community challenges with certified experts
              guiding every milestone.
            </p>
            <div className="post-meta">
              <span><i className="fas fa-gem"></i> female-first</span>
              <button onClick={handleClick} className="read-link">
                copilot <i className="fas fa-hand-holding-heart"></i>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Pillars */}
        <div className="pillar-row">
          <div className="pillar">
            <i className="fas fa-circle-check"></i> <strong>Holistic</strong>
          </div>
          <div className="pillar">
            <i className="fas fa-message"></i> <strong>Direct Coach</strong>
          </div>
          <div className="pillar">
            <i className="fas fa-chart-simple"></i> <strong>Metrics</strong>
          </div>
          <div className="pillar">
            <i className="fas fa-hand"></i> <strong>Human-in-loop</strong>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Blog;