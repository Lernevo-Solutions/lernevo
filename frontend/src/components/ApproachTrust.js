import React, { useEffect, useRef } from 'react';
import { Shield, Lock, Eye, FileText, ShieldCheck } from 'lucide-react';
import './ApproachTrust.css';

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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section className="approach-trust-section" ref={sectionRef}>
      <div className="container trust-container">
        
        {/* Left Side: Visual Focus */}
        <div className="trust-visual">
          <div className="ripple-container">
            <div className="ripple ripple-1"></div>
            <div className="ripple ripple-2"></div>
            <div className="ripple ripple-3"></div>
            <div className="main-shield-icon">
              <Shield size={60} fill="#134e4a" color="#fff" />
              <div className="small-shield-overlay">
                 <ShieldCheck size={20} color="#134e4a" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="trust-content">
          <div className="trust-badge">
            <Shield size={14} className="badge-icon" />
            <span>Enterprise-Grade Security</span>
          </div>

          <h2 className="trust-title">Built on Trust</h2>

          <div className="trust-description">
            <p>
              Your wellness data is deeply personal. That's why we've built
              Lernevo on enterprise-grade security with encrypted
              communications, strict access controls, and audit trails that meet
              the highest healthcare standards.
            </p>
            <p>
              When you message your trainer, share your goals, or log your
              progress, you can trust that your information is protected with the
              same rigor as medical records.
            </p>
          </div>

          <div className="trust-features">
            <div className="trust-pill">
              <Lock size={16} />
              <span>Encrypted Communications</span>
            </div>
            <div className="trust-pill">
              <Eye size={16} />
              <span>Strict Access Controls</span>
            </div>
            <div className="trust-pill">
              <FileText size={16} />
              <span>Audit Trails</span>
            </div>
            <div className="trust-pill">
              <ShieldCheck size={16} />
              <span>Healthcare Standards</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ApproachTrust;
