import React from 'react';
import './template.css';

const MinimalTemplate = ({ data }) => {
  const { personal, experience, education, skills } = data;
  return (
    <div className="resume-card minimal">
      <h1 className="minimal-name">{personal.name || 'Your Name'}</h1>
      <p className="minimal-title">{personal.title || 'Job Title'}</p>
      <div className="minimal-contact">
        <span>{personal.email}</span> • <span>{personal.phone}</span>
      </div>
      <p className="minimal-summary">{personal.summary || 'Professional summary...'}</p>
      
      <hr className="minimal-divider" />
      /*---------------------------*/
      <section className="minimal-section">
        <h2>Experience</h2>
        {experience.map((exp, idx) => (
          <div key={idx} className="minimal-item">
            <div className="minimal-item-header">
              <span className="minimal-item-title">{exp.position || 'Position'}</span>
              <span className="minimal-item-date">{exp.startDate} – {exp.endDate}</span>
            </div>
            <p className="minimal-item-sub">{exp.company || 'Company'}</p>
            <p className="minimal-item-desc">{exp.description}</p>
          </div>
        ))}
      </section>

      <section className="minimal-section">
        <h2>Education</h2>
        {education.map((edu, idx) => (
          <div key={idx} className="minimal-item">
            <div className="minimal-item-header">
              <span className="minimal-item-title">{edu.degree} {edu.field}</span>
              <span className="minimal-item-date">{edu.startDate} – {edu.endDate}</span>
            </div>
            <p className="minimal-item-sub">{edu.school}</p>
          </div>
        ))}
      </section>

      <section className="minimal-section">
        <h2>Skills</h2>
        <div className="minimal-skills">
          {skills.map((skill, idx) => (
            <span key={idx} className="minimal-skill">{skill}</span>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MinimalTemplate;