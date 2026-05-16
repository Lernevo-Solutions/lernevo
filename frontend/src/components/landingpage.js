// src/components/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { Dumbbell, Apple, Moon, Award } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import './LandingPage.css';
import Navbar from './Navbar';
import Hero from './Hero';
import GetStartedFlow from './GetStartedFlow';

import aiImg from "./ai powerd.png";
import mentalImg from "./health.png";
import fitnessImg from "./fit.png";
import nutritionImg from "./nut.png";
import learningImg from "./learnings.png";
import trainerImg from "./trainer.png";
import b5 from "./b5.png";
import b1 from "./b1.png";
import b2 from "./b2.png";
import b3 from "./b3.png";
import b4 from "./b4.png";
import b7 from "./b7.png";

import learImg from "./sign.png";
import aiiImg from "./analyse.png";
import fitnesImg from "./guidance.png";
import trainersImg from "./imp.png";
import workImg from "./works.png";
import { FaHandsHelping } from "react-icons/fa";       // Understand User Needs
import { BiCpu } from "react-icons/bi"; // AI / computer processing
import { FaRobot } from "react-icons/fa"; // classic AI / robot sgap-icon
import { FaChalkboardTeacher } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa";
import { MdHealthAndSafety } from "react-icons/md";
import gymImg from "./gym.png";
import g1 from "./gym1.png";
import g2 from "./gym2.png";
import g3 from "./gym3.png"; 
import g4 from "./gym4.png";
import g5 from "./gym5.png";
import g6 from "./gym6.png";
import g7 from "./gym7.png";
import g8 from "./gym8.png";
import g9 from "./gym9.png";
import g10 from "./gym10.png";
import g11 from "./gym11.png";

import { FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import insightimg from "./in.png";
import guidanceimg from "./del.png";
import improveimg from "./track.png";
import userimg from "./needs.png";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend);



