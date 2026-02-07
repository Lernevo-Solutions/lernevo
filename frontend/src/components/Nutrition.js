import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  Utensils, 
  CheckCircle, 
  ClipboardList, 
  ChartLine, 
  UserRound, 
  CalendarDays, 
  Hourglass, 
  Camera, 
  BarChart3, 
  RefreshCw,
  CalendarCheck
} from 'lucide-react';
import Navbar from './Navbar';

import './Nutrition.css';

// Sub-components
const NutritionHero = () => (
  <section className="nutrition-hero">
    <div className="nutrition-hero-icon-wrapper">
      <Leaf size={40} />
    </div>
    <h1>LERNEVO NUTRITION</h1>
    <p className="nutrition-tagline">
      Personalized Nutrition Plans Tailored to Your Health Goals
    </p>
    <div className="nutrition-quote">
      "We Create Your Perfect Diet Chart - You Just Follow It!"
    </div>
  </section>
);

const NutritionServices = () => (
  <section className="nutrition-services">
    <div className="nutrition-section-header">
      <Utensils size={32} />
      <h2>Our Nutrition Services</h2>
    </div>
    
    <p className="nutrition-intro-text">
      At Lernevo Wellness, we don't just give you generic diet advice. Our certified nutritionists create 
      <strong> fully customized meal plans</strong> based on your health goals, dietary preferences, lifestyle, and medical needs. 
      You get a complete diet chart that tells you exactly what to eat, when to eat, and how much to eat.
    </p>

    <div className="nutrition-services-grid">
      <div className="nutrition-service-card">
        <div className="nutrition-service-icon">
          <ClipboardList size={28} />
        </div>
        <h3>Personalized Diet Planning</h3>
        <p>
          Get a complete 7-day meal plan designed specifically for you by our expert nutritionists.
        </p>
        <ul className="nutrition-service-features">
          <li><CheckCircle size={18} /> Weight loss or gain focused</li>
          <li><CheckCircle size={18} /> Dietary restriction friendly</li>
          <li><CheckCircle size={18} /> Portion sizes & meal timing</li>
          <li><CheckCircle size={18} /> Grocery shopping list</li>
        </ul>
      </div>

      <div className="nutrition-service-card">
        <div className="nutrition-service-icon">
          <ChartLine size={28} />
        </div>
        <h3>Progress Monitoring</h3>
        <p>
          Weekly check-ins with our nutritionists to track your progress and adjust your plan.
        </p>
        <ul className="nutrition-service-features">
          <li><CheckCircle size={18} /> Weekly progress reviews</li>
          <li><CheckCircle size={18} /> Plan adjustments as needed</li>
          <li><CheckCircle size={18} /> Health metric tracking</li>
          <li><CheckCircle size={18} /> Ongoing guidance</li>
        </ul>
      </div>

      <div className="nutrition-service-card">
        <div className="nutrition-service-icon">
          <UserRound size={28} />
        </div>
        <h3>Expert Consultation</h3>
        <p>
          One-on-one sessions with certified nutritionists for personalized advice.
        </p>
        <ul className="nutrition-service-features">
          <li><CheckCircle size={18} /> Initial assessment</li>
          <li><CheckCircle size={18} /> Monthly consultations</li>
          <li><CheckCircle size={18} /> Recipe modifications</li>
          <li><CheckCircle size={18} /> Medical considerations</li>
        </ul>
      </div>
    </div>
  </section>
);

