import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dumbbell, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  CalendarDays, 
  Zap, 
  History,
  Activity,
  Award,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import Navbar from './Navbar';
import './Fitness.css';


// Sub-components
const FitnessHero = () => (
  <section className="fitness-hero">
    <div className="fitness-hero-icon-wrapper">
      <Dumbbell size={40} />
    </div>
    <h1>LERNEVO FITNESS</h1>
    <div className="fitness-underline"></div>
    <p className="fitness-tagline">
      Expert-Led Training Programs Designed for Your Success
    </p>
    <div className="fitness-quote">
      "Your Transformation Starts with a Plan - We Build It for You!"
    </div>
  </section>
);

const FitnessServices = () => (
  <section className="fitness-services">
    <div className="fitness-section-header">
      <Activity size={32} />
      <h2>Our Fitness Services</h2>
    </div>
    <div className="fitness-section-underline"></div>
    <p className="fitness-section-subtitle">
      Professional workout strategies tailored to your body type, goals, and schedule.
    </p>

    <div className="fitness-services-grid">
      <div className="fitness-service-card">
        <div className="fitness-service-icon">
          <Award size={28} />
        </div>
        <h3>Custom Workout Plans</h3>
        <p>
          Receive a detailed training schedule built specifically for your goals and available equipment.
        </p>
        <ul className="fitness-service-features">
          <li><CheckCircle size={18} /> Strength & muscle building</li>
          <li><CheckCircle size={18} /> Weight loss & toning</li>
          <li><CheckCircle size={18} /> Home or gym-based options</li>
          <li><CheckCircle size={18} /> Progressive overload focus</li>
        </ul>
      </div>

      <div className="fitness-service-card">
        <div className="fitness-service-icon">
          <TrendingUp size={28} />
        </div>
        <h3>Performance Tracking</h3>
        <p>
          Weekly progress reviews with your trainer to ensure you're hitting your milestones.
        </p>
        <ul className="fitness-service-features">
          <li><CheckCircle size={18} /> Weekly form checks</li>
          <li><CheckCircle size={18} /> Strength progress logging</li>
          <li><CheckCircle size={18} /> Body metric analysis</li>
          <li><CheckCircle size={18} /> Goal-based adjustments</li>
        </ul>
      </div>

      <div className="fitness-service-card">
        <div className="fitness-service-icon">
          <Users size={28} />
        </div>
        <h3>Expert Trainer Support</h3>
        <p>
          Dedicated access to certified fitness trainers for guidance and motivation.
        </p>
        <ul className="fitness-service-features">
          <li><CheckCircle size={18} /> One-on-one consultation</li>
          <li><CheckCircle size={18} /> Exercise technique guidance</li>
          <li><CheckCircle size={18} /> Accountability coaching</li>
          <li><CheckCircle size={18} /> Q&A support</li>
        </ul>
      </div>
    </div>
  </section>
);

