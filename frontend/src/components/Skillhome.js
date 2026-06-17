// Skillhome.js - REMOVED footer detection, ads run continuously
import React from 'react';  // useEffect remove panniten
import { useNavigate } from 'react-router-dom';
import './Skillhome.css';

// Import your ad images
import gymImg from "./gym.png";
import g1 from "./gym1.png";
import g2 from "./gym2.png";
import g3 from "./gym3.png"; 
import g4 from "./gym4.png";
import g5 from "./gym5.png";
import g6 from "./gym6.png";
import g7 from "./gym7.png";
import g8 from "./gym8.png";
import g9 from "./gym9.png";
import g10 from "./gym10.png";
import g11 from "./gym11.png";
import {
  Target,
  BrainCircuit,
  GraduationCap,
  Wand2,
  FileSearch
} from "lucide-react";
const SkillHome = () => {
  const navigate = useNavigate();

  // ❌ REMOVED all useEffect and footer detection code

  const features = [
    {
      icon: <Target size={32} strokeWidth={2.2} />,
      title: 'ATS Score Analysis',
      desc: 'Instantly check how well your resume matches ATS requirements and boost your visibility.',
    },
    {
     icon: <Wand2 size={32} strokeWidth={2.2} />,
      title: 'AI Skill Gap Detection',
      desc: 'Compare your resume against any job description and identify exactly what skills you are missing.',
    },
    {
        icon: <GraduationCap size={32} strokeWidth={2.2} />,
      title: 'Learning Recommendations',
      desc: 'Get personalized course and resource suggestions to close your skill gaps fast.',
    },
    {
       icon: <FileSearch size={32} strokeWidth={2.2} />,
      title: 'Resume Optimization Tips',
      desc: 'Receive actionable tips to make your resume more recruiter-friendly and keyword-optimized.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Upload Resume',
      desc: 'Upload your resume in PDF or TXT format — drag & drop or browse your files.',
      icon: '📤',
    },
    {
      step: '02',
      title: 'Paste Job Description',
      desc: 'Copy and paste the job description of the role you want to apply for.',
      icon: '💼',
    },
    {
      step: '03',
      title: 'Get Instant Analysis',
      desc: 'Our AI calculates your ATS score and skill gap in under 30 seconds.',
      icon: '⚡',
    },
    {
      step: '04',
      title: 'Grow & Apply',
      desc: 'Follow personalized recommendations and land your dream job with confidence.',
      icon: '🚀',
    },
  ];

  return (
    <div className="skill-page-wrapper">
      <div className="skill-wellness-layout-wrapper">
        
        {/* Left Sidebar Ad - Always running, never stops */}
        <div className="skill-side-ad skill-left-ad">
          <div className="skill-ad-track skill-move-down">
            <img src={gymImg} alt="Ad" />
            <img src={g3} alt="Ad" />
            <img src={g4} alt="Ad" />
            <img src={g5} alt="Ad" />
            <img src={g6} alt="Ad" />
            <img src={g7} alt="Ad" />
            <img src={g8} alt="Ad" />
            <img src={g9} alt="Ad" />   
            <img src={g10} alt="Ad" />
            <img src={g11} alt="Ad" />
            <img src={gymImg} alt="Ad" />
          </div>
        </div>

        {/* Right Sidebar Ad - Always running, never stops */}
        <div className="skill-side-ad skill-right-ad">
          <div className="skill-ad-track skill-move-up">
            <img src={g2} alt="Ad" />
            <img src={g3} alt="Ad" />
            <img src={g1} alt="Ad" />
            <img src={g4} alt="Ad" />
            <img src={g5} alt="Ad" />
            <img src={g6} alt="Ad" />
            <img src={g7} alt="Ad" />
            <img src={g8} alt="Ad" />
            <img src={g9} alt="Ad" />   
            <img src={g10} alt="Ad" />
            <img src={g11} alt="Ad" />
            <img src={g2} alt="Ad" />
          </div>
        </div>

        {/* MAIN CONTENT WRAPPER */}
        <div className="skill-content-wrapper">
          <div className="skill-main-container">
            
            {/* ── HERO SECTION ── */}
            <section className="skill-hero-section">
              {/* Floating blobs */}
              <div className="skill-hero-blob skill-hero-blob-1" />
              <div className="skill-hero-blob skill-hero-blob-2" />
              <div className="skill-hero-blob skill-hero-blob-3" />

              <div className="skill-hero-inner">
                <div className="skill-hero-badge">
                  <div className="skill-hero-badge-dot" />
                  <span>AI-Powered Career Intelligence</span>
                </div>

                <h1 className="skill-hero-title">
                  <span className="skill-title-dark">Land Your</span>{' '}
                  <span className="skill-title-gradient">Dream Job</span>
                  <br />
                  <span className="skill-title-dark">Faster with AI</span>
                </h1>

                <p className="skill-hero-desc">
                  Upload your resume, paste a job description — and get an instant ATS score,
                  skill gap analysis, and personalized learning recommendations to help you
                  stand out and get hired.
                </p>

                <div className="skill-hero-actions">
                  <button className="skill-btn-primary skill-btn-large" onClick={() => navigate('/skill-gap-analyzer')}>
                    🚀 Analyze My Resume
                  </button>
                  <a href="#how-it-works" className="skill-btn-ghost">
                    How it works ↓
                  </a>
                </div>

                {/* Stats Row */}
                <div className="skill-hero-stats">
                  <div className="skill-hero-stat">
                    <div className="skill-hero-stat-icon">⚡</div>
                    <div className="skill-hero-stat-text">
                      <strong>30 sec</strong>
                      <span>Instant Analysis</span>
                    </div>
                  </div>
                  <div className="skill-hero-stat">
                    <div className="skill-hero-stat-icon">🎯</div>
                    <div className="skill-hero-stat-text">
                      <strong>95%</strong>
                      <span>ATS Accuracy</span>
                    </div>
                  </div>
                  <div className="skill-hero-stat">
                    <div className="skill-hero-stat-icon">⚡</div>
<div className="skill-hero-stat-text">
  <strong>Instant</strong>
  <span>Skill Assessment</span>
</div>
                  </div>
                  <div className="skill-hero-stat">
                   <div className="skill-hero-stat-icon">🔍</div>
<div className="skill-hero-stat-text">
  <strong>Skill Gap</strong>
  <span>Smart Detection</span>
</div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── FEATURES SECTION ── */}
            <section id="features" className="skill-section">
              <div className="skill-section-label">✦ Features</div>
              <h2 className="skill-section-title">AI-Powered Tools for Smarter Career Growth</h2>
              <p className="skill-section-sub">
                One powerful tool — resume analysis, skill gap detection, and ATS optimization, all in one place.
              </p>

              <div className="skill-features-grid">
                {features.map((f, i) => (
                  <div key={i} className="skill-feature-card">
                    <div className="skill-feature-icon">{f.icon}</div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── HOW IT WORKS SECTION ── */}
            <section id="how-it-works" className="skill-section skill-section-alt">
              <div className="skill-section-label">✦ Process</div>
              <h2 className="skill-section-title">4 Simple Steps to Career Success</h2>
              <p className="skill-section-sub">
                Analyze your resume in minutes and get actionable insights to level up your career.
              </p>

              <div className="skill-steps-grid">
                {steps.map((s, i) => (
                  <div key={i} className="skill-step-card">
                    <div className="skill-step-num">{s.step}</div>
                    <div className="skill-step-icon">{s.icon}</div>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                    {i < steps.length - 1 && <div className="skill-step-arrow">→</div>}
                  </div>
                ))}
              </div>
            </section>

            {/* ── CTA BANNER ── */}
            <section className="skill-cta-section">
              <div className="skill-cta-card">
                <div className="skill-cta-glow" />
               
                <h2>Ready to Bridge Your Skill Gap?</h2>
                <p>
                  Analyze your resume right now — get your ATS score, identify missing skills,
                  and receive a personalized learning path, completely free.
                </p>
                <button
                  className="skill-btn-primary skill-btn-large"
                  onClick={() => navigate('/skill-gap-analyzer')}
                >
                  ✨ Start Analysis →
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillHome;