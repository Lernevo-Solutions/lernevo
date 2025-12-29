// src/components/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import './LandingPage.css';
import logo from './logo.png';
import aiImg from "./ai powerd.png";
import mentalImg from "./mental health.png";
import fitnessImg from "./fit.png";
import nutritionImg from "./nutrition.png";
import learningImg from "./learn.png";
import trainerImg from "./trainer.png";
import heroBg from "./back.png";
import learImg from "./sign.png";
import aiiImg from "./analyse.png";
import fitnesImg from "./guidance.png";
import trainersImg from "./imp.png";
import workImg from "./work.png";
import { FaHandsHelping } from "react-icons/fa";       // Understand User Needs
import { BiCpu } from "react-icons/bi"; // AI / computer processing
import { FaRobot } from "react-icons/fa"; // classic AI / robot icon
import { FaChalkboardTeacher } from "react-icons/fa";
import {  FaChartLine } from "react-icons/fa";
import { MdHealthAndSafety } from "react-icons/md";

import { FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState("daily");

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'performance', 'services', 'about'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing with ${email}! We'll contact you soon.`);
      setEmail('');
    }
  };

  return (
    <div className="lernevo-landing">
      {/* ========== Navigation ========== */}
      <nav className="navbar">
        <div className="container nav-container">
          <div className="logo-section">
            <div className="logo">
              <img src={logo} alt="Lernevo Logo" className="logo-icon" />
              <span className="logo-text">LERNEVO</span>
            </div>
          </div>

          <div className="nav-links">
            <button className={`nav-link ${activeSection === 'home' ? 'active' : ''}`} onClick={() => scrollToSection('home')}>Home</button>
            <button className={`nav-link ${activeSection === 'performance' ? 'active' : ''}`} onClick={() => scrollToSection('performance')}>Dashboard</button>
            <button className={`nav-link ${activeSection === 'services' ? 'active' : ''}`} onClick={() => scrollToSection('services')}>Services</button>
            <button className={`nav-link ${activeSection === 'about' ? 'active' : ''}`} onClick={() => scrollToSection('about')}>How It Works</button>
            <button className="login-btn" onClick={() => alert('Login feature coming soon!')}>Login</button>
          </div>

          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
          <button className="cta-btn primary-btn nav-cta" onClick={() => scrollToSection('services')}>Get Started</button>
        </div>

        {isMenuOpen && (
          <div className="mobile-menu">
            <button className="mobile-nav-link" onClick={() => scrollToSection('home')}>Home</button>
            <button className="mobile-nav-link" onClick={() => scrollToSection('performance')}>Dashboard</button>
            <button className="mobile-nav-link" onClick={() => scrollToSection('services')}>Services</button>
            <button className="mobile-nav-link" onClick={() => scrollToSection('about')}>How It Works</button>
            <button className="mobile-nav-link" onClick={() => alert('Login feature coming soon!')}>Login</button>
            <button className="cta-btn primary-btn" onClick={() => scrollToSection('services')}>Get Started</button>
          </div>
        )}
      </nav>

      {/* ========== Hero Section (Your AI Wellness Companion) ========== */}
      <section
      id="home"
      className="hero-section"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="hero-overlay"></div>

      <div className="container hero-container">

        {/* LEFT CONTENT */}
        <div className="hero-text-content">
          <h1 className="hero-main-title">
  <span className="highlight-text">Your AI Wellness Companion</span>
</h1>


          <p className="hero-description">
            Seamlessly integrate fitness, nutrition, mental health and Learning
            into your daily routine.
          </p>

          <button className="cta-btn primary-btn">
            Start Free Trial
          </button>
        </div>

        {/* RIGHT ORBIT */}
        <div className="hero-orbit-wrapper">
          <div className="orbit-circle">

            <img src={mentalImg} className="orbit-img i1" alt="Mental Health" />
            <img src={fitnessImg} className="orbit-img i2" alt="Fitness" />
            <img src={nutritionImg} className="orbit-img i3" alt="Nutrition" />
            <img src={learningImg} className="orbit-img i4" alt="Learning" />
            <img src={trainerImg} className="orbit-img i5" alt="Health" />

          </div>
        </div>

      </div>
    </section>


      {/* ========== Performance Dashboard Section (Moved Here) ========== */}
      <section id="performance" className="performance-dashboard-section">
      <div className="container">

        {/* Header */}
        <div className="section-header">
          <h2 className="section-title">Performance Dashboard</h2>
          <p className="section-subtitle">
            Monitor your daily, weekly & monthly wellness performance
          </p>
        </div>

        {/* Tabs */}
        <div className="performance-tabs">
          <button
            className={`tab-btn ${activeTab === "daily" ? "active" : ""}`}
            onClick={() => setActiveTab("daily")}
          >
            Daily
          </button>
          <button
            className={`tab-btn ${activeTab === "weekly" ? "active" : ""}`}
            onClick={() => setActiveTab("weekly")}
          >
            Weekly
          </button>
          <button
            className={`tab-btn ${activeTab === "monthly" ? "active" : ""}`}
            onClick={() => setActiveTab("monthly")}
          >
            Monthly
          </button>
          <button
            className={`tab-btn ${activeTab === "diary" ? "active" : ""}`}
            onClick={() => setActiveTab("diary")}
          >
            Progress Diary
          </button>
        </div>

        {/* ================= DAILY ================= */}
        {activeTab === "daily" && (
          <div className="performance-metrics-grid">

            {/* Workout */}
            <div className="metric-box">
              <h3>Workout Progress</h3>
              <div className="metric-value">45 min</div>
              <p>Calories Burned: <strong>420</strong></p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "85%" }} />
              </div>
              <span>Weekly Goal: 85%</span>
            </div>

            {/* Fitness */}
           

            {/* Nutrition */}
            <div className="metric-box">
              <h3>Nutrition</h3>
              <div className="metric-value">2150 / 2500 cal</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "86%" }} />
              </div>
              <p>Protein: 45g • Carbs: 250g • Fat: 65g</p>
            </div>

          
           {/* Learning Progress */}
