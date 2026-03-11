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

const homeTemplates = [
  {
    id: 1,
    name: "Sidebar Left",
    structure: "sidebar-left",
    photo: true,
    contact: true
  },
  {
    id: 2,
    name: "Minimal",
    structure: "minimal-no-photo",
    photo: false,
    contact: true
  },
  {
    id: 3,
    name: "Executive Grid",
    structure: "executive-grid",
    photo: true,
    contact: true
  },
  {
    id: 4,
    name: "Header Bold",
    structure: "header-bg",
    photo: false,
    contact: true
  }
];
// Updated tnProfile (place this inside your HomePage component, replacing the old one)
const tnProfile = {
  name: "M. SENTHIL KUMAR",
  title: "Senior Software Engineer",
  summary: "Dedicated professional from Chennai with 7+ years of experience in Zoho and Freshworks. Specialized in building scalable web applications and cloud-based solutions for the Tamil Nadu tech industry.",
  contact: {
    phone: "+91 98745 61230",
    email: "senthil.kumar@email.com",
    location: "Chennai, Tamil Nadu, India"
  },
  skills: [
    "React.js", "Node.js", "JavaScript", "Cloud Technologies",
    "REST API Development", "Microservices", "Team Management"
  ],
  experience: [
    {
      role: "Lead Developer",
      company: "Zoho Corporation",
      period: "2019 - Present",
      description: "Leading a team of developers to build enterprise SaaS products, improving performance and scalability for global customers."
    },
    {
      role: "Software Engineer",
      company: "Freshworks",
      period: "2017 - 2019",
      description: "Developed customer support automation tools and integrated REST APIs for CRM systems."
    }
  ]
};
// HomePage.js-la tnProfile-ku keela idha podunga
const renderHomePreview = (tpl) => {
  const primary = "#2563eb";
  const photoUrl = "https://randomuser.me/api/portraits/men/32.jpg"

  const data = {
    name: tnProfile.name,
    title: tnProfile.title,
    summary: tnProfile.summary,
    phone: tnProfile.contact.phone,
    email: tnProfile.contact.email,
    location: tnProfile.contact.location,
    skills: tnProfile.skills,
    experience: tnProfile.experience,
  };

  // ----- 1. SIDEBAR LEFT (Classic, matches your image) -----
  if (tpl.structure === "sidebar-left") {
    return (
      <div style={{ display: "flex", height: "100%", background: "#fff", fontFamily: "Inter, sans-serif", borderRadius: "12px", overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: "35%", background: "#1e293b", color: "#fff", padding: "16px 12px", display: "flex", flexDirection: "column" }}>
          <img src={photoUrl} alt="" style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "3px solid #fff", margin: "0 auto 16px" }} />
          <div style={{ fontSize: "10px" }}>
            <p style={{ fontWeight: "700", margin: "0 0 6px", borderBottom: "1px solid #475569", paddingBottom: "2px" }}>CONTACT</p>
            <p style={{ margin: "4px 0" }}>{data.phone}</p>
            <p style={{ margin: "4px 0", wordBreak: "break-word" }}>{data.email}</p>
            <p style={{ margin: "4px 0" }}>{data.location}</p>
          </div>
          <div style={{ marginTop: "16px", fontSize: "10px" }}>
            <p style={{ fontWeight: "700", margin: "0 0 6px", borderBottom: "1px solid #475569", paddingBottom: "2px" }}>SKILLS</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {data.skills.map(s => (
                <span key={s} style={{ background: "#334155", padding: "2px 6px", borderRadius: "4px", fontSize: "8px" }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
        {/* Main */}
        <div style={{ flex: 1, padding: "16px", textAlign: "left", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 2px", color: "#0f172a" }}>{data.name}</h3>
          <p style={{ fontSize: "12px", color: primary, fontWeight: "600", margin: "0 0 12px" }}>{data.title}</p>

          <div style={{ marginBottom: "12px" }}>
            <p style={{ fontSize: "10px", fontWeight: "700", color: primary, margin: "0 0 4px", textTransform: "uppercase" }}>SUMMARY</p>
            <p style={{ fontSize: "10px", color: "#334155", lineHeight: "1.5", margin: "0" }}>{data.summary}</p>
          </div>

          <div>
            <p style={{ fontSize: "10px", fontWeight: "700", color: primary, margin: "0 0 6px", textTransform: "uppercase" }}>EXPERIENCE</p>
            {data.experience.map((exp, idx) => (
              <div key={idx} style={{ marginBottom: "12px" }}>
                <p style={{ fontSize: "11px", fontWeight: "700", margin: "0" }}>{exp.role} – {exp.company}</p>
                <p style={{ fontSize: "8px", color: "#64748b", margin: "2px 0 4px" }}>{exp.period}</p>
                <p style={{ fontSize: "9px", color: "#334155", margin: "0", lineHeight: "1.4" }}>{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ----- 2. MINIMAL (Clean, no photo) -----
  if (tpl.structure === "minimal-no-photo") {
    return (
      <div style={{ height: "100%", background: "#fff", padding: "20px", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 4px", color: "#0f172a", letterSpacing: "-0.5px" }}>{data.name}</h3>
        <p style={{ fontSize: "11px", color: primary, fontWeight: "600", margin: "0 0 8px" }}>{data.title}</p>
        <p style={{ fontSize: "9px", color: "#64748b", margin: "0 0 16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
          {data.email} | {data.phone}
        </p>
        <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", borderLeft: `3px solid ${primary}`, marginBottom: "16px", textAlign: "left" }}>
          <p style={{ fontSize: "9px", fontWeight: "700", color: primary, margin: "0 0 6px", textTransform: "uppercase" }}>Experience</p>
          <p style={{ fontSize: "10px", fontWeight: "600", margin: "0" }}>Lead Developer – Zoho Corporation</p>
          <p style={{ fontSize: "8px", color: "#94a3b8", margin: "2px 0 0" }}>2019 – present</p>
          <p style={{ fontSize: "9px", color: "#334155", marginTop: "6px" }}>{data.experience[0].description.substring(0, 60)}…</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "auto" }}>
          {data.skills.slice(0, 4).map(s => (
            <span key={s} style={{ fontSize: "8px", background: "#eef2ff", color: primary, padding: "4px 10px", borderRadius: "20px", fontWeight: "600" }}>{s}</span>
          ))}
        </div>
      </div>
    );
  }

  // ----- 3. EXECUTIVE GRID (Structured) -----
  if (tpl.structure === "executive-grid") {
    return (
      <div style={{ height: "100%", background: "#fff", display: "grid", gridTemplateColumns: "1fr 2fr", fontFamily: "Inter, sans-serif", borderRadius: "12px", overflow: "hidden" }}>
        {/* Left column – skills & photo */}
        <div style={{ background: "#f1f5f9", padding: "16px 10px", textAlign: "left", borderRight: "1px solid #e2e8f0" }}>
          <img src={photoUrl} alt="" style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", border: `2px solid ${primary}`, marginBottom: "12px" }} />
          <p style={{ fontSize: "9px", fontWeight: "700", color: primary, margin: "0 0 8px", textTransform: "uppercase" }}>Skills</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {data.skills.map(s => (
              <div key={s} style={{ fontSize: "9px", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "6px", height: "6px", background: primary, borderRadius: "50%" }}></span> {s}
              </div>
            ))}
          </div>
        </div>
        {/* Right column – main info */}
        <div style={{ padding: "16px", textAlign: "left" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 2px", color: "#0f172a" }}>{data.name}</h3>
          <p style={{ fontSize: "10px", color: primary, fontWeight: "600", margin: "0 0 8px" }}>{data.title}</p>
          <p style={{ fontSize: "9px", color: "#334155", lineHeight: "1.5", margin: "0 0 12px" }}>
            <span style={{ fontWeight: "700" }}>Summary</span><br />{data.summary.substring(0, 100)}…
          </p>
          <div style={{ fontSize: "8px", color: "#64748b", borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
            <span>{data.phone}</span> · <span>{data.location}</span>
          </div>
        </div>
      </div>
    );
  }

  // ----- 4. HEADER BOLD (Colorful top bar) -----
  if (tpl.structure === "header-bg") {
    return (
      <div style={{ height: "100%", background: "#fff", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ background: primary, color: "#fff", padding: "18px 16px", textAlign: "left" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 2px" }}>{data.name}</h3>
          <p style={{ fontSize: "11px", opacity: "0.9", margin: "0" }}>{data.title}</p>
        </div>
        <div style={{ padding: "16px", textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#64748b", marginBottom: "16px", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
            <span>{data.phone}</span>
            <span>{data.email}</span>
          </div>
          <p style={{ fontSize: "9px", fontWeight: "700", color: primary, margin: "0 0 6px", textTransform: "uppercase" }}>Summary</p>
          <p style={{ fontSize: "9px", color: "#334155", lineHeight: "1.5", marginBottom: "12px" }}>{data.summary.substring(0, 130)}…</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "auto" }}>
            {data.skills.slice(0, 3).map(s => (
              <span key={s} style={{ fontSize: "7px", background: "#eef2ff", color: primary, padding: "2px 8px", borderRadius: "12px" }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
const nextTemplate = () => {
  setCurrentTemplate((prev) => (prev + 1) % homeTemplates.length);
};

const prevTemplate = () => {
  setCurrentTemplate((prev) => (prev - 1 + homeTemplates.length) % homeTemplates.length);
};
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTemplate((prev) => (prev + 1) % homeTemplates.length);
  }, 4000); // change every 4 seconds

  return () => clearInterval(interval);
}, [homeTemplates.length]);
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

{homeTemplates.map((tpl)=>(
  <div className="rb-template-box-wrapper" key={tpl.id}>

    <div className="rb-resume-inner-preview">

      {renderHomePreview(tpl)}

    </div>

    <div className="rb-template-label">
      <h3>{tpl.name}</h3>
    </div>

  </div>
))}

</div>
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