const SampleDietChart = () => (
  <section className="nutrition-diet-chart">
    <div className="nutrition-diet-chart-header">
      <CalendarDays size={28} color="#2563EB" />
      <h3>Your Sample Daily Diet Chart</h3>
    </div>
    <div className="nutrition-diet-disclaimer">
      <strong>Note:</strong> This is a sample only. Final plans are personalized by nutritionists based on your health assessment.
    </div>

    <div className="nutrition-timeline">
      <div className="nutrition-meal-card">
        <div className="nutrition-meal-time">8 AM</div>
        <div className="nutrition-meal-card-content">
          <h4>Breakfast</h4>
          <p>2 egg whites omelette with spinach + 1 slice whole wheat toast + 1 cup green tea</p>
          <span className="nutrition-meal-calories">~280 Calories</span>
        </div>
      </div>

      <div className="nutrition-meal-card">
        <div className="nutrition-meal-time">11 AM</div>
        <div className="nutrition-meal-card-content">
          <h4>Mid-Morning Snack</h4>
          <p>1 apple + 10 almonds + 1 cup buttermilk</p>
          <span className="nutrition-meal-calories">~180 Calories</span>
        </div>
      </div>

      <div className="nutrition-meal-card">
        <div className="nutrition-meal-time">1 PM</div>
        <div className="nutrition-meal-card-content">
          <h4>Lunch</h4>
          <p>1 cup brown rice + 1 cup dal + 1 cup mixed vegetables + 1 bowl cucumber raita</p>
          <span className="nutrition-meal-calories">~420 Calories</span>
        </div>
      </div>

      <div className="nutrition-meal-card">
        <div className="nutrition-meal-time">4 PM</div>
        <div className="nutrition-meal-card-content">
          <h4>Evening Snack</h4>
          <p>1 cup green tea + 2 multigrain biscuits</p>
          <span className="nutrition-meal-calories">~120 Calories</span>
        </div>
      </div>

      <div className="nutrition-meal-card">
        <div className="nutrition-meal-time">7:30 PM</div>
        <div className="nutrition-meal-card-content">
          <h4>Dinner</h4>
          <p>Grilled chicken/fish (100g) + 1 cup sautéed vegetables + 1 small bowl salad</p>
          <span className="nutrition-meal-calories">~350 Calories</span>
        </div>
      </div>
    </div>
  </section>
);

const ComingSoonNutrition = () => (
  <section className="nutrition-coming-soon">
    <div className="nutrition-coming-soon-badge">ROADMAP</div>
    <div className="nutrition-coming-soon-header">
      <div className="nutrition-coming-soon-icon">
        <Hourglass size={32} />
      </div>
      <div>
        <h3>Coming Soon: Advanced AI Features</h3>
        <p style={{ color: '#64748B', marginTop: '4px' }}>We're building the future of nutrition tracking</p>
      </div>
    </div>
    
    <div className="nutrition-coming-soon-intro">
      <strong>Currently, we provide complete expert-verified diet charts and personalized meal plans.</strong> 
      Our team of nutritionists manually creates these plans for you. In our next phase, we'll introduce AI-powered tracking:
    </div>

    <div className="nutrition-future-features">
      <div className="nutrition-feature-item">
        <div className="nutrition-feature-item-icon">
          <Camera size={24} />
        </div>
        <h4>Food Photo Logging</h4>
        <p>Snap a picture of your meal, and our AI will track calories and macros automatically.</p>
      </div>

      <div className="nutrition-feature-item">
        <div className="nutrition-feature-item-icon">
          <BarChart3 size={24} />
        </div>
        <h4>Real-time Analytics</h4>
        <p>See live charts of your nutrition intake vs goals directly on your dashboard.</p>
      </div>

      <div className="nutrition-feature-item">
        <div className="nutrition-feature-item-icon">
          <RefreshCw size={24} />
        </div>
        <h4>Auto Adjustment</h4>
        <p>AI adjusts your plan dynamically based on your daily activity and metabolic progress.</p>
      </div>
    </div>

    <div className="nutrition-roadmap-note">
      Focus on your diet chart for now. Automated tracking and AI features will be seamlessly integrated into your current plan soon!
    </div>
  </section>
);

const NutritionCTA = () => {
  const navigate = useNavigate();
  return (
    <section className="nutrition-cta">
      <h2>Ready to Start Your Nutrition Journey?</h2>
      <p className="nutrition-cta-text">
        Get your personalized diet chart created by certified nutritionists. No complex tracking needed right now - just follow the professional plan we design for you!
      </p>
      <button 
        className="nutrition-cta-button" 
        onClick={() => navigate('/get-started')}
      >
        <CalendarCheck size={24} />
        Get Your Custom Diet Plan
      </button>
      <div className="nutrition-cta-steps">
        Complete assessment → Expert review → Personalized chart → Achieve goals
      </div>
    </section>
  );
};

export default function Nutrition() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="nutrition-page-wrapper">
      <Navbar onGetStarted={() => navigate('/get-started')} />
      
      <div className="nutrition-container">
        <NutritionHero />
        <div className="nutrition-content-card">
          <NutritionServices />
          <SampleDietChart />
          <ComingSoonNutrition />
        </div>
        <NutritionCTA />
      </div>

      {/* Footer is placed outside the container for full-width styling */}
     
    </div>
  );
}