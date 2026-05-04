import json
import logging
import re
from typing import Dict, List, Optional

import google.auth
import requests
from django.conf import settings
from google.auth.transport.requests import Request as GoogleAuthRequest

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
        self._generation_config = {
            "temperature": 0.5,
            "topP": 0.95,
            "maxOutputTokens": 800,
        }

    def _ensure_initialized(self) -> None:
        if self._project_id and self._location and self._model_name and self._credentials:
            return

        project_id = str(getattr(settings, "VERTEX_PROJECT_ID", "") or "").strip()
        location = str(getattr(settings, "VERTEX_LOCATION", "") or "").strip()
        model_name = str(getattr(settings, "VERTEX_MODEL", "") or "").strip()

        if not project_id or not location or not model_name:
            raise RuntimeError(
                "Vertex AI config missing. Expected GOOGLE_CLOUD_PROJECT, "
                "VERTEX_LOCATION, and VERTEX_MODEL."
            )

        if not re.fullmatch(r"[A-Za-z0-9._-]+", model_name):
            raise RuntimeError(
                f"Invalid Vertex model name '{model_name}'. "
                "Set VERTEX_MODEL to a plain model id such as "
                "'gemini-3.1-flash-lite-preview'."
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

    def _generate_text(self, prompt: str, log_label: str) -> str:
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
            "generationConfig": self._generation_config,
        }
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=60)
        except Exception as exc:
            logger.exception("Vertex AI %s request transport failed", log_label)
            raise RuntimeError(f"Vertex AI {log_label} request failed: {exc}") from exc

        try:
            response_json = response.json()
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
            raise RuntimeError(f"Vertex AI {log_label} request returned an empty response.")

        return text

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

    def generate_summary(
        self,
        user_data: Dict,
        action: str,
        current_text: str = "",
    ) -> Dict:
        if action == "generate":
            prompt = SUMMARY_PROMPTS["generate"].format(
                title=user_data.get("title", "Professional"),
                skills=user_data.get("skills", ""),
                keywords=user_data.get("keywords", ""),
                experience_context=user_data.get("experience_context", ""),
                current_text=current_text or user_data.get("current_text", ""),
                target_word_count=user_data.get("target_word_count", 100),
            )
        else:
            prompt = SUMMARY_PROMPTS["improve"].format(
                current_text=current_text,
                title=user_data.get("title", "Professional"),
                skills=user_data.get("skills", ""),
                keywords=user_data.get("keywords", ""),
                target_word_count=user_data.get("target_word_count", 100),
            )

        response_text = self._generate_text(prompt, "summary")
        fallback_seed = current_text or user_data.get("current_text") or response_text
        return self._normalize_option_response(response_text, fallback_seed)

    def generate_projects(
        self,
        user_data: Dict,
        action: str,
        current_projects: str = "",
    ) -> Dict:
        if action == "generate":
            prompt = PROJECTS_PROMPTS["generate"].format(
                num_projects=user_data.get("num_projects", 3),
                title=user_data.get("title", "Developer"),
                project_name=user_data.get("project_name", ""),
                tech_stack=user_data.get("tech_stack", ""),
                keywords=user_data.get("keywords", ""),
                context=user_data.get("context", ""),
                current_text=current_projects or user_data.get("current_text", ""),
                target_word_count=user_data.get("target_word_count", 250),
            )
        else:
            prompt = PROJECTS_PROMPTS["improve"].format(
                title=user_data.get("title", "Developer"),
                project_name=user_data.get("project_name", ""),
                tech_stack=user_data.get("tech_stack", ""),
                keywords=user_data.get("keywords", ""),
                current_text=current_projects,
                target_word_count=user_data.get("target_word_count", 250),
            )

        response_text = self._generate_text(prompt, "projects")
        fallback_seed = current_projects or user_data.get("current_text") or response_text
        return self._normalize_option_response(response_text, fallback_seed)

    def generate_experience(
        self,
        user_data: Dict,
        action: str,
        current_bullets: str = "",
    ) -> Dict:
        if action == "generate":
            prompt = EXPERIENCE_PROMPTS["generate"].format(
                role=user_data.get("role", "Professional"),
                company=user_data.get("company", "Company"),
                duration=user_data.get("duration", "Present"),
                responsibilities=user_data.get("responsibilities", ""),
                tech=user_data.get("tech_stack", ""),
                keywords=user_data.get("keywords", ""),
                current_text=current_bullets or user_data.get("current_text", ""),
                target_word_count=user_data.get("target_word_count", 200),
            )
        else:
            prompt = EXPERIENCE_PROMPTS["improve"].format(
                role=user_data.get("role", "Professional"),
                company=user_data.get("company", "Company"),
                responsibilities=user_data.get("responsibilities", ""),
                tech=user_data.get("tech_stack", ""),
                keywords=user_data.get("keywords", ""),
                current_text=current_bullets,
                target_word_count=user_data.get("target_word_count", 200),
            )

        response_text = self._generate_text(prompt, "experience")
        fallback_seed = current_bullets or user_data.get("current_text") or response_text
        return self._normalize_option_response(response_text, fallback_seed)

    def generate_certifications(
        self,
        user_data: Dict,
        action: str,
        current_certs: str = "",
    ) -> Dict:
        if action == "generate":
            prompt = CERTIFICATIONS_PROMPTS["generate"].format(
                title=user_data.get("title", "Professional"),
                certification_name=user_data.get("certification_name", ""),
                issuer=user_data.get("issuer", ""),
                skills=user_data.get("skills", ""),
                industry=user_data.get("industry", "Technology"),
                keywords=user_data.get("keywords", ""),
                current_text=current_certs or user_data.get("current_text", ""),
                target_word_count=user_data.get("target_word_count", 100),
            )
        else:
            prompt = CERTIFICATIONS_PROMPTS["improve"].format(
                certification_name=user_data.get("certification_name", ""),
                issuer=user_data.get("issuer", ""),
                keywords=user_data.get("keywords", ""),
                current_text=current_certs,
                target_word_count=user_data.get("target_word_count", 100),
            )

        response_text = self._generate_text(prompt, "certifications")
        fallback_seed = current_certs or user_data.get("current_text") or response_text
        return self._normalize_option_response(response_text, fallback_seed)

    def generate_education(
        self,
        user_data: Dict,
        action: str,
        current_education: str = "",
    ) -> Dict:
        if action == "generate":
            prompt = EDUCATION_PROMPTS["generate"].format(
                degree=user_data.get("degree", "Bachelor's Degree"),
                field=user_data.get("field", "Computer Science"),
                university=user_data.get("university", "University"),
                year=user_data.get("year", "2024"),
                coursework=user_data.get("coursework", ""),
                keywords=user_data.get("keywords", ""),
                current_text=current_education or user_data.get("current_text", ""),
                target_word_count=user_data.get("target_word_count", 150),
            )
        else:
            prompt = EDUCATION_PROMPTS["improve"].format(
                degree=user_data.get("degree", "Bachelor's Degree"),
                field=user_data.get("field", "Computer Science"),
                university=user_data.get("university", "University"),
                keywords=user_data.get("keywords", ""),
                current_text=current_education,
                target_word_count=user_data.get("target_word_count", 150),
            )

        response_text = self._generate_text(prompt, "education")
        fallback_seed = current_education or user_data.get("current_text") or response_text
        return self._normalize_option_response(response_text, fallback_seed)

    def generate_skills(self, user_data: Dict) -> Dict:
        prompt = SKILLS_PROMPTS["generate"].format(
            title=user_data.get("title", "Professional"),
            current_skills=user_data.get("current_skills", ""),
            level=user_data.get("level", "Intermediate"),
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
            return {
                "technical": technical,
                "soft": soft,
                "tools": tools,
            }

        fallback_skills = [
            self._clean_text(item)
            for item in re.split(r"[\n,•-]+", response_text)
            if self._clean_text(item)
        ]
        return {
            "technical": fallback_skills[:7],
            "soft": [],
            "tools": [],
        }


vertex_service = VertexAIService()
