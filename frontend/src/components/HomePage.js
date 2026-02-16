import React, { useEffect, useRef, useState } from 'react';
import './HomePage.css'; // Make sure the CSS file has the new class names

const HomePage = () => {
  const [skillScore, setSkillScore] = useState(0);
  const canvasRef = useRef(null);

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
const templates = [
  {
    name: 'Classic',
    nameText: 'DIYA AGARWAL',
    title: 'Customer‑Owned Retail Sales Professional with solid understanding of retail dynamics, marketing and customer service.',
    summary: 'Customer‑focused Retail Sales professional with solid understanding of retail dynamics, marketing and customer service. Offering 5 years of experience providing quality product recommendations and solutions to meet customer needs and exceed expectations. Demonstrated record of exceeding revenue targets by leveraging communication skills and sales expertise.',
    skills: [
      'Cash register operations',
      'POS system operation',
      'Sales expertise',
      'Teamwork',
      'Inventory management',
      'Accounts receivable',
      'Financial management'
    ],
    experience: [
      {
        company: 'ZARA - New Delhi, India',
        role: 'Retail Sales Associate',
        bullets: [
          'Increased monthly sales 10% by effectively upselling and cross-selling products to maximize profitability.',
          'Implemented store layouts by leveraging awareness, attention to detail, and insightfully interacting with customers.',
          'Processed payments and maintained accurate change drawers to meet financial targets.'
        ]
      },
      {
        company: 'Durban Outlets - New Delhi, India',
        role: 'Bistrita',
        bullets: [
          'Upward seasonal drifts and positives, boosting average store sales by +1500 units.',
          'Managed inventory levels to ensure optimal cash flow and increased customer satisfaction.',
          'Trained new staff on 15 business in new accounts program offerings and procedures.'
        ]
      }
    ],
    education: 'Diploma in Financial Accounting – Oxford Software Institute & Oxford School of English, New Delhi',
    languages: [
      { name: 'Hindi', level: 'Native speaker' },
      { name: 'English', level: 'Proficiency: 12, Fluency: 82' }
    ],
    badge: '⚡ Classic Template'
  },
  {
    name: 'Modern',
    nameText: 'DIYA AGARWAL',
    title: 'Customer‑Owned Retail Sales Professional',
    summary: 'Retail Sales professional with 5+ years of experience in customer service, sales, and inventory management. Proven track record of exceeding revenue targets and enhancing customer satisfaction.',
    skills: [
      'Cash register operation',
      'POS system',
      'Sales expertise',
      'Teamwork',
      'Inventory management',
      'Financial management'
    ],
    experience: [
      {
        company: 'ZARA, New Delhi',
        role: 'RETAIL SALES ASSOCIATE (02/2017 - Current)',
        bullets: [
          'Increased monthly sales 10% by upselling and cross-selling.',
          'Designed store layouts to improve customer flow and product visibility.',
          'Processed payments accurately and managed cash drawers.'
        ]
      },
      {
        company: 'Durban Outlets, New Delhi',
        role: 'BISTRITA (01/2017 - Current)',
        bullets: [
          'Boosted average store sales by 1500+ units through seasonal promotions.',
          'Maintained optimal inventory levels to ensure cash flow.',
          'Trained new staff on sales programs and procedures.'
        ]
      }
    ],
    education: 'Diploma in Financial Accounting – Oxford Software Institute, New Delhi',
    languages: [
      { name: 'Hindi', level: 'Native' },
      { name: 'English', level: 'Professional working proficiency' }
    ],
    badge: '✨ Modern Template'
  },
  {
    name: 'Professional',
    nameText: 'DIY AGARWAL',
    title: 'Retail Sales Professional',
    summary: 'Results‑driven Retail Sales Associate with 5 years of experience in fast‑paced environments. Expert in customer engagement, inventory control, and sales strategy.',
    skills: [
      'Cash handling',
      'POS systems',
      'Upselling',
      'Team leadership',
      'Inventory control',
      'Accounts receivable'
    ],
    experience: [
      {
        company: 'ZARA, New Delhi',
        role: 'Senior Sales Associate (2017–Present)',
        bullets: [
          'Achieved 10% monthly sales growth through strategic cross‑selling.',
          'Led store layout redesign, increasing foot traffic by 15%.',
          'Trained 5 new hires on sales techniques and company policies.'
        ]
      },
      {
        company: 'Durban Outlets, New Delhi',
        role: 'Sales Associate (2017–2019)',
        bullets: [
          'Recognized as top salesperson for 3 consecutive quarters.',
          'Reduced inventory shrinkage by 8% through diligent tracking.',
          'Assisted in launching new loyalty program.'
        ]
      }
    ],
    education: 'Diploma in Financial Accounting – Oxford Software Institute',
    languages: [
      { name: 'Hindi', level: 'Native' },
      { name: 'English', level: 'Fluent' }
    ],
    badge: '📊 Professional Template'
  }
];

const nextTemplate = () => {
  setCurrentTemplate((prev) => (prev + 1) % templates.length);
};

const prevTemplate = () => {
  setCurrentTemplate((prev) => (prev - 1 + templates.length) % templates.length);
};
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTemplate((prev) => (prev + 1) % templates.length);
  }, 4000); // change every 4 seconds

  return () => clearInterval(interval);
}, [templates.length]);
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
<section className="rb-hero">
  <div className="rb-hero-backdrop">
    <div className="rb-orb rb-orb-1"></div>
    <div className="rb-orb rb-orb-2"></div>
    <div className="rb-orb rb-orb-3"></div>
  </div>

  <div className="rb-container rb-hero-container">
    {/* Left Column – Text */}
    <div className="rb-hero-content">
      <div className="rb-hero-badge">
        <span className="rb-badge">✨ AI-Powered Resume Builder</span>
      </div>
      <h1 className="rb-gradient-text">
        Build Your <br />
        <span className="rb-typing-wrapper">
          <span className="rb-typing" id="typing"></span>
        </span>
      </h1>
      <p className="rb-hero-description">
        Create professional, ATS-friendly resumes with our intuitive builder.
        Choose from stunning templates, get AI assistance, and land your dream job.
      </p>
      <div className="rb-hero-buttons">
        <a href="/builder" className="rb-btn rb-btn-primary rb-btn-3d">
          Create Your Resume <span className="rb-btn-arrow">→</span>
        </a>
        <a href="/analyzer" className="rb-btn rb-btn-outline rb-btn-3d-outline">
          Analyze Skills
        </a>
      </div>
    </div>

    {/* Right Column – 3D Mockup with Profile Image & Auto‑rotate */}
<div className="rb-hero-mockup">
  <div className="rb-mockup-3d">
    <div className="rb-mockup-screen">
      <div className="rb-mockup-reflection"></div>

      {/* Resume Content with Profile Image */}
      <div className="rb-mockup-resume">
        {/* Header with image */}
        <div className="rb-resume-header with-image">
          <div className="rb-profile-image">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="Diya Agarwal"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.parentElement.classList.add('fallback');
              }}
            />
            <div className="rb-profile-fallback">DA</div>
          </div>
          <div className="rb-profile-info">
            <h3 className="rb-resume-name">{templates[currentTemplate].nameText}</h3>
            <p className="rb-resume-title">{templates[currentTemplate].title}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="rb-resume-section">
          <h4>Summary</h4>
          <p className="rb-resume-summary">{templates[currentTemplate].summary}</p>
        </div>

        {/* Skills */}
        <div className="rb-resume-section">
          <h4>Skills</h4>
          <div className="rb-skill-tags">
            {templates[currentTemplate].skills.map((skill, idx) => (
              <span key={idx}>{skill}</span>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="rb-resume-section">
          <h4>Experience</h4>
          {templates[currentTemplate].experience.map((job, idx) => (
            <div key={idx} className="rb-resume-job">
              <p className="rb-job-role">{job.role}</p>
              <p className="rb-job-company">{job.company}</p>
              <ul>
                {job.bullets.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Education */}
        <div className="rb-resume-section">
          <h4>Education</h4>
          <p className="rb-resume-edu">{templates[currentTemplate].education}</p>
        </div>

        {/* Languages */}
        <div className="rb-resume-section">
          <h4>Languages</h4>
          {templates[currentTemplate].languages.map((lang, idx) => (
            <p key={idx} className="rb-resume-lang">
              <strong>{lang.name}:</strong> {lang.level}
            </p>
          ))}
        </div>
      </div> {/* rb-mockup-resume */}
    </div> {/* rb-mockup-screen */}

    <div className="rb-mockup-glow"></div>
    <div className="rb-mockup-shadow"></div>
  </div> {/* rb-mockup-3d */}

  {/* Floating Badges */}
  <div className="rb-floating-badge">{templates[currentTemplate].badge}</div>
  <div className="rb-floating-badge second">🤖 ATS Score 98%</div>
  </div>
  </div>
</section>


      {/* Templates Section */}
      <section className="rb-templates">
        <div className="rb-container">
          <div className="rb-section-header">
            <h2>Professional Templates for Every Career</h2>
            <p>Choose from 10 beautifully designed templates, each optimized for readability and ATS compatibility.</p>
          </div>
          <div className="rb-template-showcase">
            <div className="rb-template-card-3d">
              <div className="rb-template-card-inner">
                <div className="rb-template-front classic">
                  <h4>Classic</h4>
                  <p>Timeless & elegant</p>
                </div>
                <div className="rb-template-back">
                  <span>Use Template →</span>
                </div>
              </div>
            </div>
            <div className="rb-template-card-3d">
              <div className="rb-template-card-inner">
                <div className="rb-template-front modern">
                  <h4>Modern</h4>
                  <p>Sleek & minimal</p>
                </div>
                <div className="rb-template-back">
                  <span>Use Template →</span>
                </div>
              </div>
            </div>
            <div className="rb-template-card-3d">
              <div className="rb-template-card-inner">
                <div className="rb-template-front professional">
                  <h4>Professional</h4>
                  <p>Executive & formal</p>
                </div>
                <div className="rb-template-back">
                  <span>Use Template →</span>
                </div>
              </div>
            </div>
            <div className="rb-template-card-3d">
              <div className="rb-template-card-inner">
                <div className="rb-template-front creative">
                  <h4>Creative</h4>
                  <p>Artistic & unique</p>
                </div>
                <div className="rb-template-back">
                  <span>Use Template →</span>
                </div>
              </div>
            </div>
            <div className="rb-template-card-3d">
              <div className="rb-template-card-inner">
                <div className="rb-template-front executive">
                  <h4>Executive</h4>
                  <p>High‑impact</p>
                </div>
                <div className="rb-template-back">
                  <span>Use Template →</span>
                </div>
              </div>
            </div>
          </div>
          <div className="rb-view-all">
            <a href="/templates" className="rb-animated-arrow">
              View All Templates <span>→</span>
            </a>
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