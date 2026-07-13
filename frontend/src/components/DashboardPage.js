import React, { useState } from 'react';
import { 
  Rocket, 
  Apple, 
  Dumbbell, 
  GraduationCap, 
  TrendingUp, 
  Flame, 
  Footprints, 
  Heart, 
  Activity, 
  Clock, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Navbar from './Navbar';
import './DashboardPage.css';

const DashboardPage = () => {
  const [activeTimeFilter, setActiveTimeFilter] = useState('Daily');

  const previewCards = [
    { title: 'Nutrition', icon: <Apple size={24} />, emoji: '🍎', color: '#10b981' }, // Green as requested
    { title: 'Fitness', icon: <Dumbbell size={24} />, emoji: '🏃', color: '#4361ee' }, // Blue as requested
    { title: 'Learning', icon: <GraduationCap size={24} />, emoji: '🎓', color: '#9d50bb' }, // Purple as requested
    { title: 'Performance', icon: <TrendingUp size={24} />, emoji: '📈', color: '#f72585' }, // Pink as requested
  ];

  return (
    <div className="dashboard-page">
      <Navbar />
      
      <main className="dashboard-main">
        <div className="dashboard-container">
          
          {/* Coming Soon Hero Banner */}
          <section className="coming-soon-banner">
            <div className="banner-left">
              <div className="rocket-icon">
                <Rocket size={48} />
              </div>
              <h1 className="banner-heading">
                Integrated Performance Dashboard – Coming Soon!
              </h1>
              <p className="banner-subheading">
                Your Complete Wellness Story in One View
              </p>
              <p className="banner-description">
                We're building a unified experience to track your progress across all wellness pillars. 
                Experience holistic tracking that connects your physical activity, nutritional habits, 
                and cognitive growth in one beautiful interface.
              </p>
            </div>
            

            <div className="banner-right">
              <div className="preview-grid">
                {previewCards.map((card) => (
                  <div key={card.title} className="preview-card">
                    <div className="card-icon" style={{ color: card.color }}>
                      {card.icon}
                    </div>
                    <span className="card-label">{card.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Main Dashboard Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Performance Overview</h2>
              <div className="time-filter">
                {['Daily', 'Weekly', 'Monthly'].map((filter) => (
                  <button
                    key={filter}
                    className={`filter-btn ${activeTimeFilter === filter ? 'active' : ''}`}
                    onClick={() => setActiveTimeFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="metrics-grid">
              {/* NUTRITION CARD */}
              <div className="metric-card nutrition-card">
                <div className="card-header">
                  <h3 className="card-title">Nutrition</h3>
                  <Apple size={18} className="muted-icon" />
                </div>
                <div className="card-body">
                  <div className="circular-container">
                    <CircularProgressbar
                      value={85}
                      text={`${85}%`}
                      styles={buildStyles({
                        pathColor: '#10b981',
                        textColor: '#1f2937',
                        trailColor: '#f3f4f6',
                        textSize: '22px',
                        strokeLinecap: 'round'
                      })}
                    />
                  </div>
                  <div className="calories-centered">
                    <span className="bold-value">1,850</span>
                    <span className="muted-label"> / 2,200 kcal</span>
                  </div>
                  <div className="macros-row">
                    <div className="macro-column">
                      <span className="macro-val">142g</span>
                      <span className="macro-lbl">Protein</span>
                    </div>
                    <div className="macro-divider"></div>
                    <div className="macro-column">
                      <span className="macro-val">185g</span>
                      <span className="macro-lbl">Carbs</span>
                    </div>
                    <div className="macro-divider"></div>
                    <div className="macro-column">
                      <span className="macro-val">62g</span>
                      <span className="macro-lbl">Fat</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FITNESS CARD */}
              <div className="metric-card fitness-card">
                <div className="card-header">
                  <h3 className="card-title">Fitness</h3>
                  <Activity size={18} className="muted-icon" />
                </div>
                <div className="card-body">
                  <div className="fitness-list">
                    <div className="fitness-row">
                      <Footprints size={20} className="fit-icon steps" />
                      <div className="fit-text">
                        <span className="bold-value">8,542</span>
                        <span className="muted-label"> steps</span>
                      </div>
                    </div>
                    <div className="fitness-row">
                      <Heart size={20} className="fit-icon heart" />
                      <div className="fit-text">
                        <span className="bold-value">72</span>
                        <span className="muted-label"> bpm</span>
                      </div>
                    </div>
                    <div className="fitness-row">
                      <Flame size={20} className="fit-icon flame" />
                      <div className="fit-text">
                        <span className="bold-value">420</span>
                        <span className="muted-label"> kcal burned</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer-text">
                    <span className="green-subtle">Active 45 mins today</span>
                  </div>
                </div>
              </div>

              {/* LEARNING CARD */}
              <div className="metric-card learning-card">
                <div className="card-header">
                  <h3 className="card-title">Learning</h3>
                  <GraduationCap size={18} className="muted-icon" />
                </div>
                <div className="card-body">
                  <h4 className="course-title">Web Development Course</h4>
                  <div className="progress-row">
                    <div className="thin-progress-bg">
                      <div className="thin-progress-fill" style={{ width: '65%' }}></div>
                    </div>
                    <span className="progress-percent">65%</span>
                  </div>
                  <div className="goal-box">
                    <span className="goal-text">Today's goal: Complete 2 React.js modules</span>
                  </div>
                  <div className="study-time-row">
                    <Clock size={16} className="muted-icon" />
                    <span className="study-text">Study time: 12 hours this week</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
