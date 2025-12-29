import React, { useState } from 'react';

function StepCard({ step }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`step-card ${expanded ? 'expanded' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="step-number">{step.number}</div>
      <div className="step-icon">{step.icon}</div>
      <h3 className="step-title">{step.title}</h3>
      {expanded && <p className="step-desc">{step.desc}</p>}
    </div>
  );
}

export default StepCard;
