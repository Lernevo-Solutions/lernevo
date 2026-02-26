import React, { useEffect, useRef } from 'react';
import {
  Brain,
  Users,
  Layers,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import './ApproachPillars.css';

const ApproachPillars = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const currentSection = sectionRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            if (entry.target === currentSection) {
              cardsRef.current.forEach((card, index) => {
                if (card) {
                  setTimeout(() => {
                    card.classList.add('card-visible');
                  }, index * 200);
                }
              });
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    if (currentSection) observer.observe(currentSection);

    return () => {
      if (currentSection) observer.unobserve(currentSection);
    };
  }, []);

  const addToCardsRef = (el, index) => {
    cardsRef.current[index] = el;
  };

  return (
    <section className="approach-pillars-section" ref={sectionRef}>
      <div className="container">
        <div className="pillars-header">
          <div className="header-badge">
            <Sparkles size={16} />
            <span>Our Method</span>
          </div>

          <h2 className="pillars-title">
            The <span className="gradient-text">Three Pillars</span> of Lernevo
          </h2>

          <p className="pillars-subtitle">
            A modern wellness approach built on intelligence, empathy, and clarity
          </p>

          <div className="header-decoration">
            <div className="decoration-line"></div>
            <Target size={20} />
            <div className="decoration-line"></div>
          </div>
        </div>

        <div className="pillars-grid">
          {/* PILLAR 01 */}
          <div className="pillar-card pillar-teal" ref={(el) => addToCardsRef(el, 0)}>
            <div className="pillar-icon-wrapper">
              <div className="icon-orb">
                <Brain size={24} />
              </div>
            </div>

            <div className="pillar-content">
              <h3 className="pillar-card-title">Intelligent Personalization</h3>

              <p className="pillar-text">
                Wellness is personal, and your guidance should be too. Lernevo’s
                AI learns from your habits, routines, and preferences to shape
                recommendations that fit naturally into your life.
              </p>

              <p className="pillar-text">
                As your goals and lifestyle evolve, the system continuously
                adjusts—so your wellness plan always stays aligned with who you
                are today, not who you were yesterday.
              </p>

              <div className="pillar-highlight">
                <Zap size={16} />
                <p>
                  Support that adapts in real time, without you needing to
                  constantly reset or reconfigure anything.
                </p>
              </div>

              <div className="pillar-features">
                <span className="feature-tag">Adaptive Learning</span>
                <span className="feature-tag">Personal Insights</span>
                <span className="feature-tag">Lifestyle-Aware</span>
              </div>

              <div className="pillar-footer">
                <p>
                  No generic advice—only guidance that evolves with you, every day.
                </p>
              </div>
            </div>
          </div>

          {/* PILLAR 02 */}
          <div className="pillar-card pillar-orange featured" ref={(el) => addToCardsRef(el, 1)}>
            <div className="pillar-icon-wrapper">
              <div className="icon-orb">
                <Users size={24} />
              </div>
            </div>

            <div className="pillar-content">
              <h3 className="pillar-card-title">Human Wisdom, AI Power</h3>

              <p className="pillar-text">
                Technology alone isn’t enough. Lernevo blends intelligent AI with
                real human professionals who understand emotion, context, and
                motivation beyond raw data.
              </p>

              <p className="pillar-text">
                While AI handles complex analysis and patterns, human experts
                provide judgment, encouragement, and clarity—ensuring guidance
                feels supportive, not mechanical.
              </p>

              <div className="pillar-highlight">
                <Zap size={16} />
                <p>
                  A powerful partnership where technology enhances human care,
                  instead of replacing it.
                </p>
              </div>

              <div className="pillar-features">
                <span className="feature-tag">Human-in-the-Loop</span>
                <span className="feature-tag">Expert Guidance</span>
                <span className="feature-tag">AI Assistance</span>
              </div>

              <div className="pillar-footer">
                <p>
                  You’re supported by both intelligence and empathy—at every step.
                </p>
              </div>
            </div>
          </div>

          {/* PILLAR 03 */}
          <div className="pillar-card pillar-teal" ref={(el) => addToCardsRef(el, 2)}>
            <div className="pillar-icon-wrapper">
              <div className="icon-orb">
                <Layers size={24} />
              </div>
            </div>

            <div className="pillar-content">
              <h3 className="pillar-card-title">One Platform, Complete Wellness</h3>

              <p className="pillar-text">
                Managing wellness across multiple apps creates confusion and
                missed insights. Lernevo brings fitness, nutrition, mental health,
                and lifestyle data into one unified platform.
              </p>

              <p className="pillar-text">
                By connecting everything in one place, you gain a clear,
                complete view of your progress—making it easier to stay
                consistent and confident.
              </p>

              <div className="pillar-highlight">
                <Zap size={16} />
                <p>
                  A single dashboard that turns scattered data into meaningful,
                  actionable clarity.
                </p>
              </div>

              <div className="pillar-features">
                <span className="feature-tag">Unified Dashboard</span>
                <span className="feature-tag">Seamless Integration</span>
                <span className="feature-tag">Holistic View</span>
              </div>

              <div className="pillar-footer">
                <p>
                  Less switching. Less confusion. One clear path to better wellness.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApproachPillars;
