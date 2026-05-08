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

  // Complete Skill Database - ENHANCED
  const SKILL_DATABASE = [
    // Technical Skills
    'python', 'javascript', 'react', 'node.js', 'java', 'typescript',
    'html', 'css', 'mongodb', 'postgresql', 'mysql', 'aws', 'docker',
    'kubernetes', 'git', 'machine learning', 'data analysis', 'sql',
    'figma', 'ui/ux', 'leadership', 'communication', 'project management',
    'agile', 'scrum', 'rest api', 'graphql', 'tensorflow', 'pytorch',
    'excel', 'tableau', 'power bi', 'c++', 'c#', 'php', 'laravel',
    'django', 'flask', 'spring boot', 'azure', 'jenkins', 'terraform',
    
    // NEW SKILLS ADDED
    'laugh', 'humor', 'emotional intelligence', 'empathy', 'active listening',
    'storytelling', 'public speaking', 'negotiation', 'conflict resolution',
    'team collaboration', 'critical thinking', 'problem solving', 'creativity',
    'time management', 'adaptability', 'resilience', 'stress management',
    'decision making', 'delegation', 'coaching', 'mentoring', 'feedback',
    'presentation', 'sales', 'marketing', 'seo', 'content writing',
    'analytical skills', 'research', 'statistics', 'r programming',
    'snowflake', 'airflow', 'spark', 'hadoop', 'linux', 'bash',
    'nginx', 'apache', 'redis', 'rabbitmq', 'kafka',
    'next.js', 'vue.js', 'angular', 'svelte', 'tailwind css',
    
    // Soft Skills
    'teamwork', 'work ethic', 'positive attitude', 'flexibility',
    'self motivation', 'attention to detail', 'organization',
    'multitasking', 'customer service', 'interpersonal skills'
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
      // Original recommendations
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
      'php': '🐘 Laravel from Scratch + Build CMS + E-commerce Sites',
      
      // NEW LAUGH & HUMOR RECOMMENDATIONS
      'laugh': '😂 நகைச்சுவை உணர்வை வளர்க்க: Stand-up Comedy classes பாருங்கள் + Friends/The Office பார்க்கும் போது timing-ஐ analyze பண்ணுங்கள் + உங்கள் team-ல daily 1 funny incident share பண்ணுங்கள் + Laughter yoga try பண்ணுங்கள்',
      'humor': '🎭 Workplace humor mastery: ப்ரசண்டேஷன்ஸ்-ல light moments add பண்ணுங்கள் + Slack/Teams-ல funny GIFs use பண்ணுங்கள் + "The Humor Code" book படியுங்கள் + Practice witty comebacks',
      
      // New soft skills recommendations
      'emotional intelligence': '🧠 Daniel Goleman-ன் EI book படியுங்கள் + Daily self-reflection journal maintain பண்ணுங்கள் + Take EQ assessment + Practice empathy mapping',
      'empathy': '💖 Active listening practice + Volunteer for social causes + Read fiction books + "Nonviolent Communication" book',
      'active listening': '👂 Listen without interrupting + Paraphrase what others say + Maintain eye contact + Take notes during meetings',
      'storytelling': '📖 "Storytelling with Data" book + 5-minute stories practice பண்ணுங்கள் + TED talks analyze பண்ணுங்கள் + Build a personal story bank',
      'public speaking': '🎤 Toastmasters join பண்ணுங்கள் + Mirror-ல每天 2 minutes பேசுங்கள் + Record yourself + Start with small groups',
      'negotiation': '🤝 "Never Split the Difference" book + Role-play with friends + Take Harvard negotiation course + Practice BATNA technique',
      'conflict resolution': '⚡ "Crucial Conversations" book + Mediation training + Practice 5-step conflict resolution framework + Team building activities',
      'team collaboration': '🤝 Active participation in meetings + Knowledge sharing sessions + Pair programming + Cross-functional projects',
      'critical thinking': '🧩 Chess விளையாடுங்கள் + "Thinking Fast and Slow" book படியுங்கள் + Analyze case studies + Ask "Why?" 5 times',
      'problem solving': '💡 Practice design thinking + Codewars challenges + Real-world problem analysis + Root cause analysis training',
      'creativity': '🎨 Daily 10 minutes mind mapping + New hobby try பண்ணுங்கள் + Brainstorming sessions + Take creative writing classes',
      'time management': '⏰ Pomodoro technique + Eisenhower Matrix + Time blocking + "Deep Work" by Cal Newport',
      'adaptability': '🔄 Every week new tool learn பண்ணுங்கள் + Change your routine frequently + Embrace feedback + Learn growth mindset',
      'resilience': '💪 Meditation practice + "Grit" book by Angela Duckworth + Daily affirmations + Build support network',
      'stress management': '🧘 Mindfulness meditation + Regular exercise + Sleep hygiene + "The Relaxation Response" techniques',
      'decision making': '⚖️ Pros/cons list habit + "Decisive" book by Chip Heath + Decision matrix + 10/10/10 rule',
      'delegation': '📋 Trust your team + Clear instructions + Follow up system + "Who Does What" by Jan R. Margolis',
      'coaching': '🎯 GROW model mastery + Active listening + Powerful questioning + Certified coaching course',
      'mentoring': '🌟 Share experiences + Regular 1:1 meetings + Goal setting + Reverse mentoring',
      'feedback': '💬 SBI feedback model + Regular feedback sessions + Receive gracefully + "Thanks for the Feedback" book',
      'presentation': '📊 Slide design mastery + Story arc structure + Body language practice + Presentation delivery course',
      'sales': '💰 "Fanatical Prospecting" book + Role-play objection handling + Sandler training + Sales pipeline management',
      'marketing': '📢 Digital marketing certification + Google Analytics + Content strategy + A/B testing',
      'seo': '🔍 Google Search Console use பண்ணுங்கள் + Moz/Semrush course complete பண்ணுங்கள் + Keyword research + Backlink strategy',
      'content writing': '✍️ Daily writing practice + Hemingway app + SEO writing course + Build writing portfolio',
      'analytical skills': '📊 Excel mastery + SQL practice + Data visualization + Critical analysis exercises',
      'research': '🔬 Research methodology course + Academic writing + Citation tools + Literature review techniques',
      
      // Technical new skills
      'next.js': '⚛️ Build 3 full-stack apps + App Router master பண்ணுங்கள் + Server components + ISR implementation',
      'tailwind css': '🎨 Official playlist follow பண்ணுங்கள் + Build 5 UI components + Custom plugin development + Dark mode',
      'vue.js': '💚 Vue Mastery course + Build 5 projects + Composition API + Pinia state management',
      'angular': '🅰️ Angular University + RxJS mastery + Build enterprise apps + NgRx state management',
      'typescript': '🔷 TypeScript Deep Dive + Generics mastery + Advanced types + Decorators',
      'redis': '📦 Redis University + Caching strategies + Pub/Sub + RedisJSON',
      'kafka': '📨 Confluent certification + Event-driven architecture + Stream processing',
      'graphql': '🚀 Apollo GraphQL course + Schema design + Federation + Performance optimization',
      'snowflake': '❄️ Snowflake certification + Data warehouse design + Query optimization',
      'airflow': '⏫ Astronomer certification + DAG writing + Pipeline orchestration',
      'spark': '🔥 Databricks certification + PySpark + Streaming + Optimization',
      'linux': '🐧 Linux command line mastery + Bash scripting + System administration',
      'bash': '💻 Advanced bash scripting + Automation + Cron jobs + Debugging'
    };
    
    // Default recommendation if skill not found
    return recommendations[skill.toLowerCase()] || `🎯 Accelerate ${skill} with Hands-on Projects & Industry Certifications. Pro tip: Break it down into weekly goals!`;
  };

  // Function to estimate learning time
  const getLearningTimeEstimate = (missingSkillsCount) => {
    if (missingSkillsCount === 0) return 'You\'re ready! 🎉';
    if (missingSkillsCount <= 2) return '⚡ 2-4 weeks';
    if (missingSkillsCount <= 5) return '📘 1-3 months';
    return '🚀 3-6 months';
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
        message,
        topStrengths: matchedSkills.slice(0, 3),
        quickWins: missingSkills.slice(0, 2),
        learningTime: getLearningTimeEstimate(missingSkills.length)
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

            {/* NEW HIGHLIGHT BANNER */}
            <div className="highlight-banner">
              <div className="highlight-icon">⭐</div>
              <div className="highlight-text">
                <strong>Your Superpower:</strong> {analysisResult.topStrengths.length > 0 
                  ? analysisResult.topStrengths.join(', ') 
                  : 'Your determination to learn!'}
              </div>
              <div className="highlight-badge">
                🎯 {analysisResult.quickWins.length} Quick Win{analysisResult.quickWins.length !== 1 ? 's' : ''} Available
              </div>
              <div className="learning-time-badge">
                ⏱️ {analysisResult.learningTime}
              </div>
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
                    <div className="empty-panel success">🎉 Perfect match! No gaps found! You're ready for this role!</div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Wins Section */}
            {analysisResult.quickWins.length > 0 && (
              <div className="quick-wins-section">
                <div className="quick-wins-header">
                  <span className="quick-icon">⚡</span>
                  <h4>Quick Wins - Start Here!</h4>
                  <span className="quick-badge">Easy to Learn</span>
                </div>
                <div className="quick-wins-list">
                  {analysisResult.quickWins.map((skill, i) => (
                    <div key={i} className="quick-win-item">
                      <span className="quick-win-number">{i + 1}</span>
                      <span className="quick-win-skill">{skill}</span>
                      <span className="quick-win-time">~1-2 weeks</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillGapAnalyzer;