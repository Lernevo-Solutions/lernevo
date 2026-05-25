import React, { useState } from 'react';
import './SkillGapAnalyzer.css';

const SkillGapAnalyzer = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Pure file assignment. Absolutely NO text extraction or reading logic here!
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setResumeFile(file);
      setErrorMsg('');
    } else {
      setErrorMsg('Please upload a valid PDF file.');
      setResumeFile(null);
    }
  };

  const analyze = async () => {
    setLoading(true);
    setErrorMsg('');
    setAnalysis(null);

    try {
      // 2. Wrap file and payload elements directly into a clean FormData package
      const formData = new FormData();
      formData.append('resume', resumeFile); // Matches request.FILES.get("resume")
      formData.append('job_description', jobDesc); // Matches request.data.get("job_description")
      formData.append('job_title', ''); 
      formData.append('company_name', '');

      // 3. Stream to your Python server layout
      const response = await fetch('http://localhost:8000/api/analyze-skill-gap/', {
        method: 'POST',
        // CRITICAL: DO NOT set 'Content-Type': 'application/json' or 'multipart/form-data' here!
        // Leaving headers empty lets the browser generate the file boundary parameter automatically.
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setAnalysis(result.data);
      } else {
        setErrorMsg(result.message || 'Analysis processing failed.');
      }
    } catch (error) {
      console.error("Analysis network failure:", error);
      setErrorMsg('Cannot reach the backend. Verify that your Django application is running at port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analyzer">
      <div className="container">
        <h1>Skill Gap Analyzer</h1>
        <p className="subtitle">Upload your resume PDF and paste the job description to begin.</p>
        
        {errorMsg && <div className="error-banner">❌ {errorMsg}</div>}

        <div className="input-panels">
          <div className="panel">
            <label>Your Resume (PDF Only)</label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="file-input"
              />
              {resumeFile && <p className="file-name">Selected: 📄 {resumeFile.name}</p>}
            </div>
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

        <button 
          className="analyze-btn" 
          onClick={analyze} 
          disabled={!resumeFile || !jobDesc || loading}
        >
          {loading ? 'Analyzing Profile...' : 'Analyze Skill Gap'}
        </button>

        {/* 4. Display matching parameters coming back from your model fields */}
        {analysis && (
          <div className="analysis-result">
            <h2>Analysis Results</h2>
            <div className="scores">
              <div className="score-card">
                <div className="score-value">{analysis.ats_score ?? 0}%</div>
                <div className="score-label">ATS Score</div>
              </div>
              <div className="score-card">
                <div className="score-value">{analysis.match_score ?? 0}%</div>
                <div className="score-label">Match Score</div>
              </div>
              <div className="score-card">
                <div className="score-value">{analysis.gap_score ?? 0}%</div>
                <div className="score-label">Gap Score</div>
              </div>
            </div>

            <div className="analysis-sections">
              <div className="section strengths">
                <h3>✅ Strengths</h3>
                <ul>
                  {(analysis.skills || [])
                    .filter(s => s.status === "MATCHED")
                    .map((item, i) => (
                      <li key={i}>{item.skill_name}</li>
                    ))}
                </ul>
              </div>
              
              <div className="section gaps">
                <h3>⚠️ Skill Gaps</h3>
                <ul>
                  {(analysis.skills || [])
                    .filter(s => s.status === "MISSING")
                    .map((item, i) => (
                      <li key={i}>
                        {item.skill_name} {item.priority && `(${item.priority} Priority)`}
                      </li>
                    ))}
                </ul>
              </div>

              <div className="section suggestions">
                <h3>💡 Suggestions</h3>
                <ul>
                  {(analysis.improvement_tips || []).map((item, i) => (
                    <li key={i}>{item.title} ({item.impact_percentage})</li>
                  ))}
                </ul>
              </div>

              <div className="section highlights">
                <h3>🎤 Focus Areas</h3>
                <ul>
                  {(analysis.focus_areas || []).map((item, i) => (
                    <li key={i}>
                      <strong>{item.title}:</strong> {item.description}
                    </li>
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