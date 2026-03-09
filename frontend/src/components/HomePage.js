import React, { useEffect, useRef, useState } from 'react';
import './HomePage.css'; // Make sure the CSS file has the new class names
import { Link } from 'react-router-dom';
const HomePage = () => {
  const [skillScore, setSkillScore] = useState(0);
  const canvasRef = useRef(null);
  const [counts, setCounts] = useState({ resumes: 0, satisfaction: 0, ats: 0 });
const statsRef = useRef(null);
const mockupRef = useRef(null);
  // Animated background particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2.5 + 0.5,
      vx: Math.random() * 0.2 - 0.1,
      vy: Math.random() * 0.2 - 0.1,
      color: `rgba(37,99,235,${Math.random() * 0.2})`,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };
    animate();

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Simulate skill score animation on hover
  const handleAnalyzeHover = () => {
    let start = 0;
    const interval = setInterval(() => {
      if (start >= 85) {
        clearInterval(interval);
        setSkillScore(85);
      } else {
        start += 1;
        setSkillScore(start);
      }
    }, 10);
  };
const [currentTemplate, setCurrentTemplate] = useState(0);
const allTemplates = [
  {
    name: 'Classic',
    nameText: 'DIYA AGARWAL',
    title: 'Customer‑Owned Retail Sales Professional',
    summary: 'Customer‑focused Retail Sales professional with solid understanding of retail dynamics...',
    skills: ['Cash register', 'POS', 'Sales', 'Teamwork', 'Inventory'],
    experience: ['2 years at XYZ Retail as Sales Associate', '3 years at ABC Store as Cashier'],
    education: 'Diploma in Financial Accounting',
    languages: [/* ... */],
    badge: '⚡ Classic Template',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    name: 'Modern',
    nameText: 'DIYA AGARWAL',
    title: 'Customer‑Owned Retail Sales Professional',
    summary: 'Retail Sales professional with 5+ years of experience...',
    skills: ['Cash register', 'POS', 'Sales', 'Teamwork', 'Inventory'],
    experience: [/* ... */],
    education: 'Diploma in Financial Accounting',
    languages: [/* ... */],
    badge: '✨ Modern Template',
    profileImage: 'https://randomuser.me/api/portraits/women/45.jpg'
  },
  {
    name: 'Professional',
    nameText: 'DIY AGARWAL',
    title: 'Retail Sales Professional',
    summary: 'Results‑driven Retail Sales Associate with 5 years of experience...',
    skills: ['Cash handling', 'POS', 'Upselling', 'Team leadership'],
    experience: [/* ... */],
    education: 'Diploma in Financial Accounting',
    languages: [/* ... */],
    badge: '📊 Professional Template',
    profileImage: 'https://randomuser.me/api/portraits/women/46.jpg'
  },
  {
    name: 'Executive',
    nameText: 'ALEX JOHNSON',
    title: 'Senior Business Executive',
    summary: 'Strategic leader with 15+ years of experience in operations and business development.',
    skills: ['Leadership', 'Strategy', 'P&L Management', 'Team Building'],
    experience: [
      {
        company: 'Global Corp',
        role: 'VP of Operations',
        bullets: ['Increased revenue by 30%', 'Led team of 50+']
      }
    ],
    education: 'MBA, Harvard Business School',
    languages: [],
    badge: '🌟 Executive Template',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg'
  }
];

const nextTemplate = () => {
  setCurrentTemplate((prev) => (prev + 1) % allTemplates.length);
};