const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState("daily");
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false);

  // Hero Image Logic
  const heroImages = [
    "/assets/hero/hero1.jpg",
    "/assets/hero/hero2.jpg",
    "/assets/hero/hero3.jpg",
    "/assets/hero/hero4.jpg"
  ];
  const [heroImage, setHeroImage] = useState("");

  useEffect(() => {
    // Randomly select one image on mount
    const randomImg = heroImages[Math.floor(Math.random() * heroImages.length)];
    setHeroImage(randomImg);

    // Handle hash scrolling on mount
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);


  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'performance', 'services', 'how-it-works'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            // Section sgap-active in viewport
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing with ${email}! We'll contact you soon.`);
      setEmail('');
    }
  };
  const weeklyBarData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Workout Minutes",
        data: [40, 55, 50, 60, 45, 70, 65],
        backgroundColor: [
          "#bfdbfe",
          "#93c5fd",
          "#60a5fa",
          "#3b82f6",
          "#60a5fa",
          "#2563eb",
          "#1e40af"
        ],
        borderRadius: 10,
        barThickness: 35
      }
    ]
  };
  const weeklyBarOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Weekly Workout Overview",
        font: { size: 16 }
      }
    },
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        grid: { color: "#e5e7eb" }
      }
    }
  };


  return (
    <div className="lernevo-landing brand-background">
      {/* ========== Navigation ========== */}
      <Navbar onGetStarted={() => navigate('/get-started')} />

      <Hero heroImage={heroImage} onGetStarted={() => navigate('/get-started')} />

      <GetStartedFlow isOpen={isGetStartedOpen} onClose={() => setIsGetStartedOpen(false)} />
     <div className="wellness-layout-wrapper">
  
  {/* Left Sidebar Ad */}
  <div className="side-ad left-ad">
    <div className="ad-track move-down">
      <img src={gymImg} alt="Ad" />
      <img src={g3} alt="Ad" />
      <img src={g4} alt="Ad" />
      <img src={g5} alt="Ad" />
      <img src={g6} alt="Ad" />
      <img src={g7} alt="Ad" />
      <img src={g8} alt="Ad" />
      <img src={g9} alt="Ad" />   
      <img src={g10} alt="Ad" />
      <img src={g11} alt="Ad" />
      {/* Duplicate for seamless loop */}
      <img src={gymImg} alt="Ad" />
    </div>
  </div>

  {/* Right Sidebar Ad */}
  <div className="side-ad right-ad">
    <div className="ad-track move-up">
      <img src={g2} alt="Ad" />
      <img src={g3} alt="Ad" />
      <img src={g1} alt="Ad" />
       <img src={g4} alt="Ad" />
      <img src={g5} alt="Ad" />
      <img src={g6} alt="Ad" />
      <img src={g7} alt="Ad" />
      <img src={g8} alt="Ad" />
      <img src={g9} alt="Ad" />   
      <img src={g10} alt="Ad" />
      <img src={g11} alt="Ad" />
      {/* Duplicate for seamless loop */}
      <img src={g2} alt="Ad" />
    </div>
  </div>
      {/* ========== Performance Dashboard Section (Moved Here) ========== */}
      <section id="performance" className="performance-dashboard-section">
        <div className="sgap-container">

          {/* Header */}
          <div className="sgap-section-header">
            <h2 className="sgap-section-title">Performance Dashboard</h2>
            <p className="section-subtitle">
              Monitor your daily, weekly & monthly wellness performance
            </p>
          </div>

          {/* Tabs */}
          <div className="performance-tabs">
            <button
              className={`tab-btn ${activeTab === "daily" ? "sgap-active" : ""}`}
              onClick={() => setActiveTab("daily")}
            >
              Daily
            </button>
            <button
              className={`tab-btn ${activeTab === "weekly" ? "sgap-active" : ""}`}
              onClick={() => setActiveTab("weekly")}
            >
              Weekly
            </button>
            <button
              className={`tab-btn ${activeTab === "monthly" ? "sgap-active" : ""}`}
              onClick={() => setActiveTab("monthly")}
            >
              Monthly
            </button>
            <button
              className={`tab-btn ${activeTab === "diary" ? "sgap-active" : ""}`}
              onClick={() => setActiveTab("diary")}
            >
              Progress Diary
            </button>
          </div>

          {/* ================= DAILY ================= */}
          {activeTab === "daily" && (
            <div className="performance-metrics-grid">

              {/* Workout */}
              <div className="metric-box">
                <h3>Workout Progress</h3>
                <div className="metric-value">45 min</div>
                <p>Calories Burned: <strong>420</strong></p>
                <div className="progress-bar">
                  <div className="sgap-progress-fill" style={{ width: "85%" }} />
                </div>
                <span>Weekly Goal: 85%</span>
              </div>

              {/* Fitness */}


              {/* Nutrition */}
              <div className="metric-box">
                <h3>Nutrition</h3>
                <div className="metric-value">2150 / 2500 cal</div>
                <div className="progress-bar">
                  <div className="sgap-progress-fill" style={{ width: "86%" }} />
                </div>
                <p>Protein: 45g • Carbs: 250g • Fat: 65g</p>
              </div>


              {/* Learning Progress */}
              <div className="metric-box">
                <h3>Learning Progress</h3>
                <div className="metric-value">78%</div>
                <p>Focus Time: 3h • Practice Time: 1h 15m</p>
                <p>AI Feedback: <strong>Excellent</strong></p>
              </div>


            </div>
          )}

          {/* ================= WEEKLY ================= */}
          {activeTab === "weekly" && (
            <div className="weekly-dashboard">

              {/* LEFT: Graph Card */}
              <div className="weekly-graph-card">
                <h3 className="card-title">Weekly Activity</h3>
                <Bar data={weeklyBarData} options={weeklyBarOptions} />
              </div>

              {/* RIGHT: Side Content */}
              <div className="weekly-side-cards">

                <div className="side-card">
                  <h4>Active Days</h4>
                  <p><strong>5 / 7</strong></p>
                </div>

                <div className="side-card">
                  <h4>Total Calories</h4>
                  <p><strong>2,900 kcal</strong></p>
                </div>

                <div className="side-card">
                  <h4>Avg Workout</h4>
                  <p><strong>55 min</strong></p>
                </div>

              </div>
            </div>
          )}




          {/* ================= MONTHLY ================= */}
          {activeTab === "monthly" && (
            <div className="monthly-grid">

              <div className="monthly-card">
                <div className="monthly-icon workout">
                  <Dumbbell size={26} />
                </div>
                <h4>Workouts</h4>
                <h2>22</h2>
                <p>Sessions completed this month</p>
              </div>

              <div className="monthly-card">
                <div className="monthly-icon nutrition">
                  <Apple size={26} />
                </div>
                <h4>Nutrition</h4>
                <h2>88%</h2>
                <p>Meal plan adherence</p>
              </div>

              <div className="monthly-card">
                <div className="monthly-icon sleep">
                  <Moon size={26} />
                </div>
                <h4>Sleep</h4>
                <h2>85%</h2>
                <p>Consistent sleep routine</p>
              </div>

              <div className="monthly-card">
                <div className="monthly-icon sgap-badge">
                  <Award size={26} />
                </div>
                <h4>Achievements</h4>
                <h2>6</h2>
                <p>Badges earned</p>
              </div>

            </div>
          )}
          {/* ================= PROGRESS DIARY ================= */}
          {activeTab === "diary" && (
            <div className="progress-diary">
              <h3>Your Progress Diary</h3>

              <div className="diary-entry">
                <span className="diary-date">Today</span>
                <p>45 min workout • Calories on track • Slept 8h 42m</p>
                <p className="motivation">🌟 Keep pushing! Every workout counts.</p>
              </div>

              <div className="diary-entry">
                <span className="diary-date">Yesterday</span>
                <p>Stress level sgap-low • Cardio session completed</p>
                <p className="motivation">Consistency is your superpower!</p>
              </div>

              <div className="diary-entry">
                <span className="diary-date">2 Days Ago</span>
                <p>Clean eating day • Early bedtime</p>
                <p className="motivation">Small steps lead to big results.</p>
              </div>
            </div>
          )}



        </div>
      </section>


      {/* ========== Services Section ========== */}
      <section id="services" className="services-section">
            <div className="services-inner">

  


        <div className="sgap-container">
          <div className="sgap-section-header">
            <h2 className="sgap-section-title">Our Wellness Services</h2>
            <p className="section-subtitle">Comprehensive wellness solutions tailored to your needs</p>
          </div>

          <div className="services-grid">
            <div className="service-card">

              {/* TOP IMAGE */}
              <div className="service-card-top">
                <img src={aiImg} alt="AI Powered Coaching" />
              </div>

              {/* BOTTOM CONTENT (always visible) */}
              <div className="service-card-bottom">
                <h4>AI-Powered Coaching</h4>
              </div>

              {/* FULL HOVER OVERLAY */}
              <div className="service-card-hover">
                <h3>AI-Powered Coaching</h3>
                <p>
                  Smart AI that tracks your fitness, nutrition, and mental wellness daily.
                </p>

                <div className="hover-points">
                  <span>Tracks daily fitness activity</span>
                  <span>Personalized nutrition guidance</span>
                  <span>Mental wellness insights</span>
                  <span>Adaptive AI plans</span>
                  <span>Motivation & consistency</span>
                </div>
              </div>

            </div>
            <div className="service-grid">
              <div className="service-card">

                {/* TOP IMAGE */}
                <div className="service-card-top">
                  <img src={nutritionImg} alt="Nutrition Planning" />
                </div>


                {/* TITLE BELOW IMAGE */}
                <div className="service-card-bottom">
                  <h3>Nutrition Planning</h3>
                </div>

                {/* FULL HOVER OVERLAY */}
                <div className="service-card-hover">
                  <h3>Nutrition Planning</h3>
                  <p>
                    Tailored meal plans and dietary strategies for your health goals.
                  </p>

                  <div className="hover-points">
                    <span>Custom weekly meal plans</span>
                    <span>Calorie & macronutrient guidance</span>
                    <span>Healthy recipe suggestions</span>
                    <span>Smart grocery shopping tips</span>
                    <span>Track your nutrition habits</span>
                  </div>
                </div>

              </div>
            </div>

            <div className="service-card">

              {/* TOP IMAGE */}
              <div className="service-card-top">
                <img src={fitnessImg} alt="Fitness Programs" />
              </div>


              <div className="service-card-bottom">
                <h3>Fitness Programs</h3>
              </div>

              {/* FULL HOVER OVERLAY */}
              <div className="service-card-hover">
                <h3>Fitness Programs</h3>
                <p>
                  Structured workouts for all levels to maximize your sgap-results efficiently.
                </p>

                <div className="hover-points">
                  <span>Adaptive exercise routines</span>
                  <span>Video tutorials and guidance</span>
                  <span>Monitor performance & progress</span>
                  <span>Form correction tips</span>
                  <span>Daily motivation reminders</span>
                </div>
              </div>


            </div>
            <div className="service-card">

              <div className="service-card-top">
                <img src={learningImg} alt="Learning" />
              </div>

              <div className="service-card-bottom">
                <h3>Learning</h3>
              </div>
              <div className="service-card-hover">
                <h3>Learning</h3>
                <p>
                  Personalized AI-powered learning paths to boost your skills effectively.
                </p>
                <div className="hover-points">
                  <span>Customized learning journeys</span>
                  <span>Track sgap-skill development</span>
                  <span>Daily learning challenges</span>
                  <span>Actionable improvement tips</span>
                  <span>Boost knowledge & productivity</span>
                </div>
              </div>

            </div>

            <div className="service-card">

              <div className="service-card-top">
                <img src={mentalImg} alt="Mental Health" />
              </div>

              <div className="service-card-bottom">
                <h3>Mental Health Support</h3>
              </div>
              <div className="service-card-hover">
                <h3>Mental Health Support</h3>
                <p>
                  Tools and exercises to maintain emotional balance and manage stress.
                </p>
                <div className="hover-points">
                  <span>Mindfulness and meditation practices</span>
                  <span>Stress management techniques</span>
                  <span>Track moods and triggers</span>
                  <span>Daily emotional support tips</span>
                  <span>AI-assisted guidance for wellness</span>
                </div>
              </div>

            </div>

            <div className="service-card">

              <div className="service-card-top">
                <img src={trainerImg} alt="Trainer & Coach" />
              </div>

              <div className="service-card-bottom">
                <h3>Trainer & Coach</h3>
              </div>
              <div className="service-card-hover">
                <h3>Trainer & Coach</h3>
                <p>
                  Access guidance from AI-powered trainers and professional coaches.
                </p>
                <div className="hover-points">
                  <span>Custom coaching plans</span>
                  <span>Daily exercise guidance</span>
                  <span>Motivation and accountability tips</span>
                  <span>Track your training progress</span>
                  <span>Receive actionable feedback</span>
                </div>
              
    
              </div>
            </div>

          </div>
                    
 

     </div>
        </div>
      </section>

      {/* ========== How Lernevo Works (Image Style Layout) ========== */}
      <section id="how-it-works" className="how-lernevo-works">
        <div className="sgap-container how-works-wrapper">

          {/* LEFT CONTENT */}
          <div className="how-works-left">
            <h2>How Lernevo Works</h2>
            <p className="how-desc">
              Lernevo combines AI intelligence with human expertise to guide you
              through sgap-a personalized wellness journey — body, mind, and lifestyle.
            </p>

            <p className="how-desc">
              From assessment to daily guidance and progress tracking, everything
              is designed to help you improve consistently and sustainably.
            </p>
            <p className="how-desc">
              Lernevo learns from you every day — adapting to your habits, progress,
              and challenges. Smart insights turn effort into results, while gentle
              guidance keeps you motivated and moving forward.
            </p>

          </div>

          {/* RIGHT IMAGE - WITH HOVER EFFECT */}
          <div className="how-works-right">
            {/* Image Container with Hover Effect */}
            <div className="image-hover-container">
              {/* Main Image */}
              <img
                src={workImg}
                alt="Lernevo Team"
                className="main-image"
              />
            </div>
          </div>

        </div>
        {/* CARDS HEADING */}
        <div className="sgap-container how-works-cards">
          <h3 className="cards-only-heading">Our Approach</h3>
        </div>
        {/* BOTTOM CARDS - WITH HOVER EFFECTS */}
        <div className="sgap-container how-works-cards">

          {/* CARD 1 */}
          <div className="hover-full-card">
            <div className="card-top">
              <img src={userimg} alt="Understand User Needs" />
            </div>

            <div className="card-bottom">
              <h4>Understand User Needs</h4>
            </div>

            <div className="card-hover-full">
              <h4>Personal Assessment</h4>
              <p>
                We deeply analyze your goals, habits, and lifestyle preferences to
                design sgap-a wellness plan that perfectly fits your daily routine and
                long-term vision.
              </p>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="hover-full-card">
            <div className="card-top">
              <img src={insightimg} alt="AI Powered Insights" />
            </div>

            <div className="card-bottom">
              <h4>AI-Powered Insights</h4>
            </div>

            <div className="card-hover-full">
              <h4>Smart Analysis</h4>
              <p>
                Our advanced AI analyzes your data patterns and provides intelligent,
                actionable insights to improve your wellness sgap-results consistently.
              </p>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="hover-full-card">
            <div className="card-top">
              <img src={guidanceimg} alt="Daily Guidance" />
            </div>

            <div className="card-bottom">
              <h4>Deliver Guidance</h4>
            </div>

            <div className="card-hover-full">
              <h4>Daily Guidance</h4>
              <p>
                Receive clear step-by-step daily guidance for workouts, nutrition,
                mindfulness, and learning habits to stay consistent.
              </p>
            </div>
          </div>

          {/* CARD 4 */}
          <div className="hover-full-card">
            <div className="card-top">
              <img src={improveimg} alt="Track & Improve" />
            </div>

            <div className="card-bottom">
              <h4>Track & Improve</h4>
            </div>

            <div className="card-hover-full">
              <h4>Progress Tracking</h4>
              <p>
                Track improvements, celebrate milestones, and continuously optimize
                your wellness journey for sustainable success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Transform CTA – PILL STRIP STYLE ========== */}
      <section className="transform-section minimal">
        <div className="sgap-container">

          <div className="transform-header">
            <h2>
              Transform the way you <span>live healthier</span>
            </h2>

            <p className="primary-desc">
              Wellness shouldn’t feel complicated. Lernevo brings together
              intelligent guidance, personalized insights, and daily clarity
              to help you take control of your health with confidence.
            </p>
          </div>

          <div className="transform-actions">
            <button className="trial-btn" onClick={() => setIsGetStartedOpen(true)}>
              Start Your Free Trial
            </button>
          </div>

        </div>
      </section>
</div>

      
      

    </div>
  );
};

export default LandingPage;