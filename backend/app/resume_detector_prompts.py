RESUME_DETECTION_PROMPT = """
Analyze the following resume and determine whether it appears to be AI-generated, human-written, or a combination of both.

Resume:
{resume_text}

Job Description:
{job_description}

ATS Score:
{ats_score}

Return ONLY valid JSON in the following format:

{{
  "authenticity_score": 0,
  "classification": "Human Written",
  "confidence": 0,
  "indicators": [],
  "summary": ""
}}
"""