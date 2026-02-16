import React, { useState } from 'react';
import './SkillGapAnalyzer.css';

const SkillGapAnalyzer = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const analyze = () => {
    // Placeholder AI analysis - replace with real API call
    setAnalysis({
      atsScore: 78,
      matchScore: 65,
      strengths: ['React', 'Team Leadership', 'JavaScript'],
      gaps: ['TypeScript', 'AWS', 'Python'],
      suggestions: [
        'Add TypeScript experience to your resume',
        'Highlight any AWS certifications or projects',
        'Include Python if you have used it in past roles'
      ],
      interviewHighlights: [
        'Emphasize your React experience',
        'Prepare examples of team leadership',
        'Discuss how you quickly learn new technologies'
      ]
    });
  };

  return (
    <div className="analyzer">
      <div className="container">
        <h1>Skill Gap Analyzer</h1>
        <p className="subtitle">Paste your resume and job description to see how well you match.</p>
        
        <div className="input-panels">
          <div className="panel">
            <label>Your Resume</label>
            <textarea
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={12}
            />
          </div>
          <div className="panel">
            <label>Job Description</label>
            <textarea
              placeholder="Paste job description here..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              rows={12}
            />
          </div>
        </div>

        <button className="analyze-btn" onClick={analyze} disabled={!resumeText || !jobDesc}>
          Analyze Skill Gap
        </button>

        {analysis && (
          <div className="analysis-result">
            <h2>Analysis Results</h2>
            <div className="scores">
              <div className="score-card">
                <div className="score-value">{analysis.atsScore}</div>
                <div className="score-label">ATS Score</div>
              </div>
              <div className="score-card">
                <div className="score-value">{analysis.matchScore}</div>
                <div className="score-label">Match Score</div>
              </div>
            </div>
/*---------------------------*/
            <div className="analysis-sections">
              <div className="section strengths">
                <h3>✅ Strengths</h3>
                <ul>
                  {analysis.strengths.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="section gaps">
                <h3>⚠️ Skill Gaps</h3>
                <ul>
                  {analysis.gaps.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="section suggestions">
                <h3>💡 Suggestions</h3>
                <ul>
                  {analysis.suggestions.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="section highlights">
                <h3>🎤 Interview Highlights</h3>
                <ul>
                  {analysis.interviewHighlights.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillGapAnalyzer;