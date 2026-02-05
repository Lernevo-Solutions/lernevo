import React, { useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Globe,
  Cpu,
} from 'lucide-react';
import './ApproachTrust.css';
import secureImg from './secure.png'; // 👈 your image

const ApproachTrust = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section className="approach-trust-section" ref={sectionRef}>
      {/* Background */}
      <div className="trust-bg-elements">
        <div className="bg-grid-lines"></div>
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
      </div>

      <div className="container">
        {/* Header */}
        <div className="trust-header">
          <div className="header-badge">
            <ShieldCheck size={16} />
            <span>Privacy & Security</span>
          </div>

         <h2 className="trust-title">
  A Safer Space for{' '}
  <span className="gradient-text">Your Wellness Journey</span>
</h2>


          <p className="trust-subtitle">
            Healthcare-grade security built to keep your personal journey private,
            safe, and fully in your control.
          </p>
        </div>

        <div className="trust-main-content">
          {/* LEFT IMAGE (Shield removed) */}
          <div className="trust-visual-container">
            <div className="secure-image-wrapper">
              <img
                src={secureImg}
                alt="Secure wellness data illustration"
                className="secure-image"
              />
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="trust-content">
            {/* Description */}
            <div className="trust-description">
              <div className="description-card">
                <div className="card-icon">
                  <ShieldCheck size={20} />
                </div>
                <p>
                  Your wellness journey is deeply personal. Lernevo is built with
                  <strong> enterprise-level security</strong>, protecting every
                  interaction with healthcare-grade safeguards.
                </p>
              </div>

              <div className="description-card">
                <div className="card-icon">
                  <Globe size={20} />
                </div>
                <p>
                  From daily tracking to coach conversations, your data remains
                  <strong> globally compliant</strong>, private, and never shared
                  without your consent.
                </p>
              </div>
            </div>

            {/* FEATURES */}
            <div className="security-features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <Lock size={20} />
                </div>
                <div className="feature-content">
                  <h4>End-to-End Encryption</h4>
                  <p>256-bit encryption secures all data and communication.</p>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Eye size={20} />
                </div>
                <div className="feature-content">
                  <h4>Zero-Knowledge Architecture</h4>
                  <p>We never store sensitive data in readable form.</p>
                </div>
              </div>

              <div className="feature-card">
  <div className="feature-icon">
    <FileText size={20} />
  </div>
  <div className="feature-content">
    <h4>Your Data, Your Choice</h4>
    <p>You stay in control of what you share, when you share it.</p>
  </div>
</div>

<div className="feature-card">
  <div className="feature-icon">
    <Cpu size={20} />
  </div>
  <div className="feature-content">
    <h4>Designed for Trust</h4>
    <p>Privacy and security are built into every experience.</p>
  </div>
</div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApproachTrust;