const prevTemplate = () => {
  setCurrentTemplate((prev) => (prev - 1 + allTemplates.length) % allTemplates.length);
};
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTemplate((prev) => (prev + 1) % allTemplates.length);
  }, 4000); // change every 4 seconds

  return () => clearInterval(interval);
}, [allTemplates.length]);
  return (
    <>
      {/* Particle Canvas */}
   <canvas ref={canvasRef} className="rb-particle-canvas"></canvas>

{/* Gradient Mesh Overlay */}
<div className="rb-mesh-overlay"></div>

{/* Navigation */}
<nav className="rb-navbar">
  <div className="rb-container rb-nav-container">
    <div className="rb-logo">
      <div className="rb-logo-3d">
        <span className="rb-logo-icon">📄✨</span>
      </div>
      <div className="rb-logo-text">
        <span className="rb-logo-main">ResumeBuilder</span>
        <span className="rb-logo-sub">AI-Powered Resume Builder</span>
      </div>
    </div>
    <div className="rb-nav-links">
      <a href="/">Home</a>
      <a href="/my-resumes">My Resumes</a>
      <a href="/builder">Create Resume</a>
      <a href="/analyzer">Skill Analyzer</a>
    </div>
    <div className="rb-nav-cta">
      <a href="/builder" className="rb-btn-glow">Get Started</a>
    </div>
  </div>
</nav>

{/* Hero Section */}
{/* Hero Section */}
<section className="rb-hero">
  <div className="rb-hero-backdrop">
    <div className="rb-orb rb-orb-1"></div>
    <div className="rb-orb rb-orb-2"></div>
    <div className="rb-orb rb-orb-3"></div>
  </div>

  <div className="rb-container rb-hero-container">
    {/* Left Column – Text */}
    <div className="rb-hero-content">
    

      <h1 className="rb-gradient-text">
        Build a free resume <br />in a few clicks
      </h1>

      <p className="rb-hero-description">
        The first step to a better job? A better resume. Only 2% of resumes win, and yours will be one of them. Create it now with our free resume builder!
      </p>

      <div className="rb-hero-buttons">
        <a href="/builder" className="rb-btn rb-btn-primary rb-btn-3d">
          Create a New Resume <span className="rb-btn-arrow">→</span>
        </a>
        <a href="/improve" className="rb-btn rb-btn-outline rb-btn-3d-outline">
          Improve My Resume
        </a>
      </div>

    
    </div>

    {/* Right Column – Resume Mockup (Samantha Williams) */}
    <div className="rb-hero-mockup">
      <div className="rb-mockup-3d" ref={mockupRef}>
        <div className="rb-mockup-screen">
          <div className="rb-mockup-reflection"></div>
          <div className="rb-mockup-resume">
            {/* Header – no image, just text */}
            <div className="rb-resume-header">
              <h3 className="rb-resume-name">Samantha Williams</h3>
              <p className="rb-resume-title">Senior Analyst</p>
              <p className="rb-resume-location">New York, NY, 10001</p>
              <p className="rb-resume-email">samantha.william@example.com</p>
              <p className="rb-resume-phone">(212) 789-1234</p>
            </div>

            {/* Summary */}
            <div className="rb-resume-section">
              <h4>SUMMARY</h4>
              <p className="rb-resume-summary">
                Senior Analyst with a 2+ year of experience in data analytics, business intelligence, and process improvement. Skilled in driving operational efficiency, forecasting, and leading data-driven strategies to improve business results and efficiencies.
              </p>
            </div>

            {/* Experience */}
            <div className="rb-resume-section">
              <h4>EXPERIENCE</h4>
              <div className="rb-resume-job">
                <p className="rb-job-role">Senior Analyst</p>
                <p className="rb-job-company">Los Angeles, CA - New York, NY</p>
                <p className="rb-job-description">
                  Lead Data Analyst for a global financial services firm. Led the development and implementation of a new data analysis platform that increased productivity by 50%. Achieved a 20% reduction in processing time.
                </p>
                <p className="rb-job-duties-label">Duties:</p>
                <ul>
                  <li>Develop and maintain data models and reports</li>
                  <li>Analyze data to identify trends and patterns</li>
                  <li>Work with stakeholders to understand business needs</li>
                  <li>Collaborate with cross-functional teams to implement solutions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="rb-mockup-glow"></div>
        <div className="rb-mockup-shadow"></div>
      </div>
    </div>
  </div>

  {/* Wave Divider */}
  <div className="rb-hero-wave">
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
      <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#ffffff" fillOpacity="0.8"></path>
    </svg>
  </div>
</section>
{/* Templates Section – Real Resume Previews with Photos */}
<section className="rb-template-grid-section">
  <div className="rb-container">
    <h2>Choose Your Real-World Template</h2>

    <div className="rb-template-grid">
      {allTemplates.map((template, index) => (
        <div className="rb-template-box-wrapper" key={index}>
          <div className="rb-resume-inner-preview">
            {/* Profile Image & Header */}
            <div className="rb-preview-header">
              <div className="rb-preview-image">
                <img
                  src={template.profileImage}
                  alt={template.nameText}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentElement.classList.add('fallback');
                  }}
                />
                <div className="rb-preview-fallback">
                  {template.nameText.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
              <div className="rb-preview-info">
                <h4>{template.nameText}</h4>
                <p>{template.title.substring(0, 40)}…</p>
              </div>
            </div>

            {/* Summary snippet */}
            <div className="rb-preview-summary">
              {template.summary.substring(0, 60)}…
            </div>

            {/* Skills tags (first 3) */}
            <div className="rb-preview-skills">
              {template.skills.slice(0, 3).map((skill, i) => (
                <span key={i}>{skill}</span>
              ))}
            </div>

            {/* Footer line */}
            <div className="rb-preview-footer">
              <span>⏤ Experience · Education</span>
            </div>
          </div>
          <div className="rb-template-label">
            <h3>{template.name} Template</h3>
          </div>
        </div>
      ))}
    </div>

    {/* View All Templates Link */}
    <div className="rb-view-all">
  <Link to="/templates" className="rb-animated-arrow">
    View All Templates <span>→</span>
  </Link>