const SampleWorkoutPlan = () => {
  const [activeDay, setActiveDay] = useState('Mon');

  const workouts = {
    'Mon': { focus: 'Full Body - Strength', exercises: 'Squats (3x10), Bench Press (3x10), Deadlifts (3x8), Plank (3x60s)' },
    'Tue': { focus: 'Active Recovery', exercises: 'Light Yoga, 30-min Walking, Mobility Drills' },
    'Wed': { focus: 'Upper Body - Hypertrophy', exercises: 'Pull-ups (3xMax), Overhead Press (3x12), Rows (3x12), Bicep Curls (3x15)' },
    'Thu': { focus: 'Lower Body - Power', exercises: 'Leg Press (4x8), Lunges (3x12), Calf Raises (4x15), Core Work' },
    'Fri': { focus: 'HIIT Cardio', exercises: 'Burpees, Mountain Climbers, Kettlebell Swings, 15-min Treadmill Sprints' }
  };

  return (
    <section className="fitness-workout-plan">
      <div className="fitness-section-header">
        <CalendarDays size={28} />
        <h3>Sample Weekly Workout Plan</h3>
      </div>
      <div className="fitness-section-underline"></div>
      <p className="fitness-section-subtitle">
        Explore a typical training week. Final plans are personalized by trainers.
      </p>

      <div className="fitness-days-nav">
        {Object.keys(workouts).map(day => (
          <button 
            key={day} 
            className={`fitness-day-btn ${activeDay === day ? 'active' : ''}`}
            onClick={() => setActiveDay(day)}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="fitness-workout-card">
        <div className="fitness-workout-focus">
          <strong>Focus:</strong> {workouts[activeDay].focus}
        </div>
        <div className="fitness-workout-details">
          {workouts[activeDay].exercises}
        </div>
      </div>
      
      <p className="fitness-plan-disclaimer">
        Sample plan. Final workouts are personalized by trainers.
      </p>
    </section>
  );
};

const TrainerSupport = () => (
  <section className="fitness-trainer-support">
    <div className="fitness-section-header">
      <MessageSquare size={32} />
      <h2>Direct Trainer Support</h2>
    </div>
    <div className="fitness-section-underline"></div>
    <p className="fitness-section-subtitle">
      You're never alone in your journey. Our experts are with you at every step.
    </p>

    <div className="fitness-trainer-grid">
      <div className="fitness-trainer-feature">
        <div className="fitness-trainer-feature-icon">
          <Activity size={24} />
        </div>
        <div>
          <h4>Personalized Adjustments</h4>
          <p>Trainers modify your plan weekly based on your feedback and progress.</p>
        </div>
      </div>

      <div className="fitness-trainer-feature">
        <div className="fitness-trainer-feature-icon">
          <Zap size={24} />
        </div>
        <div>
          <h4>Form Corrections</h4>
          <p>Send videos of your exercises for expert form feedback and safety tips.</p>
        </div>
      </div>
    </div>
  </section>
);

const ComingSoonFitness = () => (
  <section className="fitness-coming-soon">
    <div className="fitness-coming-soon-badge">COMING SOON</div>
    <div className="fitness-coming-soon-header">
      <div className="fitness-coming-soon-icon">
        <History size={32} />
      </div>
      <div>
        <h3>Future Roadmap: AI Tracking</h3>
        <p className="fitness-coming-soon-sub">Building the next generation of fitness technology</p>
      </div>
    </div>
    
    <div className="fitness-coming-soon-intro">
      <strong>Currently we provide workout plans with trainer support.</strong> 
      Our experts manually curate every routine. Soon, we'll launch:
    </div>

    <div className="fitness-future-features">
      <div className="fitness-feature-item">
        <div className="fitness-feature-item-icon">
          <Activity size={24} />
        </div>
        <h4>Automatic tracking & AI features</h4>
        <p>Your movement will be tracked in real-time to ensure perfect form and rep counting.</p>
      </div>

      <div className="fitness-feature-item">
        <div className="fitness-feature-item-icon">
          <TrendingUp size={24} />
        </div>
        <h4>Smart Progression</h4>
        <p>AI will automatically increase weights and intensity based on your performance.</p>
      </div>
    </div>
    
    <p className="fitness-roadmap-note">
      Focus on your custom plan for now. Automatic tracking & AI features will be added later.
    </p>
  </section>
);

const FitnessCTA = () => {
  const navigate = useNavigate();
  return (
    <section className="fitness-cta">
      <h2>Transform Your Body Today</h2>
      <p>
        Get your custom workout plan designed by professionals. No guesswork, just results.
      </p>
      <button 
        className="fitness-cta-button" 
        onClick={() => navigate('/get-started')}
      >
        Get Your Custom Workout Plan
        <ArrowRight size={20} />
      </button>
    </section>
  );
};

export default function Fitness() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="fitness-page-wrapper">
      <Navbar onGetStarted={() => navigate('/get-started')} />
      <div className="fitness-container">
        <FitnessHero />
        <div className="fitness-content-card">
          <FitnessServices />
          <SampleWorkoutPlan />
          <TrainerSupport />
          <ComingSoonFitness />
        </div>
        <FitnessCTA />
      </div>
      
    </div>
  );
}
