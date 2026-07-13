// src/pages/Careers.js
import React from 'react';
import { FaGlobeAmericas, FaClock, FaHeart, FaRocket, FaUsers, FaLightbulb, FaHandsHelping } from 'react-icons/fa';
import './Careers.css';

const Careers = () => {
  const cultureValues = [
    {
      icon: <FaRocket />,
      title: "Move Fast, Build Real",
      desc: "We're an early-stage startup — every person here shapes the product, not just executes on it."
    },
    {
      icon: <FaLightbulb />,
      title: "Ownership Over Instructions",
      desc: "We look for people who spot problems and fix them, not people waiting to be told what to do."
    },
    {
      icon: <FaUsers />,
      title: "Small Team, Big Trust",
      desc: "No layers, no red tape. Your ideas reach decision-makers directly."
    },
    {
      icon: <FaHandsHelping />,
      title: "Growth Alongside the Company",
      desc: "As Lernevo grows, so does your scope. Early team members shape what comes next."
    }
  ];

  return (
    <div className="careers-page">
      {/* Hero Section */}
      <section className="careers-hero">
        <div className="container">
          <h1>Join the Lernevo Mission</h1>
          <p>Help us transform holistic well-being through AI-powered solutions.</p>
        </div>
      </section>

      {/* Why Join Us - Based on Handbook Policies */}
      <section className="benefits-section container">
        <div className="section-header">
          <h2>Why Join Lernevo?</h2>
        </div>
        <div className="benefits-grid">
          <div className="benefit-card">
            <FaGlobeAmericas className="benefit-icon" />
            <h3>Remote-First</h3>
            <p>Work from your chosen location with full flexibility.</p>
          </div>
          <div className="benefit-card">
            <FaClock className="benefit-icon" />
            <h3>Stability</h3>
            <p>Fixed-term one-year contracts for mutual commitment.</p>
          </div>
          <div className="benefit-card">
            <FaHeart className="benefit-icon" />
            <h3>Generous Leave</h3>
            <p>12 days of Casual Leave and 12 days of Sick Leave per annum.</p>
          </div>
        </div>
      </section>

      {/* Our Culture & Vision - Replaces fake job listings */}
      <section className="culture-section container">
        <h2>Our Culture & Vision</h2>
        <p className="culture-intro">
          We're a growing startup and aren't actively hiring right now — but we're always
          building the kind of team we'd want to work with.
        </p>
        <div className="culture-grid">
          {cultureValues.map((item, index) => (
            <div key={index} className="culture-card">
              <div className="culture-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="culture-closing">
          <p>
            Not hiring at the moment, but always excited to connect with passionate people.
            Follow our journey and check back as we grow.
          </p>
        </div>
      </section>
    </div>
  );
};


export default Careers;