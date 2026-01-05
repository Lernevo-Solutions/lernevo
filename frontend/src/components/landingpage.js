// src/components/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { Dumbbell, Apple, Moon, Award } from "lucide-react";
import './LandingPage.css';
import Navbar from './Navbar';
import logo from './logo.png';
import aiImg from "./ai powerd.png";
import mentalImg from "./mental health.png";
import fitnessImg from "./fit.png";
import nutritionImg from "./nutrition.png";
import learningImg from "./learn.png";
import trainerImg from "./trainer.png";
import b5 from "./b5.png";
import b1 from "./b1.png";
import b2 from "./b2.png";
import b3 from "./b3.png";
import b4 from "./b4.png";

import learImg from "./sign.png";
import aiiImg from "./analyse.png";
import fitnesImg from "./guidance.png";
import trainersImg from "./imp.png";
import workImg from "./work.png";
import { FaHandsHelping } from "react-icons/fa";       // Understand User Needs
import { BiCpu } from "react-icons/bi"; // AI / computer processing
import { FaRobot } from "react-icons/fa"; // classic AI / robot icon
import { FaChalkboardTeacher } from "react-icons/fa";
import {  FaChartLine } from "react-icons/fa";
import { MdHealthAndSafety } from "react-icons/md";

import { FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import insightimg from "./insight.png";
import guidanceimg from "./del.png";
import improveimg from "./track.png";
import userimg from "./user.png";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState("daily");
  const heroImages = [b1, b2, b3, b4, b5];
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
  const interval = setInterval(() => {
    setCurrentIndex((prevIndex) =>
      (prevIndex + 1) % heroImages.length
    );
  }, 4000); // 4 seconds ku oru image

  return () => clearInterval(interval);
}, []);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'performance', 'services', 'about'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

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
    <div className="lernevo-landing">
      {/* ========== Navigation ========== */}
      <Navbar />


      
      {/* ========== Hero Section (Your AI Wellness Companion) ========== */}
     <section
  id="home"
  className="hero-section"
  style={{
    backgroundImage: `url(${heroImages[currentIndex]})`
  }}
>

      <div className="hero-overlay"></div>

      <div className="container hero-container">

        {/* LEFT CONTENT */}
        <div className="hero-text-content">
       <h1 className="hero-main-title">
  <span
    className="highlight-text"
    style={{ color: 'blueviolet' }} // change this to whatever color you want
  >
    Your AI Wellness Companion
  </span>
</h1>

          <p className="hero-description">
  Seamlessly integrate fitness, nutrition, mental health, learning, and personalized AI guidance into your daily routine for a healthier, happier life.
</p>
          <button className="cta-btn primary-btn">
            Start Free Trial
          </button>
        </div>
      </div>
    </section>

      {/* ========== Performance Dashboard Section (Moved Here) ========== */}
      <section id="performance" className="performance-dashboard-section">
      <div className="container">

        {/* Header */}
        <div className="section-header">
          <h2 className="section-title">Performance Dashboard</h2>
          <p className="section-subtitle">
            Monitor your daily, weekly & monthly wellness performance
          </p>
        </div>

        {/* Tabs */}
        <div className="performance-tabs">
          <button
            className={`tab-btn ${activeTab === "daily" ? "active" : ""}`}
            onClick={() => setActiveTab("daily")}
          >
            Daily
          </button>
          <button
            className={`tab-btn ${activeTab === "weekly" ? "active" : ""}`}
            onClick={() => setActiveTab("weekly")}
          >
            Weekly
          </button>
          <button
            className={`tab-btn ${activeTab === "monthly" ? "active" : ""}`}
            onClick={() => setActiveTab("monthly")}
          >
            Monthly
          </button>
          <button
            className={`tab-btn ${activeTab === "diary" ? "active" : ""}`}
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
                <div className="progress-fill" style={{ width: "85%" }} />
              </div>
              <span>Weekly Goal: 85%</span>
            </div>

            {/* Fitness */}
           

            {/* Nutrition */}
            <div className="metric-box">
              <h3>Nutrition</h3>
              <div className="metric-value">2150 / 2500 cal</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "86%" }} />
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
      <div className="monthly-icon badge">
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
      <p>Stress level low • Cardio session completed</p>
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
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Wellness Services</h2>
            <p className="section-subtitle">Comprehensive wellness solutions tailored to your needs</p>
          </div>

          <div className="services-grid">
            <div className="service-card">

  <div className="service-image-box">
    <img src={aiImg} alt="AI Powered Coaching" />
  </div>

  <h3 className="service-title">AI-Powered Coaching</h3>

  <p className="service-description">
    Personalized recommendations that adapt to your progress and goals in real-time.
  </p>

  <ul className="service-features">
    <li>Daily wellness check-ins</li>
    <li>Adaptive workout plans</li>
    <li>Nutrition guidance</li>
    <li>Progress tracking</li>
  </ul>

</div>
                    <div className="service-card">

  <div className="service-image-box">
    <img src={nutritionImg} alt="Nutrition Planning" />
  </div>

  <h3 className="service-title">Nutrition Planning</h3>
  <p className="service-description">
    Custom meal plans and dietary guidance based on your goals.
  </p>
  <ul className="service-features">
    <li>Personalized meal plans</li>
    <li>Calorie tracking</li>
    <li>Recipe suggestions</li>
    <li>Grocery lists</li>
  </ul>

</div>
           
 <div className="service-card">

  <div className="service-image-box">
    <img src={fitnessImg} alt="Fitness Programs" />
  </div>

  <h3 className="service-title">Fitness Programs</h3>
  <p className="service-description">
    Custom workout routines for all fitness levels and goals.
  </p>
  <ul className="service-features">
    <li>Personalized workout plans</li>
    <li>Video demonstrations</li>
    <li>Progress analytics</li>
    <li>Form correction</li>
  </ul>

