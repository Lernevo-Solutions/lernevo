// src/pages/Careers.js
import React from 'react';
import { FaGlobeAmericas, FaClock, FaHeart, FaUserTie } from 'react-icons/fa';
import './Careers.css';

const Careers = () => {
  const jobOpenings = [
    { title: "Senior AI Engineer", type: "Full-Time", location: "Remote" },
    { title: "Wellness Content Curator", type: "Full-Time", location: "Remote" },
    { title: "Certified Fitness Trainer", type: "Full-Time", location: "Remote" }
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

      {/* Current Openings */}
      <section className="openings-section container">
        <h2>Current Openings</h2>
        <div className="job-list">
          {jobOpenings.map((job, index) => (
            <div key={index} className="job-card">
              <div>
                <h3>{job.title}</h3>
                <p>{job.type} • {job.location}</p>
              </div>
              <button className="apply-btn">Apply Now</button>
            </div>
          ))}
        </div>
      </section>

      {/* Hiring Process Note */}
      <section className="process-note container">
        <p>* All offers are contingent upon background verification and a 3-month probation period.</p>
      </section>
    </div>
  );
};

export default Careers;