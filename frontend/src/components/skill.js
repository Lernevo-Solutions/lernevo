import React, { useState, useRef } from 'react';
import './skill.css';

const SkillGapAnalyzer = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Complete Skill Database
  const SKILL_DATABASE = [
    'python', 'javascript', 'react', 'node.js', 'java', 'typescript',
    'html', 'css', 'mongodb', 'postgresql', 'mysql', 'aws', 'docker',
    'kubernetes', 'git', 'machine learning', 'data analysis', 'sql',
    'figma', 'ui/ux', 'leadership', 'communication', 'project management',
    'agile', 'scrum', 'rest api', 'graphql', 'tensorflow', 'pytorch',
    'excel', 'tableau', 'power bi', 'c++', 'c#', 'php', 'laravel',
    'django', 'flask', 'spring boot', 'azure', 'jenkins', 'terraform'
  ];

  const extractSkills = (text) => {
    if (!text) return [];
    const lowerText = text.toLowerCase();
    return SKILL_DATABASE.filter(skill => 
      lowerText.includes(skill.toLowerCase())
    );
  };

  const getRecommendation = (skill) => {
    const recommendations = {
      'react': '🎨 Build 5+ React apps (E-commerce, Dashboard, Social Media) + Master Hooks & Context API',
      'python': '🐍 100 Days of Code + Build Automation Scripts + Flask/Django Projects',
      'javascript': '⚡ Master ES6+, Async/Await, Promises + Build 10 Real-world Projects',
      'node.js': '🚀 Build REST APIs, JWT Auth, Real-time apps with Socket.io',
      'aws': '☁️ Get AWS Certified + Hands-on with EC2, S3, Lambda, API Gateway',
      'mongodb': '🍃 MongoDB University + Build Scalable Database Architecture',
      'docker': '🐳 Docker Mastery + Containerize Apps + Kubernetes Basics',
      'sql': '🗄️ Master Complex Queries, Joins, Indexing + LeetCode Hard Problems',
      'typescript': '🔷 Build Type-safe Apps + Master Generics, Decorators',
      'git': '📌 Git Flow + Open Source Contributions + Collaborative Workflows',
      'machine learning': '🤖 Andrew Ng Course + Kaggle Competitions + Deploy Models',
      'communication': '💬 Toastmasters + Technical Blogging + Presentation Skills',
      'project management': '📊 PMP Prep + Agile Certifications + Jira Mastery',
      'leadership': '👥 Lead Teams + Mentorship + Decision Making Courses',
      'figma': '🎨 Design Systems + Prototyping + UI Animation Courses',
      'java': '☕ Spring Boot Microservices + Hibernate + REST APIs',
      'php': '🐘 Laravel from Scratch + Build CMS + E-commerce Sites'
    };
    return recommendations[skill.toLowerCase()] || `🎯 Accelerate ${skill} with Hands-on Projects & Industry Certifications`;
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setResumeText(e.target.result);
    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      alert('📄 For best results, please paste your resume text manually');
    }
  };

  const analyzeGap = () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      alert('✨ Please provide both resume and job description!');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const resumeSkills = extractSkills(resumeText);
      const jobSkills = extractSkills(jobDescription);
      
      const matchedSkills = jobSkills.filter(skill => 
        resumeSkills.some(rs => rs.toLowerCase() === skill.toLowerCase())
      );
      
      const missingSkills = jobSkills.filter(skill => 
        !resumeSkills.some(rs => rs.toLowerCase() === skill.toLowerCase())
      );
      
      const matchScore = jobSkills.length > 0 
        ? Math.round((matchedSkills.length / jobSkills.length) * 100)
        : 0;

      let verdict = '';
      let verdictColor = '';
      let verdictIcon = '';
      let message = '';
      
      if (matchScore >= 80) {
        verdict = 'Outstanding Match!';
        verdictColor = '#10b981';
        verdictIcon = '🏆';
        message = 'You are an excellent candidate for this role!';
      } else if (matchScore >= 60) {
        verdict = 'Strong Alignment';
        verdictColor = '#3b82f6';
        verdictIcon = '🎯';
        message = 'Minor gaps identified - easy to fill!';
      } else if (matchScore >= 40) {
        verdict = 'Potential Detected';
        verdictColor = '#f59e0b';
        verdictIcon = '📈';
        message = 'Focus on key missing skills to stand out';
      } else {
        verdict = 'Growth Opportunity';
        verdictColor = '#ef4444';
        verdictIcon = '💪';
        message = 'Clear roadmap created for your success';
      }
      
      setAnalysisResult({
        matchScore,
        matchedSkills,
        missingSkills,
        totalJobSkills: jobSkills.length,
        timestamp: new Date().toLocaleString(),
        verdict,
        verdictColor,
        verdictIcon,
        message
      });
      
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="skill-analyzer">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="gradient-1"></div>
        <div className="gradient-2"></div>
        <div className="gradient-3"></div>
      </div>
      
      <div className="container">
        {/* Hero Section */}
        <div className="hero">
          <div className="hero-badge">
            <span className="pulse-ring"></span>
            <span>✨ AI-Powered Intelligence</span>
          </div>
          <h1 className="hero-title">
            Discover Your
            <span className="gradient-text"> Skill Gap</span>
            <br />
            <span className="light-text">and Bridge It Faster</span>
          </h1>
          <p className="hero-subtitle">
            Upload your resume, paste any job description, and get instant AI insights
            <br />to accelerate your career growth
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid-2col">
          {/* Resume Card */}
          <div className="glass-card">
            <div className="card-glow"></div>
            <div className="card-header">
              <div className="header-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h16v16H4zM8 8h8M8 12h6M8 16h4"/>
                </svg>
              </div>
              <div>
                <h2>Your Resume</h2>
                <p>Paste or upload your CV</p>
              </div>
              <div className="header-badge">Step 1</div>
            </div>
            
            <div className="card-body">
              <div 
                className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileUpload(e.dataTransfer.files[0]);
                }}
              >
                <div className="drop-icon">📂</div>
                <p className="drop-text">Drag & drop or <span className="highlight-link">browse</span></p>
                <span className="drop-hint">PDF, DOC, TXT up to 10MB</span>
                {fileName && <div className="file-chip">📄 {fileName}</div>}
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept=".txt,.pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />
              </div>
              
              <div className="textarea-container">
                <textarea
                  className="modern-textarea"
                  placeholder="// Paste your resume content here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows="9"
                />
                <div className="textarea-footer">
                  <span>{resumeText.length} characters</span>
                  <span className="status-badge">Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description Card */}
          <div className="glass-card">
            <div className="card-glow"></div>
            <div className="card-header">
              <div className="header-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div>
                <h2>Job Description</h2>
                <p>Paste the job requirements</p>
              </div>
              <div className="header-badge">Step 2</div>
            </div>
            
            <div className="card-body">
              <div className="textarea-container">
                <textarea
                  className="modern-textarea"
                  placeholder="// Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows="11"
                />
                <div className="textarea-footer">
                  <span>{jobDescription.length} characters</span>
                  <span className="status-badge">Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        <button className="analyze-button" onClick={analyzeGap} disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="button-spinner"></div>
              <span>Analyzing Your Skills...</span>
            </>
          ) : (
            <>
              <span className="btn-icon">🚀</span>
              <span>Launch Skill Analysis</span>
              <span className="btn-arrow">→</span>
            </>
          )}
        </button>

        {/* Results Section */}
        {analysisResult && (
          <div className="results-wrapper">
            <div className="results-header">
              <div className="results-title">
                <span className="title-icon">📊</span>
                <h3>Analysis Complete</h3>
              </div>
              <div className="results-date">{analysisResult.timestamp}</div>
            </div>

            {/* Score Dashboard */}
            <div className="score-dashboard">
              <div className="score-ring-container">
                <div className="score-ring-outer">
                  <div className="score-ring-inner">
                    <svg width="160" height="160">
                      <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="8"/>
                      <circle 
                        cx="80" cy="80" r="70" fill="none" 
                        stroke="url(#scoreGrad)" strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 70}
                        strokeDashoffset={2 * Math.PI * 70 * (1 - analysisResult.matchScore / 100)}
                        strokeLinecap="round"
                        transform="rotate(-90 80 80)"
                      />
                      <defs>
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6"/>
                          <stop offset="50%" stopColor="#8b5cf6"/>
                          <stop offset="100%" stopColor="#06b6d4"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="score-value">
                      <span className="score-number">{analysisResult.matchScore}%</span>
                      <span className="score-label">Match Score</span>
                    </div>
                  </div>
                </div>
                <div className="verdict-card" style={{ borderLeftColor: analysisResult.verdictColor }}>
                  <div className="verdict-icon" style={{ color: analysisResult.verdictColor }}>
                    {analysisResult.verdictIcon}
                  </div>
                  <div>
                    <h4 style={{ color: analysisResult.verdictColor }}>{analysisResult.verdict}</h4>
                    <p>{analysisResult.message}</p>
                  </div>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">🔍</div>
                  <div className="stat-info">
                    <span className="stat-label">Skills Analyzed</span>
                    <span className="stat-number">{analysisResult.totalJobSkills}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-info">
                    <span className="stat-label">Matched Skills</span>
                    <span className="stat-number success">{analysisResult.matchedSkills.length}</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📚</div>
                  <div className="stat-info">
                    <span className="stat-label">Skills to Learn</span>
                    <span className="stat-number warning">{analysisResult.missingSkills.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Details */}
            <div className="skills-dashboard">
              <div className="skills-panel matched-panel">
                <div className="panel-header">
                  <span className="panel-icon">✅</span>
                  <h4>Your Strengths</h4>
                  <span className="panel-count">{analysisResult.matchedSkills.length}</span>
                </div>
                <div className="skills-grid-list">
                  {analysisResult.matchedSkills.map((skill, i) => (
                    <div key={i} className="skill-chip matched-chip">
                      <span className="chip-check">✓</span>
                      {skill}
                    </div>
                  ))}
                  {analysisResult.matchedSkills.length === 0 && (
                    <div className="empty-panel">No matching skills detected yet</div>
                  )}
                </div>
              </div>

              <div className="skills-panel gap-panel">
                <div className="panel-header">
                  <span className="panel-icon">📚</span>
                  <h4>Skill Gaps & Roadmap</h4>
                  <span className="panel-count">{analysisResult.missingSkills.length}</span>
                </div>
                <div className="gaps-list">
                  {analysisResult.missingSkills.map((skill, i) => (
                    <div key={i} className="gap-item">
                      <div className="gap-header">
                        <span className="gap-icon">⚠️</span>
                        <span className="gap-skill">{skill}</span>
                      </div>
                      <div className="gap-recommendation">
                        <span className="rec-arrow">→</span>
                        {getRecommendation(skill)}
                      </div>
                    </div>
                  ))}
                  {analysisResult.missingSkills.length === 0 && (
                    <div className="empty-panel success">🎉 Perfect match! No gaps found!</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillGapAnalyzer;