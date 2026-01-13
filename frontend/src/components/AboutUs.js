// src/components/AboutUs.jsx
import React, { useState } from 'react';
import { FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaHeart, FaUsers, FaLightbulb, FaShieldAlt, FaRocket } from 'react-icons/fa';
import { MdHealthAndSafety, MdEmojiEvents, MdAccessibility } from 'react-icons/md';
import { GiGrowth, GiBrain } from 'react-icons/gi';
import Navbar from './Navbar';
import './AboutUs.css';
import worksImage from "./works.png";
import innovationImage from "./innovation.png";
import holisticimage from "./holistic.png";
import communityimage from "./community.png";
import integrityimage from "./integrity.png";
import growthimage from "./growth.png";
import empathyimage from "./empathy.png";
// Import images (you'll need to add these to your project)
// You can use these placeholders or add your own images


const AboutUs = () => {
  const [activeValue, setActiveValue] = useState(0);

  
const values = [
  {
    id: 0,
    image: innovationImage,
    title: "Innovation",
    description:
      "We constantly push boundaries to create intelligent, future-ready wellness solutions powered by AI and emerging technologies.",
    details:
      "By blending data science, behavioral psychology, and human-centered design, we build systems that continuously learn and improve with every interaction.",
    points: [
      "AI-driven personalization for every user",
      "Continuous improvement through real-time insights",
      "Future-ready architecture built for scalability",
    ],
    color: "#3b82f6",
  },
  {
    id: 1,
    image: holisticimage,
    title: "Holistic Wellness",
    description:
      "True wellness goes beyond fitness — we nurture the mind, body, and lifestyle together for lasting transformation.",
    details:
      "Our holistic approach integrates mental wellbeing, physical activity, nutrition, sleep, and habit formation into one seamless experience designed for long-term balance.",
    points: [
      "Mind, body, and lifestyle integration",
      "Focus on long-term sustainable habits",
      "Personalized plans for complete wellness",
    ],
    color: "#10b981",
  },
  {
    id: 2,
    image: communityimage,
    title: "Community",
    description:
      "Wellness thrives in connection, not isolation — we build communities that inspire, support, and uplift.",
    details:
      "Through shared challenges, group goals, and social accountability, our platform empowers users to grow together and celebrate progress collectively.",
    points: [
      "Group challenges to faster engagement",
      "Social accountability for consistent progress",
      "Celebrating achievements together",
    ],
    color: "#8b5cf6",
  },
  {
    id: 3,
    image: integrityimage,
    title: "Integrity",
    description:
      "Trust is the foundation of everything we build — we act with transparency, responsibility, and honesty.",
    details:
      "We follow strict ethical standards, ensure data privacy by design, and maintain clear communication so users always feel safe, informed, and respected.",
    points: [
      "Transparent practices in all operations",
      "Data privacy and security by design",
      "Ethical decision-making in every feature",
    ],
    color: "#f59e0b",
  },
  {
    id: 4,
    image: growthimage,
    title: "Growth",
    description:
      "Wellness is a journey of continuous progress — not a destination.",
    details:
      "Using adaptive AI models and personalized insights, we help users track improvements, overcome plateaus, and evolve their routines as their goals change.",
    points: [
      "Adaptive AI to guide personal growth",
      "Insights to overcome plateaus",
      "Evolving routines as goals change",
    ],
    color: "#ef4444",
  },
  {
    id: 5,
    image: empathyimage,
    title: "Empathy",
    description:
      "We design with compassion, deeply understanding the diverse challenges people face in their wellness journey.",
    details:
      "Every feature is shaped by real user stories, inclusive design principles, and continuous feedback to ensure accessibility, comfort, and emotional safety.",
    points: [
      "Design inspired by real user experiences",
      "Inclusive and accessible features",
      "Focus on emotional safety and comfort",
    ],
    color: "#ec4899",
  },
];



  return (
    <div className="lernevo-about">
      {/* Navigation */}
      <Navbar />
      
      {/* ========== Hero Section ========== */}
<section className="simple-about">
  <div className="container simple-about-wrapper">

    {/* LEFT CONTENT */}
    <div className="simple-about-content">
      <h1>
        About <span>Lernevo</span>
      </h1>

      <p className="about-tagline">
        Smarter wellness. Better living. Powered by AI.
      </p>

      <p>
        Lernevo is an AI-driven wellness platform built to help individuals
        take control of their health, focus, and personal growth — all from
        a single, intelligent ecosystem.
      </p>

      <p>
        Instead of using multiple apps, Lernevo brings fitness, nutrition,
        mental wellness, and learning together. Our AI understands your
        habits and delivers guidance that fits naturally into your daily life.
      </p>

      <ul className="about-points">
        <li>✔ AI-powered personalized wellness plans</li>
        <li>✔ One platform for body, mind & lifestyle</li>
        <li>✔ Simple, secure & designed for real people</li>
        <li>✔ Progress tracking that adapts as you grow</li>
      </ul>
    </div>

    {/* RIGHT IMAGE */}
    <div className="simple-about-image">
      <img src={worksImage} alt="About Lernevo" />
    </div>

  </div>
</section>


{/* ========== Mission & Vision Section ========== */}
<section className="mission-vision-section">
  <div className="container">

    <div className="section-header">
      <h2 className="section-title">Our Mission & Vision</h2>
      <p className="section-subtitle">
        What drives our purpose and shapes our future
      </p>
    </div>

    <div className="mission-vision-grid">

      {/* Mission */}
      <div className="mission-card">

        <div className="card-header">
          <div className="card-icon mission-icon">
            <MdHealthAndSafety />
          </div>
          <h3>Our Mission</h3>
        </div>

        <p>
          To simplify wellness using intelligent, AI-powered guidance that
          helps people improve their physical health, mental clarity, and
          daily lifestyle — consistently and sustainably.
        </p>

      </div>

      {/* Vision */}
      <div className="vision-card">

        <div className="card-header">
          <div className="card-icon vision-icon">
            <FaLightbulb />
          </div>
          <h3>Our Vision</h3>
        </div>

        <p>
          To create a future where technology understands people deeply
          and supports healthier, more balanced lives through personalized
          wellness experiences.
        </p>

      </div>

    </div>
  </div>
</section>




{/* ========== Our Values Section ========== */}
 <section className="values-section">
      <div className="container">

        <div className="section-header">
          <h2 className="section-title">Our Values</h2>
          <p className="section-subtitle">
            The principles that guide everything we build at Lernevo
          </p>
        </div>

        <div className="values-container">

          {/* LEFT SIDE – IMAGE CARDS */}
          <div className="values-grid">
            {values.map((value, index) => (
              <div
                key={value.id}
                className={`value-card ${activeValue === index ? "active" : ""}`}
                onClick={() => setActiveValue(index)}
              >
               <div className="value-card">
  <div className="value-img-wrapper full">
    <img
      src={value.image}
      alt={value.title}
      className="value-img"
    />
  </div>
</div>


                <h4>{value.title}</h4>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE – CONTENT */}
   <div className="values-display">
  <div className="active-value-display">

    <span className="value-badge">Our Value</span>

    <h3>{values[activeValue].title}</h3>

    <p className="active-description">
      {values[activeValue].description}
    </p>

    <p className="active-details">
      {values[activeValue].details}
    </p>

    {/* 🔥 POINTS SECTION */}
    <ul className="value-points">
      {values[activeValue].points.map((point, i) => (
        <li key={i}>{point}</li>
      ))}
    </ul>

  </div>
</div>


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
        <a
          className="twitter"
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaTwitter />
        </a>
      
        <a
          className="instagram"
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaInstagram />
        </a>
      
        <a
          className="linkedin"
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaLinkedin />
        </a>
      
        <a
          className="youtube"
          href="https://youtube.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaYoutube />
        </a>
      </div>
      
            </div>
      
           <div className="footer-top">
      
        {/* PRODUCT */}
        <div className="link-col">
          <h4>Product</h4>
          <a>AI Coaching</a>
          <a>Fitness</a>
          <a>Mental Wellness</a>
          <a>Nutrition</a>
        </div>
      
        {/* COMPANY */}
        <div className="link-col">
          <h4>Company</h4>
          <a>About</a>
          <a>Careers</a>
          <a>Blog</a>
          <a>Contact</a>
        </div>
      
        {/* SUPPORT */}
        <div className="link-col">
          <h4>Support</h4>
          <a>Help Center</a>
          <a>Privacy Policy</a>
          <a>Terms of Service</a>
          <a>Trust & Safety</a>
        </div>
      
        {/* BUSINESS ENQUIRY */}
        <div className="link-col">
          <h4>Business</h4>
          <a>Business Dashboard</a>
          <a>Partnerships</a>
          <a>Book a demo</a>
          <a>Enquire</a>
          
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

export default AboutUs;