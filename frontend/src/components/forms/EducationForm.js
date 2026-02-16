import React from 'react';
import './FormStyles.css';

const EducationForm = ({ data = [], onChange }) => {
  const addEducation = () => {
    onChange([
      ...data,
      { school: '', degree: '', field: '', startDate: '', endDate: '' }
    ]);
  };

  const removeEducation = (index) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateEducation = (index, field, value) => {
    const newData = [...data];
    newData[index][field] = value;
    onChange(newData);
  };
/*---------------------------*/
  return (
    <div className="form-section">
      <h3>Education</h3>
      {data.map((edu, index) => (
        <div key={index} className="education-item">
          <div className="form-group">
            <label>School / University</label>
            <input
              type="text"
              value={edu.school}
              onChange={(e) => updateEducation(index, 'school', e.target.value)}
              placeholder="Stanford University"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Degree</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                placeholder="B.Sc."
              />
            </div>
            <div className="form-group">
              <label>Field of Study</label>
              <input
                type="text"
                value={edu.field}
                onChange={(e) => updateEducation(index, 'field', e.target.value)}
                placeholder="Computer Science"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="text"
                value={edu.startDate}
                onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                placeholder="2016"
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="text"
                value={edu.endDate}
                onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                placeholder="2020"
              />
            </div>
          </div>
          <div className="button-group">
            <button type="button" className="btn-remove" onClick={() => removeEducation(index)}>
              Remove
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="btn-add" onClick={addEducation}>
        + Add Education
      </button>
    </div>
  );
};

export default EducationForm;