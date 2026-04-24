JSON_RESPONSE_RULES = """
Return valid JSON only. No markdown fences. No explanation outside JSON.
Return exactly this shape:
{{
  "options": [
    {{
      "label": "short label",
      "focus": "why this angle fits the user context",
      "text": "full suggestion text"
    }},
    {{
      "label": "short label",
      "focus": "why this angle fits the user context",
      "text": "full suggestion text"
    }}
  ]
}}

Rules:
- Always return exactly 2 options.
- The two options must be meaningfully different in angle, not light rewrites.
- Analyze the user's keywords and current section context before choosing the two angles.
- Use concise labels of 2-4 words.
- Do not use placeholder text.
"""


SUMMARY_PROMPTS = {
    "generate": f"""
You are an expert resume writer creating professional summary suggestions.

Create 2 distinct summary options for this candidate.

Candidate Context:
- Job Title: {{title}}
- Skills: {{skills}}
- User Keywords: {{keywords}}
- Experience Context: {{experience_context}}
- Current Summary: {{current_text}}

Requirements:
- 3-4 sentences per option
- ATS friendly
- Focus on value, strengths, and role fit
- Option 1 and Option 2 must take different strategic angles based on the keywords
- If the keywords imply a strong specialization, reflect that in at least one option

{JSON_RESPONSE_RULES}
""",
    "improve": f"""
You are improving a resume summary.

Create 2 distinct improved summary options for this candidate.

Candidate Context:
- Job Title: {{title}}
- Skills: {{skills}}
- User Keywords: {{keywords}}
- Current Summary: {{current_text}}

Requirements:
- Keep the meaning grounded in the original summary
- Make it sharper, more ATS friendly, and more role-relevant
- Use 2 clearly different positioning angles

{JSON_RESPONSE_RULES}
""",
}


PROJECTS_PROMPTS = {
    "generate": f"""
You are an expert resume writer creating project description suggestions.

Create 2 distinct resume-ready project highlight options for this project.

Project Context:
- Candidate Title: {{title}}
- Project Name: {{project_name}}
- Tech Stack: {{tech_stack}}
- User Keywords: {{keywords}}
- Extra Context: {{context}}
- Current Description: {{current_text}}

Requirements:
- Each option should be 2-4 sentences
- Mention what was built, stack, and impact
- Make the options different in angle, such as technical depth, product impact, leadership, scale, or performance
- Avoid bullet points

{JSON_RESPONSE_RULES}
""",
    "improve": f"""
You are improving an existing project description for a resume.

Create 2 stronger project description options.

Project Context:
- Candidate Title: {{title}}
- Project Name: {{project_name}}
- Tech Stack: {{tech_stack}}
- User Keywords: {{keywords}}
- Current Description: {{current_text}}

Requirements:
- Keep the original meaning intact where possible
- Improve clarity, ATS relevance, and impact
- Make the 2 options clearly different in emphasis

{JSON_RESPONSE_RULES}
""",
}


EXPERIENCE_PROMPTS = {
    "generate": f"""
You are an expert resume writer creating work experience suggestions.

Create 2 distinct experience description options for this role.

Role Context:
- Company: {{company}}
- Role: {{role}}
- Duration: {{duration}}
- Responsibilities: {{responsibilities}}
- Tech Stack: {{tech}}
- User Keywords: {{keywords}}
- Current Description: {{current_text}}

Requirements:
- Each option should be 3-5 resume-ready sentences
- Show ownership, tools, and business impact
- Use strong action verbs
- The 2 options must differ in emphasis based on the keywords and context
- Avoid bullets

{JSON_RESPONSE_RULES}
""",
    "improve": f"""
You are improving an experience description for a resume.

Create 2 distinct improved options.

Role Context:
- Company: {{company}}
- Role: {{role}}
- Responsibilities: {{responsibilities}}
- Tech Stack: {{tech}}
- User Keywords: {{keywords}}
- Current Description: {{current_text}}

Requirements:
- Preserve core meaning
- Improve clarity, ATS keywords, and measurable impact
- Use 2 clearly different emphasis angles

{JSON_RESPONSE_RULES}
""",
}


CERTIFICATIONS_PROMPTS = {
    "generate": f"""
You are an expert resume writer creating certification highlight suggestions.

Create 2 distinct certification highlight options.

Certification Context:
- Candidate Title: {{title}}
- Certification Name: {{certification_name}}
- Issuer: {{issuer}}
- Current Skills: {{skills}}
- Industry: {{industry}}
- User Keywords: {{keywords}}
- Current Highlights: {{current_text}}

Requirements:
- Each option should be 2-4 sentences
- Explain what the certification validates and why it matters
- Make the 2 options different in angle, such as competency-led, applied impact, specialization, or career relevance

{JSON_RESPONSE_RULES}
""",
    "improve": f"""
You are improving certification highlights for a resume.

Create 2 distinct improved options.

Certification Context:
- Certification Name: {{certification_name}}
- Issuer: {{issuer}}
- User Keywords: {{keywords}}
- Current Highlights: {{current_text}}

Requirements:
- Keep the content professional and ATS friendly
- Create 2 clearly distinct angles

{JSON_RESPONSE_RULES}
""",
}


EDUCATION_PROMPTS = {
    "generate": f"""
You are an expert resume writer creating education highlight suggestions.

Create 2 distinct education highlight options.

Education Context:
- Degree: {{degree}}
- Field: {{field}}
- Institution: {{university}}
- Year: {{year}}
- Coursework / Extra Context: {{coursework}}
- User Keywords: {{keywords}}
- Current Highlights: {{current_text}}

Requirements:
- Each option should be 2-4 sentences
- One option can lean academic/technical while the other can lean profile/achievement/holistic if the context supports it
- Use the user's keywords to decide the best two angles
- Keep it resume-ready and ATS friendly

{JSON_RESPONSE_RULES}
""",
    "improve": f"""
You are improving education highlights for a resume.

Create 2 distinct improved options.

Education Context:
- Degree: {{degree}}
- Field: {{field}}
- Institution: {{university}}
- User Keywords: {{keywords}}
- Current Highlights: {{current_text}}

Requirements:
- Preserve the original meaning where reasonable
- Create 2 clearly different angles with polished wording

{JSON_RESPONSE_RULES}
""",
}


SKILLS_PROMPTS = {
    "generate": """
Suggest relevant skills for a {title} professional.

Current skills mentioned: {current_skills}
Experience level: {level}

Return a JSON object with skills categorized:
{
    "technical": ["skill1", "skill2", "skill3"],
    "soft": ["skill1", "skill2"],
    "tools": ["tool1", "tool2"]
}

Include 5-7 technical skills, 3-4 soft skills, 3-4 tools.
"""
}
