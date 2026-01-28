import React, { useEffect, useRef } from 'react';
import { Brain, Users, Layers } from 'lucide-react';
import './ApproachPillars.css';

const ApproachPillars = () => {
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
    <section className="approach-pillars-section" ref={sectionRef}>
      <div className="container">
        <div className="pillars-header">
          <h2 className="pillars-title">The Three Pillars of Our Method</h2>
          <p className="pillars-subtitle">
            A holistic approach that combines cutting-edge technology with genuine human care
          </p>
        </div>

        <div className="pillars-grid">
          {/* Pillar 01 */}
          <div className="pillar-card pillar-teal">
            <span className="pillar-number">01</span>
            <div className="pillar-icon-wrapper">
              <Brain size={24} />
            </div>
            <h3 className="pillar-card-title">Intelligent Personalization</h3>
            <p className="pillar-text">
              Your wellness journey is uniquely yours. Our AI engine continuously learns from 
              your lifestyle habits, behavioral patterns, and health data to create strategies 
              that adapt to your real life.
            </p>
            <p className="pillar-highlight">
              Notice you're skipping morning workouts? We'll suggest evening sessions that fit 
              your rhythm. Experiencing poor sleep? Our AI detects the pattern and recommends 
              personalized wind-down routines before you even ask.
            </p>
            <p className="pillar-footer">
              This isn't generic advice—it's hyper-personalized guidance that evolves with you, 
              every single day.
            </p>
          </div>

          {/* Pillar 02 - Featured */}
          <div className="pillar-card pillar-orange featured">
            <span className="pillar-number">02</span>
            <div className="pillar-icon-wrapper">
              <Users size={24} />
            </div>
            <h3 className="pillar-card-title">Human Wisdom, AI Power</h3>
            <p className="pillar-text">
              Technology should enhance human connection, not replace it. That's why every 
              user is paired with a certified professional trainer who provides the empathy, 
              judgment, and expertise that only a human can offer.
            </p>
            <p className="pillar-highlight">
              Think of it as having a brilliant co-pilot (AI) handling the complex data 
              analysis, while your experienced captain (your trainer) makes the important 
              decisions and provides the encouragement you need to succeed.
            </p>
            <p className="pillar-footer">
              Our AI processes thousands of data points. Your trainer processes you—your 
              emotions, your challenges, your victories.
            </p>
          </div>

          {/* Pillar 03 */}
          <div className="pillar-card pillar-teal">
            <span className="pillar-number">03</span>
            <div className="pillar-icon-wrapper">
              <Layers size={24} />
            </div>
            <h3 className="pillar-card-title">One Platform, Complete Wellness</h3>
            <p className="pillar-text">
              Stop switching between fitness trackers, nutrition apps, meditation guides, 
              and mood journals. Lernevo brings it all together.
            </p>
            <p className="pillar-highlight">
              We integrate seamlessly with your wearable devices and create a unified 
              dashboard where you can see the full picture: your nutrition, exercise, 
              sleep patterns, and mental well-being—all in one place.
            </p>
            <p className="pillar-footer">
              No more data fragmentation. No more lost insights. Just clarity, 
              convenience, and complete understanding of your health.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApproachPillars;
