
import React, { useEffect, useRef } from 'react';
import './ApproachPhilosophy.css';
import docimg from "./doc.png";
const ApproachPhilosophy = () => {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);

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
     
      <div className="container">
        <div className="philosophy-content">
          <div className="text-content">
            <div className="title-wrapper">
              <span className="pre-title">Our Philosophy</span>
              <h1 className="philosophy-title">
                Where <span className="accent-teal">Science</span> Meets Care,<br />
                Progress Meets <span className="accent-orange">Purpose</span>
              </h1>
            </div>
            
            <p className="philosophy-description">
              At Lernevo, we believe wellness isn't about juggling dozens of apps or 
              following one-size-fits-all programs. It's about having an intelligent 
              companion that truly understands you—backed by real human experts who 
              genuinely care.
            </p>

          
          </div>

          <div className="image-content" ref={imageRef}>
            <div className="image-container">
              <img 
                src={docimg}
                alt="Science meets care - Healthcare professional using modern technology"
                className="philosophy-image"
               
              />
              <div className="image-overlay"></div>
              <div className="image-highlight-card">
                <div className="highlight-icon">✨</div>
                <p>"Your wellness journey, perfectly tailored"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApproachPhilosophy;
