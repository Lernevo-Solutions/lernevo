# skill_gap_prompts.py

SKILL_GAP_PROMPT = """
You are an expert ATS Resume Analyzer and Career AI with 10+ years of experience.

Analyze the user's resume against the provided job description carefully. Identify matching competencies and clear technological skill gaps, then return ONLY valid JSON.

Resume:
{resume_text}

Job Description:
{job_description}

Return EXACTLY this JSON structure with real, highly-specific data extracted from the context. Do NOT leave strings empty ("") or arrays blank ([]):

{{
  "ats_score": 65,
  "match_score": 60,
  "gap_score": 40,
  "open_jobs": 1240,
  "salary_range": "15-25 LPA",
  "growth_rate": "24%",

  "skills": [
    {{"skill_name": "React.js", "status": "MATCHED", "score": 90}},
    {{"skill_name": "Node.js", "status": "MATCHED", "score": 85}},
    {{"skill_name": "Express.js", "status": "MISSING", "score": 40}},
    {{"skill_name": "Context API", "status": "MISSING", "score": 35}},
    {{"skill_name": "TypeScript", "status": "MISSING", "score": 30}}
  ],

  "resume_metrics": [
    {{"metric_type": "KEYWORD_DENSITY", "score": 55, "label": "Needs Work"}},
    {{"metric_type": "FORMATTING", "score": 90, "label": "Excellent"}},
    {{"metric_type": "EXPERIENCE_MATCH", "score": 80, "label": "Strong"}},
    {{"metric_type": "SOFT_SKILLS", "score": 45, "label": "Fair"}},
    {{"metric_type": "ATS_COMPATIBILITY", "score": 65, "label": "Solid"}},
    {{"metric_type": "RELEVANCE_SCORE", "score": 60, "label": "Average"}}
  ],

  "job_matches": [
    {{"role_name": "Senior Full Stack Developer", "match_percentage": 82}},
    {{"role_name": "MERN Stack Engineer", "match_percentage": 75}},
    {{"role_name": "React Frontend Lead", "match_percentage": 68}}
  ],

  "career_suggestions": [
    {{"skill_name": "React.js", "role_name": "Frontend Architect"}},
    {{"skill_name": "Node.js", "role_name": "Backend Engineer"}},
    {{"skill_name": "Express.js", "role_name": "API Framework Specialist"}}
  ],

  "learning_roadmaps": [
    {{"skill_name": "Express.js", "youtube_link": "https://youtube.com/results?search_query=express+js+tutorial", "google_link": "https://www.google.com/search?q=learn+express+js"}},
    {{"skill_name": "Context API", "youtube_link": "https://youtube.com/results?search_query=react+context+api+tutorial", "google_link": "https://www.google.com/search?q=react+context+api+patterns"}},
    {{"skill_name": "TypeScript", "youtube_link": "https://youtube.com/results?search_query=typescript+tutorial+beginners", "google_link": "https://www.google.com/search?q=learn+typescript+for+react"}}
  ],

  "improvement_tips": [
    {{"title": "Explicitly list React Hooks and Context API usage", "impact_percentage": 25, "description": "Add specific hooks like useState, useEffect, useContext with real project examples to improve ATS keyword matching."}},
    {{"title": "Detail Express.js middleware and routing", "impact_percentage": 20, "description": "Highlight REST API design, middleware chains and authentication flows built with Express.js."}},
    {{"title": "Quantify project metrics and achievements", "impact_percentage": 18, "description": "Replace vague statements with numbers: improved performance by 40%, reduced load time by 2s, handled 10k requests/day."}},
    {{"title": "Add TypeScript experience or willingness to learn", "impact_percentage": 15, "description": "Even basic TypeScript knowledge or online course completion signals strong adaptability to modern codebases."}},
    {{"title": "Include CI/CD and deployment experience", "impact_percentage": 12, "description": "Mention tools like GitHub Actions, Docker, or AWS deployments to show production-readiness and DevOps awareness."}}
  ],

  "focus_areas": [
    {{"title": "Framework Specialization", "description": "Explicitly write out Hooks, Context API, and state management patterns like Redux or Zustand in your resume.", "priority": "CRITICAL"}},
    {{"title": "Backend API Depth", "description": "Highlight modular Express.js routing, middleware design, and REST API documentation experience.", "priority": "HIGH"}},
    {{"title": "Type Safety and Modern JavaScript", "description": "Learn and showcase TypeScript usage with React components and Node.js services for modern job requirements.", "priority": "HIGH"}},
    {{"title": "Testing and Code Quality", "description": "Add unit testing experience with Jest, React Testing Library, or Cypress to demonstrate production-grade development habits.", "priority": "MEDIUM"}},
    {{"title": "Cloud and Deployment Skills", "description": "Showcase any AWS, GCP, or Azure experience including S3, EC2, Lambda, or containerization with Docker.", "priority": "MEDIUM"}}
  ]
}}

IMPORTANT RULES:
- Return ONLY valid JSON. No conversational text, no markdown, no backticks.
- Never output empty strings like "" for names or roles. If a skill or role is empty, invent a logical industry equivalent based on the Tech Stack context.
- The "skills" array must NOT be empty. Populate it with keywords checked from the Job Description.
- The "learning_roadmaps" array must NOT be empty. Map out links for every missing skill identified.
- The "improvement_tips" array MUST contain EXACTLY 5 items with title, impact_percentage (integer), and description fields.
- The "focus_areas" array MUST contain EXACTLY 5 items with title, description, and priority fields.
- Ensure all numeric values are integers, not strings.
- impact_percentage must be an integer (e.g. 25), NOT a string (e.g. "25%").

"""