import React, { useEffect, useRef } from 'react';
import './ApproachPhilosophy.css';

const ApproachPhilosophy = () => {
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
    <section id="our-approach" className="approach-philosophy-section" ref={sectionRef}>
      <div className="philosophy-bg-elements">
        <div className="dot dot-1"></div>
        <div className="dot dot-2"></div>
        <div className="dot dot-3"></div>
        <div className="dot dot-4"></div>
      </div>
      
      <div className="container">
        <div className="philosophy-content">
          <h1 className="philosophy-title">
            Where <span className="accent-teal">Science</span> Meets Care,<br />
            Progress Meets <span className="accent-orange">Purpose</span>
          </h1>
          
          <p className="philosophy-description">
            At Lernevo, we believe wellness isn't about juggling dozens of apps or 
            following one-size-fits-all programs. It's about having an intelligent 
            companion that truly understands you—backed by real human experts who 
            genuinely care.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ApproachPhilosophy;
