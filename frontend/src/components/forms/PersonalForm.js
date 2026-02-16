import React from 'react';
import './FormStyles.css';

const PersonalForm = ({ data, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const generateSummary = () => {
    const generated = "Experienced software engineer with 5+ years in full-stack development, passionate about creating efficient and scalable solutions.";
    onChange({ ...data, summary: generated });
  };
/*________________________________________________*/
  return (
    <div className="form-section">
      <h3>Personal Information</h3>
      <div className="form-group">
        <label>Full Name</label>
        <input
          type="text"
          name="name"
          value={data.name || ''}
          onChange={handleChange}
          placeholder="John Doe"
        />
      </div>
      <div className="form-group">
        <label>Job Title</label>
        <input
          type="text"
          name="title"
          value={data.title || ''}
          onChange={handleChange}
          placeholder="Software Engineer"
        />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={data.email || ''}
          onChange={handleChange}
          placeholder="john@example.com"
        />
      </div>
      <div className="form-group">
        <label>Phone</label>
        <input
          type="tel"
          name="phone"
          value={data.phone || ''}
          onChange={handleChange}
          placeholder="+1 234 567 890"
        />
      </div>
      <div className="form-group">
        <label>Professional Summary</label>
        <textarea
          name="summary"
          value={data.summary || ''}
          onChange={handleChange}
          rows="4"
          placeholder="Write a brief summary..."
        />
        <button type="button" className="btn-ai" onClick={generateSummary}>
          ✨ Generate with AI
        </button>
      </div>
    </div>
  );
};

export default PersonalForm;