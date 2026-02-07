import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Heart, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  CalendarDays, 
  Moon,
  History,
  Activity,
  Award,
  MessageSquare,
  ArrowRight,
  Shield,
  Sparkles,
  Leaf, 
  Smile 
} from 'lucide-react';

import Navbar from './Navbar'; // Footer component-ai inge call seiyavum
import './MentalHealth.css';

// Sub-components
const MentalHealthHero = () => (
  <section className="mental-health-hero">
    <div className="mental-health-hero-icon-wrapper">
      <Brain size={40} />
    </div>
    <h1>LERNEVO MIND CARE</h1>
    <div className="mental-health-underline"></div>
    <p className="mental-health-tagline">
      Professional Mental Wellness Programs Tailored for Your Journey
    </p>
    <div className="mental-health-quote">
      "Your Peace of Mind is Our Priority - We Guide You There!"
    </div>
  </section>
);

const MentalHealthServices = () => (
  <section className="mental-health-services">
    <div className="mental-health-section-header">
      <Heart size={32} />
      <h2>Our Mental Wellness Services</h2>
    </div>
    <div className="mental-health-section-underline"></div>
    <p className="mental-health-section-subtitle">
      Holistic mental health strategies designed for your emotional needs and lifestyle.
    </p>

    <div className="mental-health-services-grid">
      <div className="mental-health-service-card">
        <div className="mental-health-service-icon">
          <Leaf size={28} />
        </div>
        <h3>Personalized Therapy Plans</h3>
        <p>
          Receive customized mental wellness strategies built for your emotional needs and challenges.
        </p>
        <ul className="mental-health-service-features">
          <li><CheckCircle size={18} /> Anxiety & stress management</li>
          <li><CheckCircle size={18} /> Depression support</li>
          <li><CheckCircle size={18} /> Mindfulness & meditation</li>
          <li><CheckCircle size={18} /> Coping strategy development</li>
        </ul>
      </div>

      <div className="mental-health-service-card">
        <div className="mental-health-service-icon">
          <TrendingUp size={28} />
        </div>
        <h3>Progress Monitoring</h3>
        <p>
          Regular wellness check-ins designed to review progress and support continuous improvement.
        </p>
        <ul className="mental-health-service-features">
          <li><CheckCircle size={18} /> Progress review sessions</li>
          <li><CheckCircle size={18} /> Well-being overview</li>
          <li><CheckCircle size={18} /> Routine & lifestyle review</li>
          <li><CheckCircle size={18} /> Goal-based adjustments</li>
        </ul>
      </div>

      <div className="mental-health-service-card">
        <div className="mental-health-service-icon">
          <Users size={28} />
        </div>
        <h3>Licensed Therapist Support</h3>
        <p>
          Dedicated access to certified mental health professionals for guidance and emotional support.
        </p>
        <ul className="mental-health-service-features">
          <li><CheckCircle size={18} /> One-on-one therapy sessions</li>
          <li><CheckCircle size={18} /> Cognitive Behavioral Therapy</li>
          <li><CheckCircle size={18} /> Emotional regulation techniques</li>
          <li><CheckCircle size={18} /> Crisis support when needed</li>
        </ul>
      </div>
    </div>
  </section>
);

