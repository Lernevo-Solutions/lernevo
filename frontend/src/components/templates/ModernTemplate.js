import React from 'react';
import './template.css';

const ModernTemplate = ({ data }) => {
  const { personal, experience, education, skills } = data;
  return (
    <div className="resume-card modern">
      <div className="modern-header"></div>
      <div className="resume-content">
        <h1 className="resume-name">{personal.name || 'Your Name'}</h1>
        <p className="resume-title">{personal.title || 'Job Title'}</p>
        <p className="resume-summary">{personal.summary || 'Professional summary...'}</p>
        
        <hr className="divider" />
        
        <section className="resume-section">
          <h2>Experience</h2>
          {experience.map((exp, idx) => (
            <div key={idx} className="resume-item">
              <div className="item-header">
                <span className="item-title">{exp.company || 'Company'}</span>
                <span className="item-date">{exp.startDate} – {exp.endDate}</span>
              </div>
              <p className="item-subtitle">{exp.position || 'Position'}</p>
              <p className="item-description">{exp.description || 'Description...'}</p>
            </div>
          ))}
        </section>

        <section className="resume-section">
          <h2>Education</h2>
          {education.map((edu, idx) => (
            <div key={idx} className="resume-item">
              <div className="item-header">
                <span className="item-title">{edu.school || 'School'}</span>
                <span className="item-date">{edu.startDate} – {edu.endDate}</span>
              </div>
              <p className="item-subtitle">{edu.degree} {edu.field}</p>
            </div>
          ))}
        </section>
/*---------------------------*/
        <section className="resume-section">
          <h2>Skills</h2>
          <div className="skills-list">
            {skills.map((skill, idx) => (
              <span key={idx} className="skill-badge">{skill}</span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ModernTemplate;