<div className="metric-box">
  <h3>Learning Progress</h3>
  <div className="metric-value">78%</div>
  <p>Focus Time: 3h • Practice Time: 1h 15m</p>
  <p>AI Feedback: <strong>Excellent</strong></p>
</div>


          </div>
        )}

        {/* ================= WEEKLY ================= */}
        {activeTab === "weekly" && (
          <div className="summary-grid">
            <div className="summary-card">🏃 Workouts: <strong>5 days</strong></div>
            <div className="summary-card">🔥 Calories Burned: <strong>2,900</strong></div>
            <div className="summary-card">😴 Avg Sleep: <strong>7h 56m</strong></div>
            <div className="summary-card">📈 Progress: <strong>+12%</strong></div>
          </div>
        )}

        {/* ================= MONTHLY ================= */}
        {activeTab === "monthly" && (
          <div className="summary-grid">
            <div className="summary-card">💪 Workouts Completed: <strong>22</strong></div>
            <div className="summary-card">🥗 Nutrition Adherence: <strong>88%</strong></div>
            <div className="summary-card">😴 Sleep Consistency: <strong>85%</strong></div>
            <div className="summary-card">🏆 Achievements: <strong>6 Badges</strong></div>
          </div>
        )}

        {/* ================= PROGRESS DIARY ================= */}
        {activeTab === "diary" && (
          <div className="progress-diary">
            <h3>Your Progress Diary</h3>

            <div className="diary-entry">
              <span className="diary-date">Today</span>
              <p>💪 45 min workout • 🥗 Calories on track • 😴 Slept 8h 42m</p>
            </div>

            <div className="diary-entry">
              <span className="diary-date">Yesterday</span>
              <p>🧠 Stress level low • 🏃 Cardio session completed</p>
            </div>

            <div className="diary-entry">
              <span className="diary-date">2 Days Ago</span>
              <p>🥗 Clean eating day • 😴 Early bedtime</p>
            </div>
          </div>
        )}

      </div>
    </section>
      {/* ========== Services Section ========== */}
      <section id="services" className="services-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Wellness Services</h2>
            <p className="section-subtitle">Comprehensive wellness solutions tailored to your needs</p>
          </div>

          <div className="services-grid">
                    <div className="service-card">

  <div className="service-image-box">
    <img src={nutritionImg} alt="Nutrition Planning" />
  </div>

  <h3 className="service-title">Nutrition Planning</h3>
  <p className="service-description">
    Custom meal plans and dietary guidance based on your goals.
  </p>
  <ul className="service-features">
    <li>Personalized meal plans</li>
    <li>Calorie tracking</li>
    <li>Recipe suggestions</li>
    <li>Grocery lists</li>
  </ul>

