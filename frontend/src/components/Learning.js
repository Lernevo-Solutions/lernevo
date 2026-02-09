import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  CalendarDays, 
  Zap, 
  History,
  Brain,
  Award,
  MessageSquare,
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import Navbar from './Navbar';
import './Learning.css';


// Sub-components
const LearningHero = () => (
  <section className="learning-hero">
    <div className="learning-hero-icon-wrapper">
      <BookOpen size={40} />
    </div>
    <h1>LERNEVO LEARNING</h1>
    <div className="learning-underline"></div>
    <p className="learning-tagline">
      AI-Powered Learning Paths to Enhance Your Skills and Knowledge
    </p>
    <div className="learning-quote">
      "Master New Skills with Personalized Learning Journeys!"
    </div>
  </section>
);

const LearningServices = () => (
  <section className="learning-services">
    <div className="learning-section-header">
      <Brain size={32} />
      <h2>Our Learning Services</h2>
    </div>
    <div className="learning-section-underline"></div>
    <p className="learning-section-subtitle">
      Professional learning programs tailored to your goals, pace, and learning style.
    </p>

    <div className="learning-services-grid">
      <div className="learning-service-card">
        <div className="learning-service-icon">
          <Award size={28} />
        </div>
        <h3>Personalized Learning Paths</h3>
        <p>
          Receive customized course recommendations and learning roadmaps designed specifically for your goals.
        </p>
        <ul className="learning-service-features">
          <li><CheckCircle size={18} /> Custom skill development plans</li>
          <li><CheckCircle size={18} /> Self-paced learning schedules</li>
          <li><CheckCircle size={18} /> Progress tracking & milestones</li>
          <li><CheckCircle size={18} /> Resource curation</li>
        </ul>
      </div>

      <div className="learning-service-card">
        <div className="learning-service-icon">
          <TrendingUp size={28} />
        </div>
        <h3>Progress Tracking & Analytics</h3>
        <p>
          Monitor your learning journey with detailed insights on completion rates and skill mastery.
        </p>
        <ul className="learning-service-features">
          <li><CheckCircle size={18} /> Weekly learning assessments</li>
          <li><CheckCircle size={18} /> Skill mastery tracking</li>
          <li><CheckCircle size={18} /> Performance analytics</li>
          <li><CheckCircle size={18} /> Goal-based adjustments</li>
        </ul>
      </div>

      <div className="learning-service-card">
        <div className="learning-service-icon">
          <Users size={28} />
        </div>
        <h3>Expert Mentor Support</h3>
        <p>
          Dedicated access to subject matter experts for guidance, feedback, and career advice.
        </p>
        <ul className="learning-service-features">
          <li><CheckCircle size={18} /> One-on-one mentoring sessions</li>
          <li><CheckCircle size={18} /> Assignment feedback & guidance</li>
          <li><CheckCircle size={18} /> Career path coaching</li>
          <li><CheckCircle size={18} /> Q&A support</li>
        </ul>
      </div>
    </div>
  </section>
);

