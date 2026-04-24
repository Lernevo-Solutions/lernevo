import json
import logging
import re
from typing import Dict, Optional

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

    def generate_summary(
        self,
        user_data: Dict,
        action: str,
        current_text: str = "",
    ) -> str:
        if action == "generate":
            prompt = SUMMARY_PROMPTS["generate"].format(
                title=user_data.get("title", "Professional"),
                skills=user_data.get("skills", ""),
                experience_context=user_data.get("experience_context", ""),
            )
        else:
            prompt = SUMMARY_PROMPTS["improve"].format(
                current_text=current_text,
                title=user_data.get("title", "Professional"),
                skills=user_data.get("skills", ""),
            )

        return self._generate_text(prompt, "summary")

    def generate_projects(
        self,
        user_data: Dict,
        action: str,
        current_projects: str = "",
    ) -> str:
        if action == "generate":
            prompt = PROJECTS_PROMPTS["generate"].format(
                num_projects=user_data.get("num_projects", 3),
                title=user_data.get("title", "Developer"),
                tech_stack=user_data.get("tech_stack", ""),
                context=user_data.get("context", ""),
            )
        else:
            prompt = PROJECTS_PROMPTS["improve"].format(
                current_projects=current_projects,
                title=user_data.get("title", "Developer"),
            )

        return self._generate_text(prompt, "projects")

    def generate_experience(
        self,
        user_data: Dict,
        action: str,
        current_bullets: str = "",
    ) -> str:
        if action == "generate":
            prompt = EXPERIENCE_PROMPTS["generate"].format(
                role=user_data.get("role", "Professional"),
                company=user_data.get("company", "Company"),
                duration=user_data.get("duration", "Present"),
                responsibilities=user_data.get("responsibilities", ""),
                tech=user_data.get("tech_stack", ""),
            )
        else:
            prompt = EXPERIENCE_PROMPTS["improve"].format(
                current_bullets=current_bullets,
                role=user_data.get("role", "Professional"),
            )

        return self._generate_text(prompt, "experience")

    def generate_certifications(
        self,
        user_data: Dict,
        action: str,
        current_certs: str = "",
    ) -> Dict:
        if action == "generate":
            prompt = CERTIFICATIONS_PROMPTS["generate"].format(
                title=user_data.get("title", "Professional"),
                skills=user_data.get("skills", ""),
                industry=user_data.get("industry", "Technology"),
            )
        else:
            prompt = CERTIFICATIONS_PROMPTS["improve"].format(current_certs=current_certs)

        response_text = self._generate_text(prompt, "certifications")

        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            return {
                "certifications": [
                    {"name": line}
                    for line in response_text.splitlines()
                    if line.strip()
                ]
            }

    def generate_education(
        self,
        user_data: Dict,
        action: str,
        current_education: str = "",
    ) -> str:
        if action == "generate":
            prompt = EDUCATION_PROMPTS["generate"].format(
                degree=user_data.get("degree", "Bachelor's Degree"),
                field=user_data.get("field", "Computer Science"),
                university=user_data.get("university", "University"),
                year=user_data.get("year", "2024"),
                coursework=user_data.get("coursework", ""),
            )
        else:
            prompt = EDUCATION_PROMPTS["improve"].format(
                current_education=current_education
            )

        return self._generate_text(prompt, "education")

    def generate_skills(self, user_data: Dict) -> Dict:
        prompt = SKILLS_PROMPTS["generate"].format(
            title=user_data.get("title", "Professional"),
            current_skills=user_data.get("current_skills", ""),
            level=user_data.get("level", "Intermediate"),
        )

        response_text = self._generate_text(prompt, "skills")

        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            return {"raw": response_text}


vertex_service = VertexAIService()