</div>
           <div className="service-card">

  <div className="service-image-box">
    <img src={aiImg} alt="AI Powered Coaching" />
  </div>

  <h3 className="service-title">AI-Powered Coaching</h3>

  <p className="service-description">
    Personalized recommendations that adapt to your progress and goals in real-time.
  </p>

  <ul className="service-features">
    <li>Daily wellness check-ins</li>
    <li>Adaptive workout plans</li>
    <li>Nutrition guidance</li>
    <li>Progress tracking</li>
  </ul>

</div>
 <div className="service-card">

  <div className="service-image-box">
    <img src={fitnessImg} alt="Fitness Programs" />
  </div>

  <h3 className="service-title">Fitness Programs</h3>
  <p className="service-description">
    Custom workout routines for all fitness levels and goals.
  </p>
  <ul className="service-features">
    <li>Personalized workout plans</li>
    <li>Video demonstrations</li>
    <li>Progress analytics</li>
    <li>Form correction</li>
  </ul>

</div>
<div className="service-card">

  <div className="service-image-box">
    <img src={learningImg} alt="Learning" />
  </div>

  <h3 className="service-title">Learning</h3>
  <p className="service-description">
    Enhance your skills with AI-powered personalized learning.
  </p>

  <ul className="service-features">
    <li>Personalized learning paths</li>
    <li>Skill progress tracking</li>
    <li>Daily learning reminders</li>
    <li>AI-based improvement suggestions</li>
  </ul>

</div>

          <div className="service-card">

  <div className="service-image-box">
    <img src={mentalImg} alt="Mental Health" />
  </div>

  <h3 className="service-title">Mental Health Support</h3>
  <p className="service-description">
    Comprehensive mental wellness programs and emotional support.
  </p>
  <ul className="service-features">
    <li>Mindfulness meditation</li>
    <li>Stress management</li>
    <li>Sleep optimization</li>
    <li>Mood tracking</li>
  </ul>

</div>     

          <div className="service-card">

  <div className="service-image-box">
    <img src={trainerImg} alt="Trainer & Coach" />
  </div>

  <h3 className="service-title">Trainer & Coach</h3>
  <p className="service-description">
    Get guidance from AI-powered trainers and expert coaches.
  </p>

  <ul className="service-features">
    <li>Personalized coaching plans</li>
    <li>Daily workout guidance</li>
    <li>Motivation & accountability</li>
    <li>Progress tracking</li>
  </ul>

</div>

          </div>
        </div>
      </section>

    {/* ========== How Lernevo Works (Image Style Layout) ========== */}