const SampleWellnessPlan = () => {
  const [activeDay, setActiveDay] = useState('Mon');

  const wellnessActivities = {
    'Mon': { focus: 'Mindfulness & Grounding', activities: '10-min meditation, Journaling, 5-4-3-2-1 grounding exercise, Gratitude list' },
    'Tue': { focus: 'Emotional Processing', activities: 'Therapy session, Emotion wheel exercise, Art expression, Self-compassion practice' },
    'Wed': { focus: 'Stress Management', activities: 'Breathing exercises (4-7-8), Progressive muscle relaxation, Nature walk, Digital detox 1hr' },
    'Thu': { focus: 'Self-Care Focus', activities: 'Sleep hygiene review, Nourishing meal planning, Boundaries setting exercise, Hobby time' },
    'Fri': { focus: 'Social & Connection', activities: 'Social connection goal, Communication skill practice, Community engagement, Support system check-in' }
  };

  return (
    <section className="mental-health-wellness-plan">
      <div className="mental-health-section-header">
        <CalendarDays size={28} />
        <h3>Sample Weekly Wellness Plan</h3>
      </div>
      <div className="mental-health-section-underline"></div>
      <p className="mental-health-section-subtitle">
        Explore a typical mental wellness week. Final plans are personalized by therapists.
      </p>

      <div className="mental-health-days-nav">
        {Object.keys(wellnessActivities).map(day => (
          <button 
            key={day} 
            className={`mental-health-day-btn ${activeDay === day ? 'active' : ''}`}
            onClick={() => setActiveDay(day)}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="mental-health-wellness-card">
        <div className="mental-health-wellness-focus">
          <strong>Focus:</strong> {wellnessActivities[activeDay].focus}
        </div>
        <div className="mental-health-wellness-details">
          {wellnessActivities[activeDay].activities}
        </div>
      </div>
      
      <p className="mental-health-plan-disclaimer">
        Sample plan. Final wellness activities are personalized by your therapist.
      </p>
    </section>
  );
};

const TherapistSupport = () => (
  <section className="mental-health-therapist-support">
    <div className="mental-health-section-header">
      <MessageSquare size={32} />
      <h2>Direct Therapist Support</h2>
    </div>
    <div className="mental-health-section-underline"></div>
    <p className="mental-health-section-subtitle">
      You're never alone in your healing journey. Our therapists are with you every step.
    </p>

    <div className="mental-health-therapist-grid">
      <div className="mental-health-therapist-feature">
        <div className="mental-health-therapist-feature-icon">
          <Shield size={24} />
        </div>
        <div>
          <h4>Safe & Confidential Space</h4>
          <p>Your sessions are completely private and judgment-free. Share openly and honestly.</p>
        </div>
      </div>

      <div className="mental-health-therapist-feature">
        <div className="mental-health-therapist-feature-icon">
          <Sparkles size={24} />
        </div>
        <div>
          <h4>Personalized Techniques</h4>
          <p>Therapists provide customized coping strategies that work for your specific situation.</p>
        </div>
      </div>
    </div>
  </section>
);

const ComingSoonMentalHealth = () => (
  <section className="mental-health-coming-soon">
    <div className="mental-health-coming-soon-badge">COMING SOON</div>
    <div className="mental-health-coming-soon-header">
      <div className="mental-health-coming-soon-icon">
        <Moon size={32} />
      </div>
      <div>
        <h3>Future Roadmap: AI Emotional Support</h3>
        <p className="mental-health-coming-soon-sub">Building the next generation of mental health technology</p>
      </div>
    </div>
    
    <div className="mental-health-coming-soon-intro">
      <strong>Currently we provide therapy plans with licensed professional support.</strong> 
      Our experts personally design every wellness strategy. Soon, we'll launch:
    </div>

    <div className="mental-health-future-features">
      <div className="mental-health-feature-item">
        <div className="mental-health-feature-item-icon">
          <Brain size={24} />
        </div>
        <h4>AI Mood Prediction</h4>
        <p>Advanced algorithms will detect emotional patterns and suggest interventions before crisis points.</p>
      </div>

      <div className="mental-health-feature-item">
        <div className="mental-health-feature-item-icon">
          <Activity size={24} />
        </div>
        <h4>Virtual Reality Therapy</h4>
        <p>Immersive VR environments for exposure therapy and relaxation techniques in safe settings.</p>
      </div>
    </div>
    
    <p className="mental-health-roadmap-note">
      Focus on your personalized therapy plan for now. Advanced AI features will be added later.
    </p>
  </section>
);

const MentalHealthCTA = () => {
  const navigate = useNavigate();
  return (
    <section className="mental-health-cta">
      <h2>Begin Your Healing Journey Today</h2>
      <p>
        Get your personalized mental wellness plan designed by licensed professionals. 
        No judgment, just compassionate support.
      </p>
      <button 
        className="mental-health-cta-button" 
        onClick={() => navigate('/get-started')}
      >
        Start Your Mental Wellness Journey
        <ArrowRight size={20} />
      </button>
    </section>
  );
};

export default function MentalHealth() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="mental-health-page-wrapper">
      <Navbar onGetStarted={() => navigate('/get-started')} />
      
      <div className="mental-health-container">
        <MentalHealthHero />
        <div className="mental-health-content-card">
          <MentalHealthServices />
          <SampleWellnessPlan />
          <TherapistSupport />
          <ComingSoonMentalHealth />
        </div>
        <MentalHealthCTA />
      </div>

      
  
    </div>
  );
}