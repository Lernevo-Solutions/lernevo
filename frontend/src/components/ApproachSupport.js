import React, { useEffect, useRef } from 'react';
import { Headset, MessageCircle, Users, TrendingUp } from 'lucide-react';
import './ApproachSupport.css';

const ApproachSupport = () => {
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

  const cards = [
    {
      icon: <Headset size={24} />,
      title: "Real-time Guidance",
      description: "Certified professionals access your holistic data to provide precise coaching"
    },
    {
      icon: <MessageCircle size={24} />,
      title: "Secure Messaging",
      description: "Private, ongoing support whenever you need it"
    },
    {
      icon: <Users size={24} />,
      title: "Community Connection",
      description: "Workout groups and challenges that keep you motivated"
    },
    {
      icon: <TrendingUp size={24} />,
      title: "Strategic Oversight",
      description: "Continuous improvement of your experience"
    }
  ];

  return (
    <section className="approach-support-section" ref={sectionRef}>
      <div className="container">
        <div className="support-header">
          <h2 className="support-title">Supported Every Step</h2>
          <p className="support-subtitle">You're never alone on your journey</p>
        </div>

        <div className="support-grid">
          {cards.map((card, index) => (
            <div key={index} className="support-card">
              <div className="support-icon-badge">
                {card.icon}
              </div>
              <h3 className="support-card-title">{card.title}</h3>
              <p className="support-card-desc">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ApproachSupport;