<section id="about" className="how-lernevo-works">
  <div className="container how-works-wrapper">

    {/* LEFT CONTENT */}
    <div className="how-works-left">
      <h2>How Lernevo Works</h2>
      <p className="how-desc">
        Lernevo combines AI intelligence with human expertise to guide you
        through a personalized wellness journey — body, mind, and lifestyle.
      </p>

      <p className="how-desc">
        From assessment to daily guidance and progress tracking, everything
        is designed to help you improve consistently and sustainably.
      </p>
    </div>

    {/* RIGHT IMAGE */}
    <div className="how-works-right">
      <img src={workImg} alt="Lernevo Team" />
    </div>

  </div>

  {/* BOTTOM CARDS */}
  <div className="container how-works-cards">

  <div className="how-card">
    <div className="icon">
      <FaHandsHelping size={80} color="#FF6B6B" /> {/* reddish */}
    </div>
    <h4>Understand User Needs</h4>
    <p>We carefully assess your personal goals, lifestyle habits, and wellness preferences to create a fully personalized and actionable plan that suits your daily routine.</p>
  </div>

  <div className="how-card">
    <div className="icon">
      <FaRobot size={80} color="#4ECDC4" />  {/* teal AI icon */}
    </div>
    <h4>AI-Powered Insights</h4>
    <p>Our advanced AI system analyzes your data to provide intelligent insights and recommendations, combining technology with expert human guidance for maximum results.</p>
  </div>

  <div className="how-card">
    <div className="icon">
      <FaChalkboardTeacher size={60} color="#FFD93D" /> {/* bright yellow, teaching/guidance */}
    </div>
    <h4>Deliver Guidance</h4>
    <p>We provide step-by-step guidance every day, including workouts, mindfulness exercises, nutrition plans, and learning tips to help you stay on track and achieve your wellness goals.</p>
  </div>

  <div className="how-card">
    <div className="icon">
      <FaChartLine size={80} color="#6A4C93" /> {/* purple progress icon */}
    </div>
    <h4>Track & Improve</h4>
    <p>Continuous monitoring and feedback allow you to track your progress, celebrate milestones, and make adjustments along the way, ensuring sustainable and effective improvement.</p>
  </div>




  </div>
</section>




     
    {/* ========== Transform CTA – PILL STRIP STYLE ========== */}
<section className="transform-pill-section">
  <div className="container">

    <div className="pill-header">
      <h2>
        Ready to <span>Elevate Your Wellness?</span>
      </h2>
      <p>
        Simple habits. Smart guidance. Real progress.
      </p>
    </div>

    {/* PILL STRIPS */}
    <div className="pill-row">
      <div className="pill-item">🤖 Personalized AI Coach</div>
      <div className="pill-item">📊 24/7 Health Tracking</div>
      <div className="pill-item">🧠 Expert-Backed Insights</div>
    </div>

    <div className="transform-actions">
  <button
    className="trial-btn"
    onClick={() => scrollToSection('services')}
  >
    Start Your Free Trial
  </button>
</div>


  </div>
</section>




    <footer className="footer-new">
  <div className="container">

    {/* TOP SECTION */}
    <div className="footer-top">

      {/* BRAND */}
      <div className="footer-brand">
        <div className="footer-logo">
          <img src={logo} alt="Lernevo Logo" className="footer-logo-img" />
          <span className="logo-text">LERNEVO</span>
        </div>

        <p className="footer-desc">
          Your AI-powered wellness companion helping you build
          healthier habits across body, mind, and lifestyle.
        </p>

    <div className="footer-social">
  <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
    <FaTwitter />
  </a>
  <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
    <FaInstagram />
  </a>
  <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
    <FaLinkedin />
  </a>
  <a href="https://youtube.com" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
    <FaYoutube />
  </a>
</div>

      </div>

      {/* LINKS */}
      <div className="footer-links">

        <div className="link-col">
          <h4>Product</h4>
          <a onClick={() => scrollToSection('services')}>AI Coaching</a>
          <a onClick={() => scrollToSection('services')}>Fitness</a>
          <a onClick={() => scrollToSection('services')}>Mental Wellness</a>
          <a onClick={() => scrollToSection('services')}>Nutrition</a>
        </div>

        <div className="link-col">
          <h4>Company</h4>
          <a onClick={() => scrollToSection('about')}>About</a>
          <a href="#">Careers</a>
          <a href="#">Blog</a>
          <a href="#">Contact</a>
        </div>

        <div className="link-col">
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>

      </div>
    </div>

    {/* BOTTOM */}
    <div className="footer-bottom">
      <p>
        © {new Date().getFullYear()} Lernevo Solutions. All rights reserved.
      </p>
    </div>

  </div>
</footer>
    </div>
  );
};

export default LandingPage;