const LearningPath = () => {
  const [activeLevel, setActiveLevel] = useState('Beginner');

  const levels = {
    'Beginner': { 
      duration: '4 weeks',
      topics: ['Foundations', 'Core Concepts', 'Basics Mastery'],
      skills: 'Build foundational knowledge'
    },
    'Intermediate': { 
      duration: '8 weeks',
      topics: ['Advanced Concepts', 'Case Studies', 'Practical Application'],
      skills: 'Apply knowledge in real scenarios'
    },
    'Advanced': { 
      duration: '12 weeks',
      topics: ['Expert Techniques', 'Industry Practices', 'Capstone Project'],
      skills: 'Master expert-level skills'
    }
  };

  return (
    <section className="learning-path">
      <div className="learning-section-header">
        <CalendarDays size={28} />
        <h3>Your Learning Path</h3>
      </div>
      <div className="learning-section-underline"></div>
      <p className="learning-section-subtitle">
        Choose your level and progress through carefully structured learning modules.
      </p>

      <div className="learning-levels-nav">
        {Object.keys(levels).map(level => (
          <button 
            key={level} 
            className={`learning-level-btn ${activeLevel === level ? 'active' : ''}`}
            onClick={() => setActiveLevel(level)}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="learning-path-card">
        <div className="learning-path-duration">
          <strong>Duration:</strong> {levels[activeLevel].duration}
        </div>
        <div className="learning-path-topics">
          <strong>Topics:</strong><br/>
          {levels[activeLevel].topics.map((topic, idx) => (
            <span key={idx} className="learning-topic-tag">{topic}</span>
          ))}
        </div>
        <div className="learning-path-skills">
          <strong>Outcome:</strong> {levels[activeLevel].skills}
        </div>
      </div>
      
      <p className="learning-plan-disclaimer">
        Sample learning path. Final curriculum is personalized based on your assessment.
      </p>
    </section>
  );
};

const MentorSupport = () => (
  <section className="learning-mentor-support">
    <div className="learning-section-header">
      <MessageSquare size={32} />
      <h2>Expert Mentor Guidance</h2>
    </div>
    <div className="learning-section-underline"></div>
    <p className="learning-section-subtitle">
      You're never alone in your learning journey. Our mentors help you succeed.
    </p>

    <div className="learning-mentor-grid">
      <div className="learning-mentor-feature">
        <div className="learning-mentor-feature-icon">
          <Lightbulb size={24} />
        </div>
        <div>
          <h4>Personalized Guidance</h4>
          <p>Mentors adjust your learning path based on your pace and understanding.</p>
        </div>
      </div>

      <div className="learning-mentor-feature">
        <div className="learning-mentor-feature-icon">
          <Zap size={24} />
        </div>
        <div>
          <h4>Assignment Feedback</h4>
          <p>Get detailed reviews and suggestions on your work to accelerate mastery.</p>
        </div>
      </div>
    </div>
  </section>
);

const ComingSoonLearning = () => (
  <section className="learning-coming-soon">
    <div className="learning-coming-soon-badge">COMING SOON</div>
    <div className="learning-coming-soon-header">
      <div className="learning-coming-soon-icon">
        <History size={32} />
      </div>
      <div>
        <h3>Future Roadmap: AI Learning Assistant</h3>
        <p className="learning-coming-soon-sub">Intelligent tutoring at your fingertips</p>
      </div>
    </div>
    
    <div className="learning-coming-soon-intro">
      <strong>Currently we provide expert-curated learning paths and mentor support.</strong> 
      Our experts personally guide every learner. Soon, we'll launch:
    </div>

    <div className="learning-future-features">
      <div className="learning-feature-item">
        <div className="learning-feature-item-icon">
          <Brain size={24} />
        </div>
        <h4>AI-Powered Assessment</h4>
        <p>Intelligent quizzes that adapt to your knowledge level for optimal learning.</p>
      </div>

      <div className="learning-feature-item">
        <div className="learning-feature-item-icon">
          <TrendingUp size={24} />
        </div>
        <h4>Smart Recommendations</h4>
        <p>AI suggests next topics based on your learning patterns and goals.</p>
      </div>
    </div>
    
    <p className="learning-roadmap-note">
      Focus on your personalized learning path for now. AI-powered features will enhance your experience soon.
    </p>
  </section>
);

const LearningCTA = () => {
  const navigate = useNavigate();
  return (
    <section className="learning-cta">
      <h2>Start Your Learning Journey Today</h2>
      <p>
        Get your personalized learning path designed by experts. Master new skills at your own pace with mentorship.
      </p>
      <button 
        className="learning-cta-button" 
        onClick={() => navigate('/get-started')}
      >
        Get Your Custom Learning Path
        <ArrowRight size={20} />
      </button>
    </section>
  );
};

export default function Learning() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="learning-page-wrapper">
      <Navbar onGetStarted={() => navigate('/get-started')} />
      <div className="learning-container">
        <LearningHero />
        <div className="learning-content-card">
          <LearningServices />
          <LearningPath />
          <MentorSupport />
          <ComingSoonLearning />
        </div>
        <LearningCTA />
      </div>
      
    </div>
  );
}
