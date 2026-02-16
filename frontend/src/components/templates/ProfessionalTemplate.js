import React from 'react';
import './template.css';

const ProfessionalTemplate = ({ data }) => {
  const { personal, experience, education, skills } = data;
  return (
    <div className="resume-card professional">
      <div className="professional-sidebar">
        <h2 className="sidebar-name">{personal.name || 'Your Name'}</h2>
        <p className="sidebar-title">{personal.title || 'Job Title'}</p>
        <hr className="sidebar-divider" />
        <div className="sidebar-contact">
          <p><i className="fas fa-envelope"></i> {personal.email || 'email@example.com'}</p>
          <p><i className="fas fa-phone"></i> {personal.phone || '+1 234 567 890'}</p>
        </div>
        <hr className="sidebar-divider" />
        <h3>Skills</h3>
        <div className="sidebar-skills">
          {skills.map((skill, idx) => (
            <span key={idx} className="sidebar-skill">{skill}</span>
          ))}
        </div>
      </div>
      <div className="professional-main">
        <section className="professional-section">
          <h2>Summary</h2>
          <p>{personal.summary || 'Professional summary...'}</p>
        </section>
        /*---------------------------*/
        <section className="professional-section">
          <h2>Experience</h2>
          {experience.map((exp, idx) => (
            <div key={idx} className="professional-item">
              <div className="professional-item-header">
                <span className="professional-item-title">{exp.position || 'Position'}</span>
                <span className="professional-item-date">{exp.startDate} – {exp.endDate}</span>
              </div>
              <p className="professional-item-company">{exp.company || 'Company'}</p>
              <p className="professional-item-desc">{exp.description || 'Description...'}</p>
            </div>
          ))}
        </section>
        <section className="professional-section">
          <h2>Education</h2>
          {education.map((edu, idx) => (
            <div key={idx} className="professional-item">
              <div className="professional-item-header">
                <span className="professional-item-title">{edu.degree} {edu.field}</span>
                <span className="professional-item-date">{edu.startDate} – {edu.endDate}</span>
              </div>
              <p className="professional-item-company">{edu.school || 'School'}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default ProfessionalTemplate;