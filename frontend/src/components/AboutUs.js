// src/components/AboutUs.jsx
import React, { useState } from 'react';
import { FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaHeart, FaUsers, FaLightbulb, FaShieldAlt, FaRocket } from 'react-icons/fa';
import { MdHealthAndSafety, MdEmojiEvents, MdAccessibility } from 'react-icons/md';
import { GiGrowth, GiBrain } from 'react-icons/gi';
import Navbar from './Navbar';
import './AboutUs.css';
import worksImage from "./works.png";
// Import images (you'll need to add these to your project)
// You can use these placeholders or add your own images


const AboutUs = () => {
  const [activeValue, setActiveValue] = useState(0);

  // Our values data
  const values = [
    {
      id: 0,
      icon: <FaLightbulb />,
      title: "Innovation",
      description: "We constantly push boundaries to develop cutting-edge wellness solutions that leverage AI and technology.",
      details: "Our team of engineers and wellness experts work together to create tools that adapt and learn with you.",
      color: "#3b82f6"
    },
    {
      id: 1,
      icon: <MdHealthAndSafety />,
      title: "Holistic Wellness",
      description: "We believe in addressing mind, body, and spirit together for sustainable health transformation.",
      details: "From mental health tracking to physical fitness and nutritional guidance, we cover all aspects of wellness.",
      color: "#10b981"
    },
    {
      id: 2,
      icon: <FaUsers />,
      title: "Community",
      description: "Building supportive communities where users can share journeys and motivate each other.",
      details: "Our platform fosters connections through shared goals, group challenges, and social features.",
      color: "#8b5cf6"
    },
    {
      id: 3,
      icon: <FaShieldAlt />,
      title: "Integrity",
      description: "We operate with transparency, honesty, and ethical practices in all we do.",
      details: "Your data privacy and security are our top priorities. We're transparent about how we use your information.",
      color: "#f59e0b"
    },
    {
      id: 4,
      icon: <GiGrowth />,
      title: "Growth",
      description: "We're committed to helping you grow and evolve on your wellness journey.",
      details: "Our adaptive learning algorithms ensure your experience evolves as you make progress.",
      color: "#ef4444"
    },
    {
      id: 5,
      icon: <FaHeart />,
      title: "Empathy",
      description: "We design with the user at the center, understanding diverse needs and challenges.",
      details: "Every feature is created with real user feedback and tested for accessibility and usability.",
      color: "#ec4899"
    }
  ];

  

  return (
    <div className="lernevo-about">
      {/* Navigation */}
      <Navbar />
      
      {/* ========== Hero Section ========== */}
     {/* ========== Simple About Section ========== */}
{/* ========== Simple About Section ========== */}
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
        What drives Lernevo forward every day
      </p>
    </div>

    <div className="mission-vision-grid">

      {/* Mission */}
      <div className="mission-card">
        <div className="card-icon mission-icon">
          <MdHealthAndSafety />
        </div>
        <h3>Our Mission</h3>
        <p>
          To make wellness simple and accessible through AI-powered guidance
          that supports physical, mental, and lifestyle well-being.
        </p>
      </div>

      {/* Vision */}
      <div className="vision-card">
        <div className="card-icon vision-icon">
          <FaLightbulb />
        </div>
        <h3>Our Vision</h3>
        <p>
          To build a smarter wellness ecosystem where technology adapts to
          people and helps them live healthier, balanced lives.
        </p>
      </div>

    </div>
  </div>
</section>



      {/* ========== Our Values Section ========== */}
      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Core Values</h2>
            <p className="section-subtitle">The principles that guide every decision we make</p>
          </div>
          
          <div className="values-container">
            <div className="values-grid">
              {values.map((value, index) => (
                <div 
                  key={value.id} 
                  className={`value-card ${activeValue === index ? 'active' : ''}`}
                  onMouseEnter={() => setActiveValue(index)}
                  style={{ borderTopColor: value.color }}
                >
                  <div className="value-icon" style={{ color: value.color }}>
                    {value.icon}
                  </div>
                  <h4>{value.title}</h4>
                  <p className="value-description">{value.description}</p>
                  <div className="value-details">
                    <p>{value.details}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="values-display">
              <div className="active-value-display">
                <div className="active-icon" style={{ color: values[activeValue].color }}>
                  {values[activeValue].icon}
                </div>
                <h3>{values[activeValue].title}</h3>
                <p className="active-description">{values[activeValue].description}</p>
                <p className="active-details">{values[activeValue].details}</p>
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