// skill.js - Complete Enhanced File
import React, { useState, useRef, useEffect } from 'react';
import './skill.css';

const SkillGapAnalyzer = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('ats');
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const fileInputRef = useRef(null);

  // Auto-load demo data
  useEffect(() => {
    if (isFirstLoad) {
      setResumeText(`SENIOR FULL STACK DEVELOPER
Email: john.doe@email.com | Phone: +1 234 567 8900

PROFESSIONAL SUMMARY
Innovative Full Stack Developer with 6+ years of experience building scalable web applications. Expert in React, Node.js, and cloud technologies. Led teams of 5+ developers and delivered 20+ successful projects.

TECHNICAL SKILLS
• Frontend: React.js, Next.js, TypeScript, Tailwind CSS, Redux, HTML5, CSS3
• Backend: Node.js, Python, Express.js, Django, REST APIs, GraphQL
• Database: MongoDB, PostgreSQL, MySQL, Redis
• Cloud & DevOps: AWS (EC2, S3, Lambda), Docker, Kubernetes, Jenkins, Git
• Testing: Jest, React Testing Library, Cypress
• Soft Skills: Leadership, Communication, Problem Solving, Team Collaboration

WORK EXPERIENCE

Senior Software Engineer | TechCorp Solutions | 2021 - Present
• Led development of 5 major React applications serving 1M+ users
• Improved application performance by 45% through code optimization
• Mentored 4 junior developers and conducted code reviews
• Implemented CI/CD pipeline reducing deployment time by 60%

Full Stack Developer | WebWorks Studio | 2018 - 2021
• Built 15+ responsive web applications using React and Node.js
• Integrated REST APIs and third-party services
• Collaborated with design team to implement pixel-perfect UIs
• Reduced database query time by 40% through optimization

EDUCATION
Bachelor of Technology in Computer Science
Anna University | 2014 - 2018 | CGPA: 8.7/10

CERTIFICATIONS
• AWS Certified Solutions Architect
• Meta Frontend Developer Professional Certificate
• MongoDB University Certification

PROJECTS
• E-Commerce Platform: Built full-stack app with React, Node, MongoDB
• Task Management System: Real-time dashboard with WebSocket integration
• Portfolio Website: Next.js with Tailwind CSS and Framer Motion`);

      setJobDescription(`SENIOR SOFTWARE ENGINEER - FULL STACK
Company: TechInnovate Inc. | Location: Remote | Type: Full-Time

ABOUT THE ROLE
We are seeking a talented Senior Software Engineer to join our growing engineering team. You will be responsible for designing and building scalable web applications, mentoring junior developers, and driving technical decisions.

REQUIRED SKILLS (Must Have)
• React.js with Hooks, Context API, and state management (Redux/Zustand)
• Node.js and Express.js for backend development
• TypeScript for type-safe code
• MongoDB or PostgreSQL database experience
• REST API design and integration
• Git version control and collaborative workflows
• Docker containerization
• AWS services (EC2, S3, Lambda, or similar)
• Strong problem-solving and analytical skills
• Excellent communication and teamwork abilities

PREFERRED SKILLS (Nice to Have)
• Next.js framework experience
• GraphQL API development
• Redis caching
• Kubernetes orchestration
• Python or Java programming
• CI/CD pipeline setup (Jenkins/GitHub Actions)

RESPONSIBILITIES
• Design and implement high-quality, scalable web applications
• Collaborate with cross-functional teams to deliver features
• Mentor and guide junior developers
• Conduct code reviews and maintain coding standards
• Optimize application performance and database queries
• Participate in agile ceremonies and technical discussions

QUALIFICATIONS
• 5+ years of professional software development experience
• Bachelor's degree in Computer Science or related field
• Strong portfolio of web applications
• Experience with agile development methodologies

BENEFITS
• Competitive salary ($140k - $180k)
• Remote work flexibility
• Health insurance and 401k matching
• Learning stipend and conference budget
• Flexible working hours`);

      setIsFirstLoad(false);
    }
  }, [isFirstLoad]);

  const SKILL_DATABASE = [
    'react', 'react.js', 'node.js', 'javascript', 'typescript', 'python', 'java', 
    'html', 'css', 'mongodb', 'postgresql', 'mysql', 'redis', 'aws', 'ec2', 's3', 
    'lambda', 'docker', 'kubernetes', 'git', 'next.js', 'graphql', 'rest api', 
    'redux', 'tailwind css', 'express.js', 'django', 'flask', 'ci/cd', 'jenkins',
    'leadership', 'communication', 'problem solving', 'team collaboration', 
    'mentoring', 'agile', 'scrum', 'api design', 'database', 'optimization'
  ];

  const extractSkills = (text) => {
    if (!text) return [];
    const lowerText = text.toLowerCase();
    return SKILL_DATABASE.filter(skill => lowerText.includes(skill.toLowerCase()));
  };

  const extractImportantKeywords = (jobDesc) => {
    if (!jobDesc) return [];
    const lowerJobDesc = jobDesc.toLowerCase();
    const uniqueSkills = [...new Set(SKILL_DATABASE)];
    return uniqueSkills.filter(skill => {
      const cleanSkill = skill.toLowerCase().trim();
      if (cleanSkill.length < 3) return false;
      const regex = new RegExp(`\\b${cleanSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(lowerJobDesc);
    });
  };

  const checkKeywordPresence = (resume, importantKeywords) => {
    if (!resume || !importantKeywords.length) return [];
    const resumeLower = resume.toLowerCase();
    return importantKeywords.map(keyword => {
      const normalizedKeyword = keyword.toLowerCase().replace(/s$/, '');
      const present = resumeLower.includes(keyword.toLowerCase()) || resumeLower.includes(normalizedKeyword);
      return { keyword, present };
    });
  };

  const getKeywordSuggestion = (keyword) => {
    const suggestions = {
      'react': 'Add React.js projects and mention React hooks, context API, and component lifecycle.',
      'node': 'Include Node.js backend development experience with Express.js.',
      'typescript': 'Highlight TypeScript usage with interfaces, types, and type safety.',
      'mongodb': 'Mention MongoDB database design, aggregation pipelines, and CRUD operations.',
      'postgresql': 'Add PostgreSQL experience with joins, window functions, and query optimization.',
      'aws': 'Include AWS services like EC2, S3, Lambda, and deployment experience.',
      'docker': 'Add Docker containerization and Docker Compose experience.',
      'kubernetes': 'Mention Kubernetes orchestration and deployment experience.',
      'graphql': 'Include GraphQL API development with Apollo or Relay.',
      'redis': 'Add Redis caching and pub/sub experience.',
      'git': 'Highlight Git version control workflows and collaboration.',
      'ci/cd': 'Include CI/CD pipeline setup with Jenkins or GitHub Actions.',
      'leadership': 'Add team leadership, mentoring, and project management experience.',
      'communication': 'Highlight cross-functional collaboration and stakeholder communication.'
    };
    return suggestions[keyword] || `Include ${keyword} in your skills section or work experience with relevant examples.`;
  };

  const getLearningResources = (skill) => {
    const resources = {
      'react': [
        { platform: 'YouTube', url: 'https://youtube.com/results?search_query=react+js+tutorial', name: 'React JS Tutorial - Codevolution' },
        { platform: 'Udemy', url: 'https://www.udemy.com/course/react-the-complete-guide/', name: 'React - The Complete Guide' },
        { platform: 'Documentation', url: 'https://react.dev/learn', name: 'React Official Docs' }
      ],
      'next.js': [
        { platform: 'YouTube', url: 'https://youtube.com/results?search_query=next.js+tutorial', name: 'Next.js Full Course' },
        { platform: 'Udemy', url: 'https://www.udemy.com/course/nextjs-react-the-complete-guide/', name: 'Next.js Complete Guide' },
        { platform: 'Documentation', url: 'https://nextjs.org/learn', name: 'Next.js Learn' }
      ],
      'typescript': [
        { platform: 'YouTube', url: 'https://youtube.com/results?search_query=typescript+tutorial', name: 'TypeScript Course for Beginners' },
        { platform: 'Udemy', url: 'https://www.udemy.com/course/understanding-typescript/', name: 'Understanding TypeScript' },
        { platform: 'Documentation', url: 'https://www.typescriptlang.org/docs/', name: 'TypeScript Docs' }
      ],
      'node.js': [
        { platform: 'YouTube', url: 'https://youtube.com/results?search_query=node.js+tutorial', name: 'Node.js Full Course' },
        { platform: 'Udemy', url: 'https://www.udemy.com/course/nodejs-the-complete-guide/', name: 'Node.js Complete Guide' },
        { platform: 'Documentation', url: 'https://nodejs.org/en/docs/guides/', name: 'Node.js Guides' }
      ],
      'graphql': [
        { platform: 'YouTube', url: 'https://youtube.com/results?search_query=graphql+tutorial', name: 'GraphQL Crash Course' },
        { platform: 'Udemy', url: 'https://www.udemy.com/course/graphql-bootcamp/', name: 'GraphQL Bootcamp' },
        { platform: 'Documentation', url: 'https://graphql.org/learn/', name: 'GraphQL Official' }
      ],
      'kubernetes': [
        { platform: 'YouTube', url: 'https://youtube.com/results?search_query=kubernetes+tutorial', name: 'Kubernetes Full Course' },
        { platform: 'Udemy', url: 'https://www.udemy.com/course/certified-kubernetes-administrator-with-practice-tests/', name: 'Kubernetes CKA Course' },
        { platform: 'Documentation', url: 'https://kubernetes.io/docs/tutorials/', name: 'K8s Tutorials' }
      ],
      'docker': [
        { platform: 'YouTube', url: 'https://youtube.com/results?search_query=docker+tutorial', name: 'Docker Full Course' },
        { platform: 'Udemy', url: 'https://www.udemy.com/course/docker-mastery/', name: 'Docker Mastery' },
        { platform: 'Documentation', url: 'https://docs.docker.com/get-started/', name: 'Docker Docs' }
      ],
      'aws': [
        { platform: 'YouTube', url: 'https://youtube.com/results?search_query=aws+tutorial', name: 'AWS Full Course' },
        { platform: 'Udemy', url: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate/', name: 'AWS Solutions Architect' },
        { platform: 'Documentation', url: 'https://aws.amazon.com/training/', name: 'AWS Training' }
      ]
    };
    return resources[skill.toLowerCase()] || [
      { platform: 'YouTube', url: `https://youtube.com/results?search_query=${encodeURIComponent(skill)}+tutorial`, name: `${skill} Tutorials` },
      { platform: 'Udemy', url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}`, name: `${skill} Courses` },
      { platform: 'Documentation', url: `https://www.google.com/search?q=${encodeURIComponent(skill)}+documentation`, name: `${skill} Resources` }
    ];
  };

  const getPriorityLevel = (skill, index) => {
    const highPriorityKeywords = ['kubernetes', 'docker', 'aws', 'graphql', 'typescript', 'next.js', 'redis'];
    if (highPriorityKeywords.includes(skill.toLowerCase())) return 'high';
    if (index < 3) return 'high';
    if (index < 6) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ff4785';
      case 'medium': return '#ffa500';
      default: return '#00c9a7';
    }
  };

  const getPriorityBg = (priority) => {
    switch(priority) {
      case 'high': return 'linear-gradient(135deg, #fff0f3, #ffffff)';
      case 'medium': return 'linear-gradient(135deg, #fff8e7, #ffffff)';
      default: return 'linear-gradient(135deg, #e0fff5, #ffffff)';
    }
  };

  const getRecommendation = (skill) => {
    const recommendations = {
      'react': 'Build 5+ React applications + Master Hooks, Context API & Redux Toolkit',
      'next.js': 'Build full-stack apps + Master App Router + Server Components + ISR',
      'typescript': 'TypeScript Deep Dive + Build type-safe applications + Generics',
      'node.js': 'Build REST APIs, JWT Authentication, Real-time apps with Socket.io',
      'graphql': 'Apollo Server + Schema Design + Resolvers + Federation',
      'redis': 'Redis University + Caching strategies + Pub/Sub + RedisJSON',
      'kubernetes': 'K8s basics + Deploy apps + Pods, Services, Ingress + Helm',
      'python': '100 Days of Code + Build Django/Flask projects + Data structures',
      'java': 'Spring Boot Microservices + Hibernate + REST APIs + Maven',
      'docker': 'Docker Mastery + Containerize applications + Docker Compose + Swarm',
      'aws': 'AWS Certified Developer + Hands-on EC2, S3, Lambda, API Gateway',
      'mongodb': 'MongoDB University + Aggregation Pipeline + Indexing + Sharding',
      'postgresql': 'Master Joins, Window Functions + Query Optimization',
      'leadership': 'Lead team projects + Mentorship + Decision making courses',
      'communication': 'Toastmasters + Technical blogging + Presentation skills'
    };
    return recommendations[skill.toLowerCase()] || `Master ${skill} with hands-on projects and certifications`;
  };

  const calculateKeywordsScore = (resume, jobDesc) => {
    if (!resume || !jobDesc) return 0;
    const importantKeywords = extractImportantKeywords(jobDesc);
    if (importantKeywords.length === 0) return 0;
    const resumeLower = resume.toLowerCase();
    let matched = 0;
    importantKeywords.forEach(keyword => {
      if (resumeLower.includes(keyword.toLowerCase())) matched++;
    });
    return Math.round((matched / importantKeywords.length) * 100);
  };

  const calculateFormattingScore = (resume) => {
    if (!resume) return 0;
    let score = 50;
    if (resume.toLowerCase().includes('experience') || resume.toLowerCase().includes('work experience')) score += 10;
    if (resume.toLowerCase().includes('education')) score += 10;
    if (resume.toLowerCase().includes('skills') || resume.toLowerCase().includes('technical skills')) score += 10;
    if (resume.toLowerCase().includes('summary')) score += 5;
    if (resume.includes('•') || resume.includes('-') || resume.includes('*')) score += 10;
    const lines = resume.split('\n');
    const hasProperSpacing = lines.filter(line => line.trim() === '').length > 3;
    if (hasProperSpacing) score += 5;
    if (resume.length > 500 && resume.length < 3000) score += 5;
    return Math.min(Math.round(score), 100);
  };

  const calculateSkillScore = (matchedSkills, totalJobSkills) => {
    if (totalJobSkills === 0) return 70;
    return Math.min(100, Math.round((matchedSkills.length / totalJobSkills) * 100));
  };

  const calculateExperienceScore = (resume) => {
    let score = 65;
    if (resume.toLowerCase().includes('senior') || resume.toLowerCase().includes('lead')) score += 15;
    if (resume.toLowerCase().includes('years of experience')) score += 5;
    if (resume.length > 800) score += 5;
    if (resume.toLowerCase().includes('achievement') || resume.toLowerCase().includes('improved')) score += 5;
    return Math.min(95, Math.round(score));
  };

  const computeATSScore = (keywordsScore, formattingScore, skillScore, experienceScore) => {
    const score = (keywordsScore * 0.35) + (skillScore * 0.35) + (formattingScore * 0.15) + (experienceScore * 0.15);
    return Math.min(100, Math.round(score));
  };

  const getLearningTimeEstimate = (missingSkillsCount) => {
    if (missingSkillsCount === 0) return 'Ready to Go';
    if (missingSkillsCount <= 2) return '2-4 Weeks';
    if (missingSkillsCount <= 5) return '1-3 Months';
    return '3-6 Months';
  };

  const getVerdict = (atsScore) => {
    if (atsScore >= 80) return { text: 'Outstanding Match', subtext: 'You are an excellent candidate for this role', color: '#00c9a7', bg: '#e0fff5' };
    if (atsScore >= 60) return { text: 'Strong Alignment', subtext: 'Minor gaps identified - easy to fill', color: '#3b82f6', bg: '#e0f2fe' };
    if (atsScore >= 40) return { text: 'Potential Detected', subtext: 'Focus on key missing skills to stand out', color: '#ffa500', bg: '#fff3e0' };
    return { text: 'Growth Opportunity', subtext: 'Clear roadmap created for your success', color: '#ff4785', bg: '#ffe5ec' };
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setResumeText(e.target.value);
    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      alert('Please paste your resume text manually for best results');
    }
  };

  const analyzeGap = () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      alert('Please provide both resume and job description');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const resumeSkills = extractSkills(resumeText);
      const jobSkills = extractSkills(jobDescription);
      const importantKeywords = extractImportantKeywords(jobDescription);
      const keywordCheckResults = checkKeywordPresence(resumeText, importantKeywords);
      const missingKeywords = keywordCheckResults.filter(r => !r.present);

      const matchedSkills = jobSkills.filter(skill =>
        resumeSkills.some(rs => rs.toLowerCase() === skill.toLowerCase())
      );

      const missingSkills = jobSkills.filter(skill =>
        !resumeSkills.some(rs => rs.toLowerCase() === skill.toLowerCase())
      );

      const matchScore = jobSkills.length > 0 ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 0;

      const keywordsScore = calculateKeywordsScore(resumeText, jobDescription);
      const formattingScore = calculateFormattingScore(resumeText);
      const skillScore = calculateSkillScore(matchedSkills, jobSkills.length);
      const experienceScore = calculateExperienceScore(resumeText);
      const atsScore = computeATSScore(keywordsScore, formattingScore, skillScore, experienceScore);
      const verdict = getVerdict(atsScore);

      setAnalysisResult({
        matchScore,
        atsScore,
        matchedSkills,
        missingSkills,
        totalJobSkills: jobSkills.length,
        timestamp: new Date().toLocaleString(),
        verdict,
        topStrengths: matchedSkills.slice(0, 5),
        quickWins: missingSkills.slice(0, 3),
        learningTime: getLearningTimeEstimate(missingSkills.length),
        keywordsScore,
        formattingScore,
        skillScore,
        experienceScore,
        missingSkillsList: missingSkills,
        importantKeywords,
        keywordCheckResults,
        missingKeywords,
      });
      
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="app">
      <div className="bg-decoration">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
        <div className="dots-pattern"></div>
      </div>

      <div className="container">
        <div className="hero">
          <div className="hero-badge-top">
            <span className="badge-spark">✨</span>
            <span>AI-Powered Career Intelligence</span>
          </div>
          
          <div className="hero-title-section">
            <h1 className="hero-main-title">
              <span className="title-line-1">Bridge Your</span>
              <span className="title-line-2 gradient-text"> Skill Gap</span>
            </h1>
            <div className="hero-breadcrumb">
              <span className="breadcrumb-dot"></span>
              <span>Resume → Analyze → Grow</span>
              <span className="breadcrumb-dot"></span>
            </div>
          </div>
          
          <p className="hero-description-simple">
            Upload your resume and job description — get instant skill gap analysis, 
            personalized learning recommendations, and ATS optimization tips to land your dream role.
          </p>
          
          <div className="hero-feature-strip">
            <div className="strip-item"><span>⚡</span><span>Instant Analysis</span></div>
            <div className="strip-divider"></div>
            <div className="strip-item"><span>🎯</span><span>Smart Matching</span></div>
            <div className="strip-divider"></div>
            <div className="strip-item"><span>📚</span><span>Learning Path</span></div>
            <div className="strip-divider"></div>
            <div className="strip-item"><span>💎</span><span>ATS Ready</span></div>
          </div>
        </div>
        
        <div className="cards-grid">
          <div className="card">
            <div className="card-header">
              <div className="card-icon">📄</div>
              <div><h3>Your Resume</h3><p>Sample data pre-loaded</p></div>
            </div>
            <div className="card-body">
              <div className={`drop-zone ${isDragging ? 'dragging' : ''}`} onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileUpload(e.dataTransfer.files[0]); }}>
                <div className="drop-icon">📁</div>
                <p>Drag & drop or <span>browse</span></p>
                <small>TXT files only</small>
                {fileName && <div className="file-name">{fileName}</div>}
                <input ref={fileInputRef} type="file" accept=".txt" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e.target.files[0])} />
              </div>
              <textarea className="textarea" placeholder="Your resume content..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={10} />
              <div className="textarea-footer"><span>{resumeText.length} characters</span><span className="badge">Ready</span></div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-icon">💼</div><div><h3>Job Description</h3><p>Sample job data pre-loaded</p></div></div>
            <div className="card-body">
              <textarea className="textarea" placeholder="Job description..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={12} />
              <div className="textarea-footer"><span>{jobDescription.length} characters</span><span className="badge">Ready</span></div>
            </div>
          </div>
        </div>

        <button className="analyze-btn" onClick={analyzeGap} disabled={isLoading}>
          {isLoading ? (<><div className="spinner"></div> Analyzing...</>) : (<>✨ Analyze & Get ATS Score →</>)}
        </button>

        {analysisResult && (
          <div className="results">
            <div className="tabs">
              <button className={`tab ${activeTab === 'ats' ? 'active' : ''}`} onClick={() => setActiveTab('ats')}>🎯 ATS Scorecard</button>
              <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Skill Overview</button>
            </div>

    {activeTab === 'ats' && (
  <div className="ats-dashboard-container">
    {/* Dashboard Header */}
    <div className="dashboard-top-nav">
      <div className="nav-left">
        <h2>ATS Score Dashboard </h2>
        <p>Advanced AI-driven analysis to optimize your resume for Applicant Tracking Systems</p>
      </div>
    </div>

    {/* Top Grid: Overall Score & Splitup */}
    <div className="ats-main-grid">
      <div className="dashboard-card score-hero">
        <div className="card-label">OVERALL ATS SCORE ⓘ</div>
        <div className="score-hero-flex">
          <div className="gauge-wrapper">
            <svg viewBox="0 0 100 100">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <circle className="gauge-bg" cx="50" cy="50" r="45" />
              <circle className="gauge-fill" cx="50" cy="50" r="45" 
                style={{ strokeDashoffset: 283 - (283 * analysisResult.atsScore) / 100 }} 
              />
            </svg>
            <div className="gauge-text">
              <span className="big-num">{analysisResult.atsScore}</span>
              <span className="total-num">/ 100</span>
              <div className="status-tag">Excellent</div>
            </div>
          </div>
          <div className="verdict-content">
            <h3>Great Job! </h3>
            <p>Your resume is well-optimized for ATS. You're in the top 20% of applicants.</p>
            <div className="trend-stat">
              <span className="trend-up">▲ 12%</span>
              <span className="trend-label">Score improved from last analysis</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-card splitup-hero">
        <div className="card-header-flex">
          <div className="card-label">SCORE SPLITUP ⓘ</div>
          <span className="help-link">How it works?</span>
        </div>
        <div className="splitup-flex">
          <div className="doughnut-container">
            <div className="doughnut-mock">
              <div className="inner-icon"></div>
            </div>
          </div>
          <div className="progress-list">
            <div className="prog-item"><span className="dot s"></span> Skills <b>{analysisResult.skillScore} / 100</b> <div className="p-bar"><div className="p-fill s" style={{width: `${analysisResult.skillScore}%`}}></div></div></div>
            <div className="prog-item"><span className="dot e"></span> Experience <b>{analysisResult.experienceScore} / 100</b> <div className="p-bar"><div className="p-fill e" style={{width: `${analysisResult.experienceScore}%`}}></div></div></div>
            <div className="prog-item"><span className="dot ed"></span> Education <b>80 / 100</b> <div className="p-bar"><div className="p-fill ed" style={{width: '80%'}}></div></div></div>
            <div className="prog-item"><span className="dot k"></span> Keywords <b>{analysisResult.keywordsScore} / 100</b> <div className="p-bar"><div className="p-fill k" style={{width: `${analysisResult.keywordsScore}%`}}></div></div></div>
            <div className="prog-item"><span className="dot f"></span> Formatting <b>{analysisResult.formattingScore} / 100</b> <div className="p-bar"><div className="p-fill f" style={{width: `${analysisResult.formattingScore}%`}}></div></div></div>
          </div>
        </div>
      </div>
    </div>

   {/* TWO COLUMN LAYOUT */}
<div className="two-column-layout">

  {/* TOP - MISSING SKILLS */}
  <div className="dashboard-card missing-skills-premium">
    
    <div className="missing-skills-header">
      
      <div className="missing-skills-title">
        <div className="title-icon">📋</div>

        <div>
          <h3>MISSING SKILLS</h3>
          <p>
            Top skills missing from your resume based on the job description
          </p>
        </div>
      </div>

      <div className="missing-count-badge">
        <span className="count-number">
          {analysisResult.missingSkills.length}
        </span>

        <span className="count-label">
          Skills Missing
        </span>
      </div>
    </div>

    <div className="missing-skills-grid-modern">

      {analysisResult.missingSkills.slice(0, 8).map((skill, idx) => {

        const skillIcons = {
  'aws': 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',

  'kubernetes': 'https://www.vectorlogo.zone/logos/kubernetes/kubernetes-icon.svg',

  'node.js': 'https://www.vectorlogo.zone/logos/nodejs/nodejs-icon.svg',

  'mongodb': 'https://www.vectorlogo.zone/logos/mongodb/mongodb-icon.svg',

  'docker': 'https://www.vectorlogo.zone/logos/docker/docker-icon.svg',

  'react.js': 'https://www.vectorlogo.zone/logos/reactjs/reactjs-icon.svg',

  'typescript': 'https://www.vectorlogo.zone/logos/typescriptlang/typescriptlang-icon.svg',

  'graphql': 'https://www.vectorlogo.zone/logos/graphql/graphql-icon.svg',

  'postgresql': 'https://www.vectorlogo.zone/logos/postgresql/postgresql-icon.svg',

  'redis': 'https://www.vectorlogo.zone/logos/redis/redis-icon.svg',

  'next.js': 'https://cdn.worldvectorlogo.com/logos/next-js.svg',

  'java': 'https://www.vectorlogo.zone/logos/java/java-icon.svg',

  'python': 'https://www.vectorlogo.zone/logos/python/python-icon.svg',

  'git': 'https://www.vectorlogo.zone/logos/git-scm/git-scm-icon.svg',

  'tailwind css': 'https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg',

  'express.js': 'https://cdn.worldvectorlogo.com/logos/express-109.svg',

  'django': 'https://cdn.worldvectorlogo.com/logos/django.svg',

  'mysql': 'https://www.vectorlogo.zone/logos/mysql/mysql-icon.svg',

  'redux': 'https://raw.githubusercontent.com/reduxjs/redux/master/logo/logo.png',

  'html': 'https://www.vectorlogo.zone/logos/w3_html5/w3_html5-icon.svg',

  'css': 'https://www.vectorlogo.zone/logos/w3_css/w3_css-icon.svg',

  'api design': 'https://cdn-icons-png.flaticon.com/512/2165/2165004.png',

  'mentoring': 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',

  'agile': 'https://cdn-icons-png.flaticon.com/512/2620/2620971.png',

  'communication': 'https://cdn-icons-png.flaticon.com/512/3050/3050525.png',

  'leadership': 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',

  'problem solving': 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png'
};

        const colors = [
          'orange',
          'blue',
          'green',
          'purple',
          'pink',
          'cyan',
          'amber',
          'indigo'
        ];

        const colorClass = colors[idx % colors.length];

        return (
          <div
            key={idx}
            className={`missing-skill-tile ${colorClass}`}
          >

            <div className="skill-tile-left">

              <div className="skill-logo-circle">
                <img
                  src={
                    skillIcons[skill.toLowerCase()] ||
                    'https://cdn-icons-png.flaticon.com/512/1055/1055687.png'
                  }
                  alt={skill}
                onError={(e) => { 
  e.target.src = 'https://cdn-icons-png.flaticon.com/512/1055/1055687.png';
}}
                />
              </div>

              <span className="skill-name">
                {skill}
              </span>
            </div>

            <div className="skill-tile-dots">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>

          </div>
        );
      })}
    </div>
  </div>

  {/* BOTTOM - TIPS */}
  <div className="dashboard-card tips-section-full">

    <div className="card-header-flex">
      <div className="card-label">
        💡 TIPS & RECOMMENDATIONS
      </div>
    </div>

    <div className="tips-list-premium">

      <div className="tip-item-premium">
        <div className="tip-icon-wrapper keyword">
          ✏️
        </div>

        <div className="tip-content-premium">
          <h4>Add more relevant keywords</h4>
          <p>Helps ATS understand your resume better</p>
        </div>
      </div>

      <div className="tip-item-premium">
        <div className="tip-icon-wrapper format">
          📄
        </div>

        <div className="tip-content-premium">
          <h4>Improve formatting for better readability</h4>
          <p>Use standard headings and avoid tables</p>
        </div>
      </div>

      <div className="tip-item-premium">
        <div className="tip-icon-wrapper achievement">
          📊
        </div>

        <div className="tip-content-premium">
          <h4>Add more quantifiable achievements</h4>
          <p>Include numbers and metrics in your experience</p>
        </div>
      </div>

      <div className="tip-item-premium">
        <div className="tip-icon-wrapper keyword">
          🎯
        </div>

        <div className="tip-content-premium">
          <h4>Match job description language</h4>
          <p>Use exact phrases from the job posting</p>
        </div>
      </div>

    </div>
  </div>

</div>

    {/* Additional Insights Section */}
    <div className="ats-main-grid">
      <div className="dashboard-card insights-card">
        <div className="card-label">📊 QUICK INSIGHTS</div>
        <div className="insights-flex">
          <div className="insight-item-v2">
            <div className="i-icon">⏱️</div>
            <div>
              <small>Estimated Learning Time</small>
              <strong>{analysisResult.learningTime}</strong>
              <span className="check">to close the gap</span>
            </div>
          </div>
          <div className="insight-item-v2">
            <div className="i-icon">🎯</div>
            <div>
              <small>Top Priority Skill</small>
              <strong>{analysisResult.missingSkills[0] || 'None'}</strong>
              <span className="check">focus on this first</span>
            </div>
          </div>
          <div className="insight-item-v2">
            <div className="i-icon">📈</div>
            <div>
              <small>Match Improvement</small>
              <strong>+35%</strong>
              <span className="check">after learning missing skills</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
            {activeTab === 'overview' && (
              <div className="overview-modern">
                <div className="modern-stats-grid">
                  <div className="modern-stat-card"><div className="stat-header"><span className="stat-title">Match Score</span><span className="stat-value-large">{analysisResult.matchScore}%</span></div><div className="stat-progress"><div className="stat-progress-bar" style={{ width: `${analysisResult.matchScore}%` }}></div></div></div>
                  <div className="modern-stat-card"><div className="stat-header"><span className="stat-title">Matched Skills</span><span className="stat-value-large success">{analysisResult.matchedSkills.length}</span></div><div className="stat-subtext">out of {analysisResult.totalJobSkills} required</div></div>
                  <div className="modern-stat-card"><div className="stat-header"><span className="stat-title">Skills Gap</span><span className="stat-value-large warning">{analysisResult.missingSkills.length}</span></div><div className="stat-subtext">skills to acquire</div></div>
                </div>
                <div className="modern-verdict" style={{ background: analysisResult.verdict.bg }}><div><h3 style={{ color: analysisResult.verdict.color }}>{analysisResult.verdict.text}</h3><p>{analysisResult.verdict.subtext}</p></div><div className="verdict-badge"><span>Analysis Complete</span></div></div>
                <div className="modern-section"><div className="section-header-modern"><h3>💪 Your Strengths</h3><div className="strength-count">{analysisResult.matchedSkills.length} skills matched</div></div><div className="strength-tags">{analysisResult.matchedSkills.map((skill, i) => (<span key={i} className="strength-tag">{skill}</span>))}</div></div>
                <div className="modern-section"><div className="section-header-modern"><h3>🔍 Keyword Density Analysis</h3><div className="keyword-stats"><span className="keyword-found-count">{analysisResult.matchedSkills.length}</span><span> found out of </span><span className="keyword-total-count">{analysisResult.totalJobSkills}</span></div></div><div className="keyword-grid-modern">{analysisResult.keywordCheckResults?.filter(item => !item.present).slice(0, 20).map((item, idx) => (<div key={idx} className="keyword-item-modern missing"><div className="keyword-top"><span className="keyword-name">{item.keyword}</span><span className="keyword-missing-badge">✕ Missing</span></div><div className="missing-info-card"><div className="info-icon">💡</div><div className="missing-content"><div className="missing-title-text">Improve this skill in your resume</div><div className="missing-suggestion">{getKeywordSuggestion(item.keyword)}</div></div></div></div>))}</div></div>
                <div className="modern-section"><div className="section-header-modern"><h3>🎯 Priority Learning Path</h3><div className="priority-filters"><span className="priority-dot high"></span><span>High</span><span className="priority-dot medium"></span><span>Medium</span><span className="priority-dot low"></span><span>Low</span></div></div><div className="priority-list">{analysisResult.missingSkills.map((skill, idx) => { const priority = getPriorityLevel(skill, idx); const resources = getLearningResources(skill); return (<div key={idx} className={`priority-card ${priority}`}><div className="priority-card-header"><div className="priority-info"><span className="priority-badge" style={{ background: getPriorityColor(priority) }}>{priority === 'high' ? 'High Priority' : priority === 'medium' ? 'Medium Priority' : 'Low Priority'}</span><span className="priority-skill-name">{skill}</span></div><div className="time-estimate">{getRecommendation(skill).split('•')[1] || '2-3 weeks'}</div></div><div className="priority-recommendation">{getRecommendation(skill)}</div><div className="resources-section"><div className="resources-label">📖 Learning Resources</div><div className="resources-links">{resources.map((resource, ridx) => (<a key={ridx} href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-btn">{resource.platform}</a>))}</div></div></div>); })}</div></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillGapAnalyzer;