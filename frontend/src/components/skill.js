// skill.js - Complete Enhanced File with PDF Upload & Download Report
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import Tesseract from 'tesseract.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './skill.css';
import f1 from "./f1.png";
import f2 from "./f2.png";
import f3 from "./f3.png";
import f4 from "./f4.png";
import f5 from "./f5.png";
import f6 from "./f6.png";
import f7 from "./f7.png";
import f8 from "./f8.png";

pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL || ''}/pdf.worker.min.mjs`;

const SkillGapAnalyzer = () => {
  const [resumeText, setResumeText] = useState('');
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
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

  const loadPdfDocument = async (file, arrayBuffer) => {
    const pdfData = new Uint8Array(arrayBuffer);
    const loadAttempts = [
      () => pdfjsLib.getDocument({
        data: pdfData,
        useSystemFonts: true,
        verbosity: 0,
      }).promise,
      () => {
        const objectUrl = URL.createObjectURL(file);
        return pdfjsLib
          .getDocument({
            url: objectUrl,
            useSystemFonts: true,
            verbosity: 0,
          })
          .promise.finally(() => URL.revokeObjectURL(objectUrl));
      },
      async () => {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('Failed to convert PDF into a data URL.'));
          reader.readAsDataURL(file);
        });

        return pdfjsLib.getDocument({
          url: dataUrl,
          useSystemFonts: true,
          verbosity: 0,
        }).promise;
      },
    ];

    let lastError = null;

    for (const attempt of loadAttempts) {
      try {
        return await attempt();
      } catch (error) {
        lastError = error;
        console.warn('PDF load attempt failed:', error);
      }
    }

    throw lastError || new Error('Unable to load the PDF document.');
  };

  // ==================== PDF UPLOAD FUNCTION ====================
  const handlePDFUpload = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }
    setFileName(file.name);
    setUploadStatus(null);
    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await loadPdfDocument(file, arrayBuffer);
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      if (fullText.trim()) {
        setResumeText(fullText);
        setUploadStatus({
          type: 'success',
          message: `PDF loaded successfully. Extracted text from ${pdf.numPages} page${pdf.numPages > 1 ? 's' : ''}.`,
        });
      } else {
        setUploadStatus({
          type: 'warning',
          message: 'No selectable text found. Trying OCR on the scanned PDF now. This may take a little longer.',
        });

        let ocrText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          setUploadStatus({
            type: 'warning',
            message: `Running OCR on page ${i} of ${pdf.numPages}...`,
          });

          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport,
          }).promise;

          const { data } = await Tesseract.recognize(canvas, 'eng');
          ocrText += `${data.text || ''}\n\n`;
        }

        if (ocrText.trim()) {
          setResumeText(ocrText);
          setUploadStatus({
            type: 'success',
            message: `Scanned PDF processed with OCR successfully. Extracted text from ${pdf.numPages} page${pdf.numPages > 1 ? 's' : ''}.`,
          });
        } else {
          setResumeText('');
          setUploadStatus({
            type: 'warning',
            message: 'OCR could not detect readable text from this PDF. Please paste the resume text manually or upload a clearer PDF/TXT file.',
          });
        }
      }
    } catch (error) {
      console.error('PDF parsing error:', error);
      setResumeText('');
      setUploadStatus({
        type: 'error',
        message: `Unable to read this PDF${error?.message ? `: ${error.message}` : ''}. Please try another file or paste the resume text manually.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== DOWNLOAD REPORT AS PDF ====================
  const downloadReportAsPDF = async () => {
    if (!analysisResult) {
      alert('Please analyze your resume first before downloading the report.');
      return;
    }
    setIsDownloading(true);
    try {
      const element = document.querySelector('.sgap-ats-dashboard-container');
      if (!element) {
        alert('Report container not found. Please run analysis first.');
        return;
      }
      const originalOverflow = element.style.overflow;
      const originalHeight = element.style.height;
      element.style.overflow = 'visible';
      element.style.height = 'auto';
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let position = 0;
      let heightLeft = imgHeight;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      pdf.save(`ATS_Report_${new Date().toLocaleDateString()}.pdf`);
      element.style.overflow = originalOverflow;
      element.style.height = originalHeight;
      alert('✅ Report downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    if (file.type === 'application/pdf') {
      handlePDFUpload(file);
    } else if (file.type === 'text/plain') {
      setFileName(file.name);
      setUploadStatus(null);
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeText(e.target.result || '');
        setUploadStatus({
          type: 'success',
          message: 'TXT file loaded successfully.',
        });
        setIsLoading(false);
      };
      reader.onerror = () => {
        setIsLoading(false);
        setUploadStatus({
          type: 'error',
          message: 'Unable to read the TXT file. Please try again.',
        });
      };
      reader.readAsText(file);
    } else {
      alert('Please upload PDF or TXT files only');
    }
  };

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

      localStorage.setItem(
        'analysisResult',
        JSON.stringify({
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
          resumeText,
          jobDescription,
          fileName,
        })
      );

      setIsLoading(false);
      navigate('/skilldashboard');
    }, 1500);
  };

  return (
    <div className="sgap-app">

      {/* Background Decoration */}
      <div className="sgap-bg-decoration">
        <div className="sgap-circle sgap-circle-1"></div>
        <div className="sgap-circle sgap-circle-2"></div>
        <div className="sgap-circle sgap-circle-3"></div>
        <div className="sgap-dots-pattern"></div>
      </div>

      {/* ✅ Wellness Layout Wrapper — same as FAQ page */}
      <div className="wellness-layout-wrapper">

        {/* Left Side Ad */}
        <div className="side-ad left-ad">
          <div className="ad-track move-down">
            <img src={f1} alt="Ad" />
            <img src={f2} alt="Ad" />
            <img src={f3} alt="Ad" />
            <img src={f4} alt="Ad" />
            <img src={f5} alt="Ad" />
            <img src={f1} alt="Ad" />
            <img src={f2} alt="Ad" />
            <img src={f3} alt="Ad" />
            <img src={f4} alt="Ad" />
            <img src={f5} alt="Ad" />
          </div>
        </div>

        {/* Right Side Ad */}
        <div className="side-ad right-ad">
          <div className="ad-track move-up">
            <img src={f6} alt="Ad" />
            <img src={f7} alt="Ad" />
            <img src={f8} alt="Ad" />
            <img src={f1} alt="Ad" />
            <img src={f6} alt="Ad" />
            <img src={f7} alt="Ad" />
            <img src={f8} alt="Ad" />
            <img src={f1} alt="Ad" />
          </div>
        </div>

        {/* Main Content */}
        <div className="sgap-container">

          {analysisResult && (
            <div className="sgap-download-report-btn-container">
              <button
                className="sgap-download-report-btn"
                onClick={downloadReportAsPDF}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <div className="sgap-spinner-small"></div>
                    Generating PDF...
                  </>
                ) : (
                  <>📥 Download Report as PDF</>
                )}
              </button>
            </div>
          )}

          <div className="sgap-hero">
            <div className="sgap-hero-badge-top">
              <span className="sgap-badge-spark">✨</span>
              <span>AI-Powered Career Intelligence</span>
            </div>

            <div className="sgap-hero-title-section">
              <h1 className="sgap-hero-main-title">
                <span className="sgap-title-line-1">Bridge Your</span>
                <span className="sgap-title-line-2 gradient-text"> Skill Gap</span>
              </h1>
              <div className="sgap-hero-breadcrumb">
                <span className="sgap-breadcrumb-dot"></span>
                <span>Resume → Analyze → Grow</span>
                <span className="sgap-breadcrumb-dot"></span>
              </div>
            </div>

            <p className="sgap-hero-description-simple">
              Upload your resume (PDF or TXT) and job description — get instant skill gap analysis,
              personalized learning recommendations, and ATS optimization tips to land your dream role.
            </p>

            <div className="sgap-hero-feature-strip">
              <div className="sgap-strip-item"><span>⚡</span><span>Instant Analysis</span></div>
              <div className="sgap-strip-divider"></div>
              <div className="sgap-strip-item"><span>🎯</span><span>Smart Matching</span></div>
              <div className="sgap-strip-divider"></div>
              <div className="sgap-strip-item"><span>📚</span><span>Learning Path</span></div>
              <div className="sgap-strip-divider"></div>
              <div className="sgap-strip-item"><span>💎</span><span>ATS Ready</span></div>
              <div className="sgap-strip-divider"></div>
              <div className="sgap-strip-item"><span>📄</span><span>PDF Support</span></div>
            </div>
          </div>

          <div className="sgap-cards-grid">
            <div className="sgap-card">
              <div className="sgap-card-header">
                <div className="sgap-card-icon">📄</div>
                <div>
                  <h3>Your Resume</h3>
                  <p>Upload PDF or TXT to extract your resume</p>
                </div>
              </div>
              <div className="card-body">
                <div
                  className={`sgap-drop-zone ${isDragging ? 'sgap-dragging' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileUpload(e.dataTransfer.files[0]); }}
                >
                  <div className="sgap-drop-icon">📁</div>
                  <p>Drag & drop or <span>browse</span></p>
                  <small>PDF or TXT files only</small>
                  {fileName && <div className="sgap-file-name">{fileName}</div>}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,application/pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                  />
                </div>
                <textarea
                  className="sgap-textarea"
                  placeholder="Upload your resume or paste the extracted text here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={10}
                />
                <div className="sgap-textarea-footer">
                  <span>{resumeText.length} characters</span>
                  <span className="sgap-badge">{fileName ? 'PDF Uploaded' : 'Ready'}</span>
                </div>
                {uploadStatus && (
                  <div
                    className="sgap-upload-status"
                    style={{
                      marginTop: '12px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      background:
                        uploadStatus.type === 'success'
                          ? '#ecfdf5'
                          : uploadStatus.type === 'warning'
                            ? '#fff7ed'
                            : '#fef2f2',
                      color:
                        uploadStatus.type === 'success'
                          ? '#047857'
                          : uploadStatus.type === 'warning'
                            ? '#c2410c'
                            : '#b91c1c',
                      border:
                        uploadStatus.type === 'success'
                          ? '1px solid #a7f3d0'
                          : uploadStatus.type === 'warning'
                            ? '1px solid #fdba74'
                            : '1px solid #fca5a5',
                    }}
                  >
                    {uploadStatus.message}
                  </div>
                )}
              </div>
            </div>

            <div className="sgap-card">
              <div className="sgap-card-header">
                <div className="sgap-card-icon">💼</div>
                <div>
                  <h3>Job Description</h3>
                  <p>Paste job description here</p>
                </div>
              </div>
              <div className="card-body">
                <textarea
                  className="sgap-textarea"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={12}
                />
                <div className="sgap-textarea-footer">
                  <span>{jobDescription.length} characters</span>
                  <span className="sgap-badge">Ready</span>
                </div>
              </div>
            </div>
          </div>

          <button
            className="sgap-analyze-btn"
            onClick={analyzeGap}
            disabled={isLoading || !resumeText.trim() || !jobDescription.trim()}
          >
            {isLoading
              ? (<><div className="sgap-spinner"></div> Analyzing...</>)
              : (<>✨ Analyze & Get ATS Score →</>)
            }
          </button>

        </div>
        

      </div>
      

    </div>
    
  );
};

export default SkillGapAnalyzer;