</div>
<div className="service-card">

  <div className="service-image-box">
    <img src={learningImg} alt="Learning" />
  </div>

  <h3 className="service-title">Learning</h3>
  <p className="service-description">
    Enhance your skills with AI-powered personalized learning.
  </p>

  <ul className="service-features">
    <li>Personalized learning paths</li>
    <li>Skill progress tracking</li>
    <li>Daily learning reminders</li>
    <li>AI-based improvement suggestions</li>
  </ul>

</div>

          <div className="service-card">

  <div className="service-image-box">
    <img src={mentalImg} alt="Mental Health" />
  </div>

  <h3 className="service-title">Mental Health Support</h3>
  <p className="service-description">
    Comprehensive mental wellness programs and emotional support.
  </p>
  <ul className="service-features">
    <li>Mindfulness meditation</li>
    <li>Stress management</li>
    <li>Mood tracking</li>
  </ul>

</div>     

          <div className="service-card">

  <div className="service-image-box">
    <img src={trainerImg} alt="Trainer & Coach" />
  </div>

  <h3 className="service-title">Trainer & Coach</h3>
  <p className="service-description">
    Get guidance from AI-powered trainers and expert coaches.
  </p>

  <ul className="service-features">
    <li>Personalized coaching plans</li>
    <li>Daily workout guidance</li>
    <li>Motivation & accountability</li>
    <li>Progress tracking</li>
  </ul>

</div>

          </div>
        </div>
      </section>

   {/* ========== How Lernevo Works (Image Style Layout) ========== */}
<section id="about" className="how-lernevo-works">
  <div className="container how-works-wrapper">

    {/* LEFT CONTENT */}
    <div className="how-works-left">
      <h2>How Lernevo Works</h2>
      <p className="how-desc">
        Lernevo combines AI intelligence with human expertise to guide you
        through a personalized wellness journey — body, mind, and lifestyle.
      </p>

      <p className="how-desc">
        From assessment to daily guidance and progress tracking, everything
        is designed to help you improve consistently and sustainably.
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

  {/* BOTTOM CARDS - WITH HOVER EFFECTS */}
<div className="container how-works-cards">

  {/* CARD 1 */}
  <div className="hover-full-card">
    <div className="card-top">
      <img src={userimg} alt="Understand User Needs" />
    </div>

    <div className="card-bottom">
      <h4>Understand User Needs</h4>
      <p>Personalized assessment based on your goals</p>
    </div>

    <div className="card-hover-full">
      <h4>Personal Assessment</h4>
      <p>
        We deeply analyze your goals, habits, and lifestyle preferences to
        design a wellness plan that perfectly fits your daily routine and
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
      <p>Smart AI-driven recommendations</p>
    </div>

    <div className="card-hover-full">
      <h4>Smart Analysis</h4>
      <p>
        Our advanced AI analyzes your data patterns and provides intelligent,
        actionable insights to improve your wellness results consistently.
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
      <p>Simple daily wellness actions</p>
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
      <p>Monitor progress and growth</p>
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
<section className="transform-pill-section">
  <div className="container">

    <div className="pill-header">
      <h2>
        Ready to <span>Elevate Your Wellness?</span>
      </h2>
      <p>
        Simple habits. Smart guidance. Real progress.
      </p>
    </div>

    {/* PILL STRIPS */}
    <div className="pill-row">
      <div className="pill-item">🤖 Personalized AI Coach</div>
      <div className="pill-item">📊 24/7 Health Tracking</div>
      <div className="pill-item">🧠 Expert-Backed Insights</div>
    </div>

    <div className="transform-actions">
  <button
    className="trial-btn"
    onClick={() => scrollToSection('services')}
  >
    Start Your Free Trial
  </button>
</div>


  </div>
</section>




  <footer className="footer-new">
  <div className="container">

    {/* TOP SECTION */}
    <div className="footer-top">

      {/* BRAND */}
      <div className="footer-brand">
        <p className="footer-desc">
          Your AI-powered wellness companion helping you build
          healthier habits across body, mind, and lifestyle.
        </p>

        <div className="footer-social">
          <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
            <FaTwitter />
          </a>
          <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
            <FaInstagram />
          </a>
          <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
            <FaLinkedin />
          </a>
          <a href="https://youtube.com" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
            <FaYoutube />
          </a>
        </div>
      </div>

      {/* LINKS */}
      <div className="footer-links">

        <div className="link-col">
          <h4>Product</h4>
          <a onClick={() => scrollToSection('services')}>AI Coaching</a>
          <a onClick={() => scrollToSection('services')}>Fitness</a>
          <a onClick={() => scrollToSection('services')}>Mental Wellness</a>
          <a onClick={() => scrollToSection('services')}>Nutrition</a>
        </div>

        <div className="link-col">
          <h4>Company</h4>
          <a onClick={() => scrollToSection('about')}>About</a>
          <a href="#">Careers</a>
          <a href="#">Blog</a>
          <a href="#">Contact</a>
        </div>

        <div className="link-col">
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>

        {/* NEW CONTACT US COLUMN */}
        <div className="link-col">
          <h4>Contact Us</h4>
          <p>Email: <a href="mailto:hello@lernevowellness.com">hello@lernevowellness.com</a></p>
          <p>Phone: <a href="tel:+15551234567">+1 555-123-4567</a></p>
          <p>Address: 123 Wellness Drive, Health City, HC 12345</p>
        </div>

      </div>
    </div>

    {/* BOTTOM */}
    <div className="footer-bottom">
      <p>
        © {new Date().getFullYear()} Lernevo Solutions. All rights reserved.
      </p>
    </div>

  </div>
</footer>

    </div>
  );
};

export default LandingPage;