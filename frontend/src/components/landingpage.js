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
import heroBg from "./image.png";
import StepCard from './StepCard';

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
            Seamlessly integrate fitness, nutrition, mental health and sleep
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

     {/* ========== How It Works Section ========== */}
<section id="about" className="how-it-works-section">
  <div className="container">
    {/* Header */}
    <div className="section-header">
      <h2 className="section-title">How Lernevo Works</h2>
      <p className="section-subtitle">
        Start your wellness journey in four simple steps
      </p>
    </div>

    {/* Steps Grid */}
    <div className="steps-grid">
      {[
        {
          number: '01',
          icon: '📝',
          title: 'Sign Up & Assessment',
          desc: 'Create your account and complete our wellness questionnaire. Share your goals, preferences, and lifestyle.',
        },
        {
          number: '02',
          icon: '🤖',
          title: 'AI Analysis',
          desc: 'Our AI analyzes your input and generates a personalized wellness plan tailored to your needs.',
        },
        {
          number: '03',
          icon: '🎯',
          title: 'Daily Guidance',
          desc: 'Get daily tasks, workouts, meal suggestions, and mindfulness exercises. Plan adjusts with your progress.',
        },
        {
          number: '04',
          icon: '📈',
          title: 'Track & Improve',
          desc: 'Monitor your progress with analytics and reports. Celebrate milestones and see real transformation.',
        },
      ].map((step) => (
        <StepCard key={step.number} step={step} />
      ))}
    </div>

    {/* CTA Button */}
    <div className="cta-container">
      <button className="cta-btn" onClick={() => scrollToSection('services')}>
        Start Your Journey Today
        <span className="btn-subtext">Join 10,000+ happy users</span>
      </button>
    </div>
  </div>
</section>


      {/* ========== Transform CTA Section ========== */}
      <section className="transform-section">
        <div className="container">
          <div className="transform-content">
            <h2 className="transform-title">
              Ready to Transform Your <span className="highlight">Wellness Journey?</span>
            </h2>
            
            <p className="transform-subtitle">
              Join thousands who have discovered a healthier, happier life with Lernevo.<br />
              Start your 14-day free trial today – no credit card required.
            </p>
            
            <div className="transform-features">
              <div className="transform-feature">
                <div className="feature-check">✓</div>
                <span>Personalized AI Coach</span>
              </div>
              <div className="transform-feature">
                <div className="feature-check">✓</div>
                <span>24/7 Health Tracking</span>
              </div>
              <div className="transform-feature">
                <div className="feature-check">✓</div>
                <span>Expert Support</span>
              </div>
            </div>
            
            <div className="transform-actions">
              <button className="transform-btn primary" onClick={() => scrollToSection('services')}>
                <span className="btn-text">Start Free Trial</span>
                <span className="btn-sub">14 days • No credit card</span>
              </button>
              
              <button className="transform-btn secondary" onClick={() => alert('Demo video coming soon!')}>
                <span className="btn-icon">▶</span>
                <span className="btn-text">Watch Demo</span>
              </button>
            </div>
            
            <div className="trust-badges">
              <div className="trust-badge">
                <div className="badge-icon">🔒</div>
                <span>Secure & Private</span>
              </div>
              <div className="trust-badge">
                <div className="badge-icon">⭐</div>
                <span>4.9/5 Rating</span>
              </div>
              <div className="trust-badge">
                <div className="badge-icon">👥</div>
                <span>10K+ Users</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Footer ========== */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <span className="logo-icon">🧠</span>
                <span className="logo-text">LERNEVO</span>
              </div>
              <p className="footer-tagline">
                Your AI-powered wellness companion for holistic health and fitness.
                Transform your life with personalized guidance.
              </p>
              
              <div className="newsletter-section">
                <h3 className="newsletter-title">Stay Updated</h3>
                <div className="newsletter-form">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="newsletter-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button className="newsletter-btn" onClick={handleSubscribe}>
                    Subscribe
                  </button>
                </div>
                <p className="newsletter-note">
                  Join our newsletter for wellness tips, updates, and exclusive offers.
                </p>
              </div>

              <div className="social-icons">
                <a href="#" className="social-icon" aria-label="Twitter">
                  𝕏
                </a>
                <a href="#" className="social-icon" aria-label="Facebook">
                  f
                </a>
                <a href="#" className="social-icon" aria-label="Instagram">
                  ig
                </a>
                <a href="#" className="social-icon" aria-label="LinkedIn">
                  in
                </a>
                <a href="#" className="social-icon" aria-label="YouTube">
                  ▶
                </a>
              </div>
            </div>

            <div className="footer-links">
              <div className="link-column">
                <h4 className="column-title">Product</h4>
                <a href="#" className="footer-link" onClick={() => scrollToSection('services')}>
                  AI Coaching
                </a>
                <a href="#" className="footer-link" onClick={() => scrollToSection('services')}>
                  Mental Health
                </a>
                <a href="#" className="footer-link" onClick={() => scrollToSection('services')}>
                  Fitness Programs
                </a>
                <a href="#" className="footer-link" onClick={() => scrollToSection('services')}>
                  Nutrition Plans
                </a>
                <a href="#" className="footer-link" onClick={() => scrollToSection('services')}>
                  Sleep Tracking
                </a>
              </div>

              <div className="link-column">
                <h4 className="column-title">Company</h4>
                <a href="#" className="footer-link" onClick={() => scrollToSection('about')}>
                  About Us
                </a>
                <a href="#" className="footer-link">
                  Careers
                </a>
                <a href="#" className="footer-link">
                  Blog
                </a>
                <a href="#" className="footer-link">
                  Press
                </a>
                <a href="#" className="footer-link">
                  Contact Us
                </a>
              </div>

              <div className="link-column">
                <h4 className="column-title">Support</h4>
                <a href="#" className="footer-link" onClick={() => scrollToSection('performance')}>
                  Dashboard
                </a>
                <a href="#" className="footer-link">
                  Help Center
                </a>
                <a href="#" className="footer-link">
                  Privacy Policy
                </a>
                <a href="#" className="footer-link">
                  Terms of Service
                </a>
                <a href="#" className="footer-link">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>

          <div className="footer-features">
            <div className="footer-feature">
              <div className="footer-feature-icon">🔒</div>
              <div className="footer-feature-text">
                <h4>Secure & Private</h4>
                <p>Bank-level encryption</p>
              </div>
            </div>
            <div className="footer-feature">
              <div className="footer-feature-icon">📱</div>
              <div className="footer-feature-text">
                <h4>Multi-Platform</h4>
                <p>iOS, Android & Web</p>
              </div>
            </div>
            <div className="footer-feature">
              <div className="footer-feature-icon">🤝</div>
              <div className="footer-feature-text">
                <h4>24/7 Support</h4>
                <p>Always here to help</p>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="copyright">
              © {new Date().getFullYear()} Lernevo Solutions. All rights reserved.
              <br />
              <a href="#">Privacy Policy</a> • <a href="#">Terms of Service</a>
            </p>
            <div className="legal-links">
              <a href="#" className="legal-link">Accessibility</a>
              <a href="#" className="legal-link">Cookie Settings</a>
              <a href="#" className="legal-link">Sitemap</a>
              <a href="#" className="legal-link">Status</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;