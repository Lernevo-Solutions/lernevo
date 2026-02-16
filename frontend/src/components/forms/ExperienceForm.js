import React from 'react';
import './FormStyles.css';

const ExperienceForm = ({ data = [], onChange }) => {
  const addExperience = () => {
    onChange([
      ...data,
      { company: '', position: '', startDate: '', endDate: '', description: '' }
    ]);
  };

  const removeExperience = (index) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateExperience = (index, field, value) => {
    const newData = [...data];
    newData[index][field] = value;
    onChange(newData);
  };

  const generateDescription = (index) => {
    const desc = "Led cross-functional teams to deliver high-quality software on schedule. Improved system performance by 30% through optimization.";
    updateExperience(index, 'description', desc);
  };

  return (
    <div className="form-section">
      <h3>Experience</h3>
      {data.map((exp, index) => (
        <div key={index} className="experience-item">
          <div className="form-group">
            <label>Company</label>
            <input
              type="text"
              value={exp.company}
              onChange={(e) => updateExperience(index, 'company', e.target.value)}
              placeholder="Company name"
            />
          </div>
          <div className="form-group">
            <label>Position</label>
            <input
              type="text"
              value={exp.position}
              onChange={(e) => updateExperience(index, 'position', e.target.value)}
              placeholder="Job title"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="text"
                value={exp.startDate}
                onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                placeholder="YYYY"
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="text"
                value={exp.endDate}
                onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                placeholder="YYYY or Present"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={exp.description}
              onChange={(e) => updateExperience(index, 'description', e.target.value)}
              rows="3"
              placeholder="Describe your role..."
            />
          </div>
          <div className="button-group">
            <button type="button" className="btn-ai" onClick={() => generateDescription(index)}>
              ✨ AI Generate
            </button>
            <button type="button" className="btn-remove" onClick={() => removeExperience(index)}>
              Remove
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="btn-add" onClick={addExperience}>
        + Add Experience
      </button>
    </div>
  );
};

export default ExperienceForm;