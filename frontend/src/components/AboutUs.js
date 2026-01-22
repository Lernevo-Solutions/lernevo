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
    "We build intelligent wellness solutions by pushing boundaries. Our technology adapts and evolves continuously. Innovation drives every AI-powered feature we create.",

    points: [
      "AI-driven personalization for every user",
      "Smart insights powered by real data",
      "Continuous learning systems",
      "Future-ready scalable architecture",
      "Innovation focused on real impact",
    ],
    color: "#3b82f6",
  },

  {
    id: 1,
    image: holisticimage,
    title: "Holistic Wellness",
    description:
      "True wellness goes beyond physical fitness alone. We focus on balancing the mind, body, and lifestyle together. This integrated approach supports long-term and sustainable wellbeing.",
    points: [
      "Mind and body balance",
      "Lifestyle-focused wellness planning",
      "Mental wellbeing integration",
      "Healthy habit formation",
      "Long-term sustainable transformation",
    ],
    color: "#10b981",
  },

  {
    id: 2,
    image: communityimage,
    title: "Community",
    description:
      "Wellness grows stronger when people connect. Progress becomes easier through shared motivation and support. We build communities that inspire, uplift, and empower.",
    points: [
      "Group challenges for motivation",
      "Shared goals and milestones",
      "Social accountability support",
      "Positive peer encouragement",
      "Celebrating success together",
    ],
    color: "#8b5cf6",
  },

  {
    id: 3,
    image: integrityimage,
    title: "Integrity",
    description:
      "Trust is the foundation of everything we build. We act with honesty, transparency, and responsibility. User confidence always comes first in our decisions.",
    points: [
      "Transparent and honest practices",
      "Strong data privacy protection",
      "Ethical product decisions",
      "User-first responsibility",
      "Clear and open communication",
    ],
    color: "#f59e0b",
  },

  {
    id: 4,
    image: growthimage,
    title: "Growth",
    description:
      "Wellness is a continuous journey, not a destination. Growth happens through consistent progress over time. We focus on improvement rather than perfection.",
    points: [
      "Continuous personal improvement",
      "Progress tracking and insights",
      "Adaptive AI guidance",
      "Overcoming wellness plateaus",
      "Evolving goals and routines",
    ],
    color: "#ef4444",
  },

  {
    id: 5,
    image: empathyimage,
    title: "Empathy",
    description:
      "Every wellness journey is unique and personal. We design with compassion and deep understanding. Empathy guides every experience we create.",
    points: [
      "Human-centered design approach",
      "Inclusive and accessible experiences",
      "Real user-driven improvements",
      "Emotional wellbeing focus",
      "Compassion in every interaction",
    ],
    color: "#ec4899",
  },
];



  return (
    <div className="lernevo-about brand-background">
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
  <li>✔ Smart insights driven by real-time data & behavior</li>

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
    daily lifestyle.
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
<div 
  className="values-display"
  style={{ 
    // Uses the color from your values array with a very light opacity (15 in hex)
    backgroundColor: `${values[activeValue].color}15`, 
    borderLeft: `6px solid ${values[activeValue].color}`,
    transition: "background-color 0.5s ease, border-color 0.5s ease" 
  }}
>
  {/* The key={activeValue} is the "secret sauce" that restarts the animation on every click */}
  <div className="active-value-display" key={activeValue}>

    <span 
      className="value-badge"
      style={{ 
        backgroundColor: values[activeValue].color, 
        color: "#fff" 
      }}
    >
      Our Values
    </span>

    <h3 style={{ color: values[activeValue].color }}>
      {values[activeValue].title}
    </h3>

    <p className="active-description">
      {values[activeValue].description}
    </p>

    <ul className="value-points">
      {values[activeValue].points.map((point, i) => (
        <li key={i} style={{ "--bullet-color": values[activeValue].color }}>
          {point}
        </li>
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