</div>
  </div>
</section>
      {/* Features Section */}
      <section className="rb-features">
        <div className="rb-container">
          <div className="rb-section-header">
            <h2>Everything You Need to Stand Out</h2>
            <p>Our powerful features help you create resumes that get noticed by recruiters and pass ATS systems.</p>
          </div>
          <div className="rb-features-grid">
            <div className="rb-feature-card rb-glass rb-tilt">
              <div className="rb-feature-icon">📄</div>
              <h3>10+ Templates</h3>
              <p>Modern, creative, classic & executive designs for any industry.</p>
            </div>
            <div className="rb-feature-card rb-glass rb-tilt">
              <div className="rb-feature-icon">🤖</div>
              <h3>AI Content</h3>
              <p>Generate summaries, bullets & skills with intelligent AI.</p>
            </div>
            <div className="rb-feature-card rb-glass rb-tilt">
              <div className="rb-feature-icon">📊</div>
              <h3>Skill Gap Analysis</h3>
              <p>Compare resume vs JD to identify improvement areas.</p>
            </div>
            <div className="rb-feature-card rb-glass rb-tilt">
              <div className="rb-feature-icon">🎨</div>
              <h3>Full Customization</h3>
              <p>Personalize colors, fonts & layout to match your brand.</p>
            </div>
            <div className="rb-feature-card rb-glass rb-tilt">
              <div className="rb-feature-icon">📑</div>
              <h3>PDF Export</h3>
              <p>Perfectly formatted PDF ready for applications.</p>
            </div>
            <div className="rb-feature-card rb-glass rb-tilt">
              <div className="rb-feature-icon">👁️</div>
              <h3>Real-time Preview</h3>
              <p>See changes instantly as you build your resume.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Skill Analyzer */}
      <section className="rb-skill-analyzer">
        <div className="rb-container">
          <div className="rb-analyzer-card">
            <div className="rb-analyzer-left">
              <h3>AI Skill Gap Analyzer</h3>
              <p>Paste any job description and see how your resume matches in real time.</p>
              <div className="rb-analyzer-input-group">
                <input type="text" placeholder="Paste job description..." className="rb-analyzer-input" />
                <button className="rb-btn rb-btn-primary" onMouseEnter={handleAnalyzeHover}>
                  Analyze Match
                </button>
              </div>
              <div className="rb-analyzer-match">
                <span className="rb-match-title">Overall match</span>
                <div className="rb-match-bar-bg">
                  <div className="rb-match-bar-fill" style={{ width: `${skillScore}%` }}></div>
                </div>
                <span className="rb-match-percentage">{skillScore}%</span>
              </div>
              <p className="rb-analyzer-note">✨ AI identifies missing keywords & skills</p>
            </div>
            <div className="rb-analyzer-right">
              <div className="rb-circular-progress">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - skillScore / 100)}`}
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 1s' }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="rb-progress-text">{skillScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="rb-cta">
        <div className="rb-cta-particles"></div>
        <div className="rb-container">
          <h2>Ready to Build Your Perfect Resume?</h2>
          <p>Join thousands of job seekers who've landed their dream jobs with our resume builder.</p>
          <a href="/builder" className="rb-btn rb-cta-btn rb-btn-pulse">
            Start Building Now <span className="rb-btn-arrow">→</span>
          </a>
        </div>
      </section>
</>
  );
};

export default HomePage;