import React, { useEffect, useRef } from 'react';
import './features.css';

const Features = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px' }
    );

    // Observe header elements
    if (headerRef.current) {
      const headerChildren = headerRef.current.children;
      Array.from(headerChildren).forEach((el) => observer.observe(el));
    }

    // Observe cards
    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="features-section" ref={sectionRef}>
      {/* Header with fade-up animations */}
      <div className="features-header" ref={headerRef}>
        
        <h1 className="section-title fade-up">
          Everything You Need,<br />
          <span>All in One Place</span>
        </h1>
        <p className="section-sub fade-up">
          From fitness to career growth — Lernevo is built to support every dimension of your life with AI that truly works for you.
        </p>
      </div>

      {/* Showcase */}
      <div className="feature-showcase">
        {/* Top: Info Card */}
        <div className="card-main fade-up" ref={(el) => (cardsRef.current[0] = el)}>
          <div>
            <div className="badge-coming-soon">
              <div className="dot-live"></div>
              Coming Soon
            </div>
            <h2>
              AI-Powered<br />
              Resume Builder
            </h2>
            <p>
              Let our AI craft a job-winning resume tailored to your skills, experience, and target role — in minutes, not hours.
            </p>
            <ul className="feature-list">
              <li>
                <div className="check">✓</div> Smart content suggestions based on your profile
              </li>
              <li>
                <div className="check">✓</div> ATS-optimized formatting & keywords
              </li>
              <li>
                <div className="check">✓</div> Role-specific templates curated by experts
              </li>
              <li>
                <div className="check">✓</div> One-click export to PDF or Word
              </li>
              <li>
                <div className="check">✓</div> Real-time AI feedback & scoring
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom: Preview Card */}
        <div className="card-preview fade-up" ref={(el) => (cardsRef.current[1] = el)}>
          <p className="preview-label">Preview</p>

          {/* Blurred Resume Mockup */}
          <div className="resume-mockup">
            <div className="resume-header-row">
              <div className="avatar-circle"></div>
              <div className="resume-name-block">
                <div className="line dark"></div>
                <div className="line sm"></div>
              </div>
            </div>
            <div className="resume-section-title"></div>
            <div className="resume-line w-full"></div>
            <div className="resume-line w-3q"></div>
            <div className="resume-line w-half"></div>
            <br />
            <div className="resume-section-title"></div>
            <div className="resume-line w-full"></div>
            <div className="resume-line w-3q"></div>
            <div className="skill-chips">
              <div className="skill-chip">Leadership</div>
              <div className="skill-chip">AI Tools</div>
              <div className="skill-chip">Design</div>
              <div className="skill-chip">Analytics</div>
            </div>

            {/* Overlay */}
            <div className="mockup-overlay">
              <div className="lock-icon">🔒</div>
              <div className="overlay-text">Unlocking Soon</div>
            </div>
          </div>

          {/* AI Feature Chips */}
          <div className="ai-chips">
            <div className="ai-chip">
              <span>🤖</span> AI Writing
            </div>
            <div className="ai-chip">
              <span>📄</span> Templates
            </div>
            <div className="ai-chip">
              <span>🔍</span> Skill Gap Analyzer
            </div>
            <div className="ai-chip">
              <span>⚡</span> Instant Export
            </div>
          </div>

          {/* Be the First Banner */}
          <div className="be-first-banner">
            <div className="banner-left">
              <div className="banner-icon">🚀</div>
              <div>
                <div className="banner-text-top">Launching Soon</div>
                <div className="banner-text-main">Be the First to Use It</div>
              </div>
            </div>
            <div className="ticker-wrap">
              <div className="ticker-track">
                <span>✦ Coming Soon</span>
                <span>✦ Stay Tuned</span>
                <span>✦ Almost Ready</span>
                <span>✦ Coming Soon</span>
                <span>✦ Stay Tuned</span>
                <span>✦ Almost Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;