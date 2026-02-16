import React from 'react';
import './FormStyles.css';

const SkillsForm = ({ data = [], onChange }) => {
  const addSkill = () => {
    onChange([...data, '']);
  };

  const removeSkill = (index) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateSkill = (index, value) => {
    const newData = [...data];
    newData[index] = value;
    onChange(newData);
  };
/*---------------------------*/
  return (
    <div className="form-section">
      <h3>Skills</h3>
      <div className="skills-container">
        {data.map((skill, index) => (
          <div key={index} className="skill-item">
            <input
              type="text"
              value={skill}
              onChange={(e) => updateSkill(index, e.target.value)}
              placeholder="e.g., React"
              className="skill-input"
            />
            <button type="button" className="btn-remove-small" onClick={() => removeSkill(index)}>
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn-add" onClick={addSkill}>
        + Add Skill
      </button>
    </div>
  );
};

export default SkillsForm;