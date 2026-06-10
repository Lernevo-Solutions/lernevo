
import json
import logging
import re
import time
from typing import Dict, List, Optional

import google.auth
import requests
from django.conf import settings
from google.auth.transport.requests import Request as GoogleAuthRequest
from .skill_gap_prompts import SKILL_GAP_PROMPT
from .resume_detector_prompts import RESUME_DETECTION_PROMPT
from .vertex_ai_prompts import (
    CERTIFICATIONS_PROMPTS,
    EDUCATION_PROMPTS,
    EXPERIENCE_PROMPTS,
    PROJECTS_PROMPTS,
    SKILLS_PROMPTS,
    SUMMARY_PROMPTS,
)

logger = logging.getLogger(__name__)


class VertexAIService:
    """Vertex AI REST service wrapper for resume-builder prompts."""

    def __init__(self) -> None:
        self._project_id: Optional[str] = None
        self._location: Optional[str] = None
        self._model_name: Optional[str] = None
        self._credentials = None
        # Resume Builder config (larger tokens)
        self._generation_config = {
            "temperature": 0.2,
            "topP": 0.95,
            "maxOutputTokens": 8192,
        }
        # Skill gap config (smaller token limit to reduce quota usage)
        self._skill_gap_generation_config = {
            "temperature": 0.2,
            "topP": 0.95,
            "maxOutputTokens": 3000,
        }

    def _ensure_initialized(self) -> None:
        if self._project_id and self._location and self._model_name and self._credentials:
            return

        project_id = str(getattr(settings, "VERTEX_PROJECT_ID", "") or "").strip()
        location = str(getattr(settings, "VERTEX_LOCATION", "") or "").strip()
        model_name = str(getattr(settings, "VERTEX_MODEL", "") or "").strip()

        if not project_id or not location or not model_name:
            raise RuntimeError(
                "Vertex AI config missing. Expected VERTEX_PROJECT_ID, "
                "VERTEX_LOCATION, and VERTEX_MODEL in settings."
            )

        credentials, detected_project = google.auth.default(
            scopes=["https://www.googleapis.com/auth/cloud-platform"]
        )

        self._project_id = project_id or detected_project
        self._location = location
        self._model_name = model_name
        self._credentials = credentials

        logger.info(
            "Initialized Vertex AI REST client with project=%s location=%s model=%s",
            self._project_id,
            self._location,
            self._model_name,
        )

    def _get_access_token(self) -> str:
        self._ensure_initialized()

        if not self._credentials.valid or not self._credentials.token:
            self._credentials.refresh(GoogleAuthRequest())

        return self._credentials.token

    def _generate_text(self, prompt: str, log_label: str, generation_config: dict = None) -> str:
        token = self._get_access_token()
        model_path = (
            f"projects/{self._project_id}/locations/{self._location}/"
            f"publishers/google/models/{self._model_name}"
        )
        url = f"https://aiplatform.googleapis.com/v1/{model_path}:generateContent"

        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}],
                }
            ],
            "generationConfig": generation_config or self._generation_config,
        }

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=120)
        except Exception as exc:
            logger.exception("Vertex AI %s request transport failed", log_label)
            raise RuntimeError(f"Vertex AI {log_label} request failed: {exc}") from exc

        try:
            response_json = response.json()
            print("========== FULL VERTEX RESPONSE ==========")
            print(json.dumps(response_json, indent=2))
            print("==========================================")
        except ValueError:
            response_json = {"raw": response.text}

        if response.status_code >= 400:
            logger.error("Vertex AI %s request failed: %s", log_label, response_json)
            raise RuntimeError(
                f"Vertex AI {log_label} request failed: "
                f"{response_json.get('error', response_json)}"
            )

        candidates = response_json.get("candidates") or []
        if not candidates:
            raise RuntimeError(f"Vertex AI {log_label} request returned no candidates.")

        parts = (((candidates[0] or {}).get("content") or {}).get("parts")) or []
        text = "".join(part.get("text", "") for part in parts if isinstance(part, dict)).strip()

        if not text:
             logger.warning("Vertex AI returned empty response. Using fallback.")
             if log_label == "skill_gap":
                  return json.dumps(self._get_default_skill_gap_response())
             raise RuntimeError(f"Vertex AI {log_label} request returned an empty response.")

        return text

    def _generate_text_with_retry(self, prompt: str, log_label: str, generation_config: dict = None, max_retries: int = 3) -> str:
        """
        Retry logic for 429 quota errors.
        Waits 10s, 20s, 30s between retries.
        """
        last_error = None
        for attempt in range(max_retries):
            try:
                return self._generate_text(prompt, log_label, generation_config)
            except RuntimeError as e:
                error_str = str(e)
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    wait_seconds = (attempt + 1) * 10  # 10s, 20s, 30s
                    logger.warning(
                        "Vertex AI quota hit (attempt %d/%d). Waiting %ds before retry...",
                        attempt + 1, max_retries, wait_seconds
                    )
                    time.sleep(wait_seconds)
                    last_error = e
                    continue
                else:
                    raise  # Non-quota errors raise immediately

        # All retries exhausted
        logger.error("All %d retries exhausted for %s. Last error: %s", max_retries, log_label, last_error)
        raise last_error

    def _extract_json_payload(self, response_text: str):
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            match = re.search(r"\{[\s\S]*\}", response_text)
            if not match:
                raise
            return json.loads(match.group(0))

    def _clean_text(self, value: Optional[str]) -> str:
        return re.sub(r"\s+", " ", str(value or "")).strip()

    def _safe_trim(self, text: str, limit: int) -> str:
        """Clean + trim text safely for LLM input"""
        if not text:
            return ""

        # remove extra whitespace (important for OCR)
        text = re.sub(r"\s+", " ", text).strip()

        return text[:limit]

    def _fallback_options(self, primary_text: str, secondary_text: str) -> Dict:
        first = self._clean_text(primary_text)
        second = self._clean_text(secondary_text)
        if not second or second == first:
            second = f"{first} Tailored to emphasize complementary strengths and keywords."
        return {
            "options": [
                {
                    "label": "Keyword Matched",
                    "focus": "Highlights the most relevant strengths from the provided context.",
                    "text": first,
                },
                {
                    "label": "Alternate Angle",
                    "focus": "Presents the same profile through a different resume-ready emphasis.",
                    "text": second,
                },
            ]
        }

    def _normalize_option_response(self, response_text: str, fallback_seed: str) -> Dict:
        try:
            payload = self._extract_json_payload(response_text)
        except json.JSONDecodeError:
            return self._fallback_options(fallback_seed, response_text)

        raw_options = payload.get("options") if isinstance(payload, dict) else None
        normalized: List[Dict[str, str]] = []
        if isinstance(raw_options, list):
            for idx, option in enumerate(raw_options[:2]):
                if not isinstance(option, dict):
                    continue
                text = self._clean_text(option.get("text"))
                if not text:
                    continue
                label = self._clean_text(option.get("label")) or f"Option {idx + 1}"
                focus = self._clean_text(option.get("focus"))
                normalized.append(
                    {
                        "label": label,
                        "focus": focus,
                        "text": text,
                    }
                )

        if len(normalized) == 2 and normalized[0]["text"] != normalized[1]["text"]:
            return {"options": normalized}

        fallback_alt = normalized[0]["text"] if normalized else response_text
        return self._fallback_options(fallback_seed, fallback_alt)

    # ============================================================
    # RESUME BUILDER METHODS - GENERATE SUMMARY
    # ============================================================
    def generate_summary(self, user_data: Dict, action: str, current_text: str = "") -> Dict:
        title = user_data.get("title", "Professional")
        skills = user_data.get("skills", "")
        keywords = user_data.get("keywords", "")
        experience_context = user_data.get("experience_context", user_data.get("experience", ""))
        target_word_count = user_data.get("target_word_count", 100)
        
        if action == "generate":
            prompt = SUMMARY_PROMPTS["generate"].format(
                title=title,
                skills=skills,
                keywords=keywords,
                experience_context=experience_context,
                current_text=current_text,
                target_word_count=target_word_count,
            )
        else:
            prompt = SUMMARY_PROMPTS["improve"].format(
                title=title,
                skills=skills,
                keywords=keywords,
                current_text=current_text,
                target_word_count=target_word_count,
            )

        response_text = self._generate_text(prompt, "summary")
        fallback_seed = current_text or user_data.get("current_text") or response_text
        return self._normalize_option_response(response_text, fallback_seed)

    # ============================================================
    # RESUME BUILDER METHODS - GENERATE EXPERIENCE (FIXED)
    # ============================================================
    def generate_experience(self, user_data: Dict, action: str, current_experience: str = "") -> Dict:
        role = user_data.get("role", "Professional")
        company = user_data.get("company", "")
        duration = user_data.get("duration", "Present")
        skills = user_data.get("skills", user_data.get("tech_stack", ""))
        keywords = user_data.get("keywords", "")
        target_word_count = user_data.get("target_word_count", 150)
        responsibilities = user_data.get("responsibilities", "")
        tech = user_data.get("tech_stack", skills)
        
        if action == "generate":
            prompt = EXPERIENCE_PROMPTS["generate"].format(
                role=role,
                company=company,
                duration=duration,
                responsibilities=responsibilities,
                tech=tech,
                keywords=keywords,
                current_text=current_experience,
                target_word_count=target_word_count,
            )
        else:
            prompt = EXPERIENCE_PROMPTS["improve"].format(
                role=role,
                company=company,
                responsibilities=responsibilities,
                tech=tech,
                keywords=keywords,
                current_text=current_experience,
                target_word_count=target_word_count,
            )

        response_text = self._generate_text(prompt, "experience")
        fallback_seed = current_experience or user_data.get("current_text") or response_text
        return self._normalize_option_response(response_text, fallback_seed)

    # ============================================================
    # RESUME BUILDER METHODS - GENERATE PROJECTS
    # ============================================================
    def generate_projects(self, user_data: Dict, action: str, current_projects: str = "") -> Dict:
        title = user_data.get("title", user_data.get("role", "Developer"))
        project_name = user_data.get("project_name", "Project")
        tech_stack = user_data.get("tech_stack", "")
        keywords = user_data.get("keywords", "")
        context = user_data.get("context", "")
        target_word_count = user_data.get("target_word_count", 120)
        
        if action == "generate":
            prompt = PROJECTS_PROMPTS["generate"].format(
                title=title,
                project_name=project_name,
                tech_stack=tech_stack,
                keywords=keywords,
                context=context,
                current_text=current_projects,
                target_word_count=target_word_count,
            )
        else:
            prompt = PROJECTS_PROMPTS["improve"].format(
                title=title,
                project_name=project_name,
                tech_stack=tech_stack,
                keywords=keywords,
                current_text=current_projects,
                target_word_count=target_word_count,
            )

        response_text = self._generate_text(prompt, "projects")
        fallback_seed = current_projects or user_data.get("current_text") or response_text
        return self._normalize_option_response(response_text, fallback_seed)

    # ============================================================
    # RESUME BUILDER METHODS - GENERATE CERTIFICATIONS (FIXED)
    # ============================================================
    def generate_certifications(self, user_data: Dict, action: str, current_certs: str = "") -> Dict:
        title = user_data.get("title", "Professional")
        certification_name = user_data.get("certification_name", "")
        issuer = user_data.get("issuer", "")
        skills = user_data.get("skills", "")
        keywords = user_data.get("keywords", "")
        target_word_count = user_data.get("target_word_count", 100)
        industry = user_data.get("industry", "Technology")
        
        if action == "generate":
            prompt = CERTIFICATIONS_PROMPTS["generate"].format(
                title=title,
                certification_name=certification_name,
                issuer=issuer,
                skills=skills,
                industry=industry,
                keywords=keywords,
                current_text=current_certs,
                target_word_count=target_word_count,
            )
        else:
            prompt = CERTIFICATIONS_PROMPTS["improve"].format(
                certification_name=certification_name,
                issuer=issuer,
                keywords=keywords,
                current_text=current_certs,
                target_word_count=target_word_count,
            )

        response_text = self._generate_text(prompt, "certifications")
        fallback_seed = current_certs or user_data.get("current_text") or response_text
        return self._normalize_option_response(response_text, fallback_seed)

    # ============================================================
    # RESUME BUILDER METHODS - GENERATE EDUCATION
    # ============================================================
    def generate_education(self, user_data: Dict, action: str, current_education: str = "") -> Dict:
        degree = user_data.get("degree", "Bachelor's Degree")
        field = user_data.get("field", "Computer Science")
        university = user_data.get("university", "University")
        year = user_data.get("year", "2024")
        coursework = user_data.get("coursework", "")
        keywords = user_data.get("keywords", "")
        target_word_count = user_data.get("target_word_count", 150)
        
        if action == "generate":
            prompt = EDUCATION_PROMPTS["generate"].format(
                degree=degree,
                field=field,
                university=university,
                year=year,
                coursework=coursework,
                keywords=keywords,
                current_text=current_education,
                target_word_count=target_word_count,
            )
        else:
            prompt = EDUCATION_PROMPTS["improve"].format(
                degree=degree,
                field=field,
                university=university,
                keywords=keywords,
                current_text=current_education,
                target_word_count=target_word_count,
            )

        response_text = self._generate_text(prompt, "education")
        fallback_seed = current_education or user_data.get("current_text") or response_text
        return self._normalize_option_response(response_text, fallback_seed)

    # ============================================================
    # RESUME BUILDER METHODS - GENERATE SKILLS
    # ============================================================
    def generate_skills(self, user_data: Dict) -> Dict:
        title = user_data.get("title", "Professional")
        current_skills = user_data.get("current_skills", "")
        level = user_data.get("level", "Intermediate")
        
        prompt = SKILLS_PROMPTS["generate"].format(
            title=title,
            current_skills=current_skills,
            level=level,
        )

        response_text = self._generate_text(prompt, "skills")

        try:
            payload = self._extract_json_payload(response_text)
        except json.JSONDecodeError:
            payload = {}

        def _normalize_list(value) -> List[str]:
            if isinstance(value, list):
                return [self._clean_text(item) for item in value if self._clean_text(item)]
            return []

        technical = _normalize_list(payload.get("technical") if isinstance(payload, dict) else None)
        soft = _normalize_list(payload.get("soft") if isinstance(payload, dict) else None)
        tools = _normalize_list(payload.get("tools") if isinstance(payload, dict) else None)

        if technical or soft or tools:
            return {"technical": technical, "soft": soft, "tools": tools}

        fallback_skills = [
            self._clean_text(item)
            for item in re.split(r"[\n,•-]+", response_text)
            if self._clean_text(item)
        ]
        return {"technical": fallback_skills[:7], "soft": [], "tools": []}

    # ============================================================
    # SKILL GAP ANALYSIS - DEFAULT RESPONSE
    # ============================================================
    def _get_default_skill_gap_response(self) -> Dict:
        """Fallback template when Vertex AI quota is exhausted."""
        return {
            "ats_score": 65,
            "match_score": 60,
            "gap_score": 40,
            "open_jobs": 2450,
            "salary_range": "18-25 LPA",
            "growth_rate": "22%",
            "skills": [
                {"skill_name": "Python", "status": "MATCHED", "score": 85},
                {"skill_name": "JavaScript", "status": "MATCHED", "score": 75},
                {"skill_name": "AWS", "status": "MISSING", "score": 35},
                {"skill_name": "Docker", "status": "MISSING", "score": 25}
            ],
            "resume_metrics": [
                {"metric_type": "KEYWORD_DENSITY", "score": 68, "label": "Good"},
                {"metric_type": "FORMATTING", "score": 85, "label": "Excellent"},
                {"metric_type": "EXPERIENCE_MATCH", "score": 72, "label": "Good"},
                {"metric_type": "SOFT_SKILLS", "score": 65, "label": "Fair"},
                {"metric_type": "ATS_COMPATIBILITY", "score": 78, "label": "High"},
                {"metric_type": "RELEVANCE_SCORE", "score": 70, "label": "Solid"}
            ],
            "job_matches": [
                {"role_name": "Software Developer", "match_percentage": 75},
                {"role_name": "Full Stack Developer", "match_percentage": 70}
            ],
            "career_suggestions": [
                {"skill_name": "Python", "role_name": "Backend Developer"},
                {"skill_name": "JavaScript", "role_name": "Frontend Developer"},
                {"skill_name": "AWS", "role_name": "Cloud Engineer"}
            ],
            "learning_roadmaps": [
                {
                    "skill_name": "AWS",
                    "youtube_link": "https://youtube.com/results?search_query=aws+tutorial",
                    "google_link": "https://www.google.com/search?q=learn+AWS"
                },
                {
                    "skill_name": "Docker",
                    "youtube_link": "https://youtube.com/results?search_query=docker+tutorial",
                    "google_link": "https://www.google.com/search?q=learn+Docker"
                }
            ],
            "improvement_tips": [
                {"title": "Add Keywords from Job Description", "impact_percentage": 15, "description": "Include relevant keywords from the job posting to improve ATS score."},
                {"title": "Quantify Your Achievements", "impact_percentage": 20, "description": "Add numbers and metrics to your experience bullets."},
                {"title": "Add Cloud Skills Section", "impact_percentage": 18, "description": "Highlight any AWS, GCP or Azure experience you have."},
                {"title": "Strengthen Action Verbs", "impact_percentage": 12, "description": "Start each bullet with strong action verbs like Built, Led, Designed."},
                {"title": "Add a Technical Skills Section", "impact_percentage": 10, "description": "List all your tools and technologies in a dedicated section."}
            ],
            "focus_areas": [
                {"title": "Cloud Infrastructure", "description": "Learn AWS or Azure fundamentals to meet modern job requirements.", "priority": "HIGH"},
                {"title": "Containerization", "description": "Docker and Kubernetes skills are highly demanded in the market.", "priority": "HIGH"},
                {"title": "Keyword Optimization", "description": "Mirror the exact keywords from job descriptions in your resume.", "priority": "MEDIUM"},
                {"title": "Project Metrics", "description": "Quantify impact in every project — performance, users, revenue.", "priority": "MEDIUM"},
                {"title": "Certifications", "description": "Add relevant cloud or tech certifications to boost credibility.", "priority": "LOW"}
            ]
        }

    # ============================================================
    # SKILL GAP ANALYSIS - MAIN METHOD
    # ============================================================
    def analyze_skill_gap(self, resume_text: str, job_description: str) -> Dict:
        """Analyze skill gap — uses retry logic for 429 quota errors."""

        # ============================================================
        # ✅ SAFE INPUT TRIMMING (FIX APPLIED HERE)
        # ============================================================
        resume_text = self._safe_trim(resume_text, 10000)
        job_description = self._safe_trim(job_description, 5000)

        # Debug logs (VERY IMPORTANT for production tracking)
        print("Resume Length:", len(resume_text))
        print("JD Length:", len(job_description))

        # ============================================================
        # SAFETY CHECK
        # ============================================================
        if not resume_text or len(resume_text) < 100:
            logger.warning("Resume text too short for analysis, using default response")
            return self._get_default_skill_gap_response()

        # ============================================================
        # PROMPT BUILD
        # ============================================================
        prompt = SKILL_GAP_PROMPT.format(
            resume_text=resume_text,
            job_description=job_description
        )

        try:
            # ============================================================
            # GEMINI CALL (WITH RETRY + LOW TOKEN CONFIG)
            # ============================================================
            response_text = self._generate_text_with_retry(
                prompt,
                "skill_gap",
                generation_config=self._skill_gap_generation_config,
                max_retries=5
            )

            response_text = response_text.strip()

            # ============================================================
            # CLEAN MARKDOWN CODE BLOCKS
            # ============================================================
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            elif response_text.startswith("```"):
                response_text = response_text[3:]

            if response_text.endswith("```"):
                response_text = response_text[:-3]

            response_text = response_text.strip()

            # ============================================================
            # JSON EXTRACTION
            # ============================================================
            json_match = re.search(r"\{[\s\S]*\}", response_text)
            if json_match:
                response_text = json_match.group(0)

            print("========== AI RAW RESPONSE ==========")
            print(response_text)
            print("=====================================")

            result = json.loads(response_text)

            # ============================================================
            # FILL MISSING KEYS SAFELY
            # ============================================================
            default = self._get_default_skill_gap_response()
            for key in default:
                if key not in result:
                    result[key] = default[key]

            return result

        # ============================================================
        # JSON ERROR HANDLING
        # ============================================================
        except json.JSONDecodeError as e:
            import traceback
            print("========== JSON PARSE ERROR ==========")
            print(response_text)
            print("=====================================")
            traceback.print_exc()

            logger.error(f"Skill gap JSON parsing error: {e}")
            raise Exception(f"Skill Gap JSON Parse Error: {e}")

        # ============================================================
        # GENERAL ERROR HANDLING
        # ============================================================
        except Exception as e:
            import traceback
            print("========== SKILL GAP ERROR ==========")
            print(str(e))
            print("=====================================")
            traceback.print_exc()

            raise Exception(f"Unexpected error in skill_gap: {e}")

    # ============================================================
    # RESUME DETECTION METHODS
    # ============================================================
    def detect_resume_authenticity(self, resume_text: str, job_description: str, ats_score: int) -> Dict:
        """Detect if a resume is AI-written or human-written."""
        
        # Trim inputs dynamically using our custom safe trim utility
        resume_text = self._safe_trim(resume_text, 4000)
        job_description = self._safe_trim(job_description, 2000)
        
        if not resume_text or len(resume_text) < 100:
            return self._get_default_detection_response()
        
        prompt = RESUME_DETECTION_PROMPT.format(
            resume_text=resume_text,
            job_description=job_description,
            ats_score=ats_score
        )
        
        try:
            # Use retry-enabled method with smaller token config
            response_text = self._generate_text_with_retry(
                prompt,
                "resume_detection",
                generation_config=self._skill_gap_generation_config,
                max_retries=3
            )
            
            response_text = response_text.strip()
            
            # Clean markdown code blocks
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            elif response_text.startswith('```'):
                response_text = response_text[3:]
            
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            # Extract JSON
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                response_text = json_match.group(0)
            
            result = json.loads(response_text)
            
            # Ensure probabilities sum to 100
            ai_prob = result.get('ai_written_probability', 50)
            human_prob = result.get('human_written_probability', 50)
            
            if ai_prob + human_prob != 100:
                total = ai_prob + human_prob
                if total > 0:
                    result['ai_written_probability'] = round(ai_prob / total * 100)
                    result['human_written_probability'] = round(human_prob / total * 100)
            
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"Resume detection JSON parsing error: {e}")
            return self._get_default_detection_response()
        except Exception as e:
            logger.error(f"Resume detection error: {e}")
            return self._get_default_detection_response()

    def _get_default_detection_response(self) -> Dict:
        """Fallback response when detection fails."""
        return {
            "resume_type": "Hybrid",
            "detection_confidence": "Medium",
            "ai_written_probability": 35,
            "human_written_probability": 65,
            "ai_signals": [
                "Could not fully analyze due to technical constraints"
            ],
            "human_signals": [
                "Resume contains personal details suggesting human authorship"
            ],
            "strengths": [
                "Basic resume structure detected"
            ],
            "red_flags": [
                "Limited text available for comprehensive analysis"
            ],
            "recommendation": "Add more specific achievements and quantifiable metrics to strengthen your resume.",
            "analyzed_from_text": False
        }


vertex_service = VertexAIService()
