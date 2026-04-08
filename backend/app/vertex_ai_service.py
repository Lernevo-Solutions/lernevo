# backend/app/vertex_ai_service.py
import json
import logging
from typing import Dict, Any, Optional
from vertexai.preview.generative_models import GenerativeModel, GenerationConfig
from vertexai import init
from django.conf import settings
from .vertex_ai_prompts import (
    SUMMARY_PROMPTS, PROJECTS_PROMPTS, EXPERIENCE_PROMPTS,
    CERTIFICATIONS_PROMPTS, EDUCATION_PROMPTS, SKILLS_PROMPTS
)

logger = logging.getLogger(__name__)

class VertexAIService:
    """Vertex AI Service for Resume Builder"""
    
    def __init__(self):
        try:
            init(
                project=settings.VERTEX_PROJECT_ID,
                location=settings.VERTEX_LOCATION,
            )
            self.model = GenerativeModel("gemini-1.5-flash")
            self.config = GenerationConfig(
                temperature=0.7,
                top_p=0.95,
                max_output_tokens=2048,
            )
            logger.info("Vertex AI initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Vertex AI: {e}")
            raise
    
    def generate_summary(self, user_data: Dict, action: str, current_text: str = "") -> str:
        """Generate or improve professional summary"""
        try:
            if action == 'generate':
                prompt = SUMMARY_PROMPTS['generate'].format(
                    title=user_data.get('title', 'Professional'),
                    skills=user_data.get('skills', ''),
                    experience_context=user_data.get('experience_context', '')
                )
            else:
                prompt = SUMMARY_PROMPTS['improve'].format(
                    current_text=current_text,
                    title=user_data.get('title', 'Professional'),
                    skills=user_data.get('skills', '')
                )
            
            response = self.model.generate_content(prompt, generation_config=self.config)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            raise
    
    def generate_projects(self, user_data: Dict, action: str, current_projects: str = "") -> str:
        """Generate or improve projects section"""
        try:
            if action == 'generate':
                prompt = PROJECTS_PROMPTS['generate'].format(
                    num_projects=user_data.get('num_projects', 3),
                    title=user_data.get('title', 'Developer'),
                    tech_stack=user_data.get('tech_stack', ''),
                    context=user_data.get('context', '')
                )
            else:
                prompt = PROJECTS_PROMPTS['improve'].format(
                    current_projects=current_projects,
                    title=user_data.get('title', 'Developer')
                )
            
            response = self.model.generate_content(prompt, generation_config=self.config)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Error generating projects: {e}")
            raise
    
    def generate_experience(self, user_data: Dict, action: str, current_bullets: str = "") -> str:
        """Generate or improve experience bullets"""
        try:
            if action == 'generate':
                prompt = EXPERIENCE_PROMPTS['generate'].format(
                    role=user_data.get('role', 'Professional'),
                    company=user_data.get('company', 'Company'),
                    duration=user_data.get('duration', 'Present'),
                    responsibilities=user_data.get('responsibilities', ''),
                    tech=user_data.get('tech_stack', '')
                )
            else:
                prompt = EXPERIENCE_PROMPTS['improve'].format(
                    current_bullets=current_bullets,
                    role=user_data.get('role', 'Professional')
                )
            
            response = self.model.generate_content(prompt, generation_config=self.config)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Error generating experience: {e}")
            raise
    
    def generate_certifications(self, user_data: Dict, action: str, current_certs: str = "") -> Dict:
        """Generate or improve certifications"""
        try:
            if action == 'generate':
                prompt = CERTIFICATIONS_PROMPTS['generate'].format(
                    title=user_data.get('title', 'Professional'),
                    skills=user_data.get('skills', ''),
                    industry=user_data.get('industry', 'Technology')
                )
            else:
                prompt = CERTIFICATIONS_PROMPTS['improve'].format(
                    current_certs=current_certs
                )
            
            response = self.model.generate_content(prompt, generation_config=self.config)
            
            # Try to parse as JSON
            try:
                return json.loads(response.text)
            except:
                return {'certifications': [{'name': line.strip()} for line in response.text.split('\n') if line.strip()]}
        except Exception as e:
            logger.error(f"Error generating certifications: {e}")
            raise
    
    def generate_education(self, user_data: Dict, action: str, current_education: str = "") -> str:
        """Generate or improve education section"""
        try:
            if action == 'generate':
                prompt = EDUCATION_PROMPTS['generate'].format(
                    degree=user_data.get('degree', "Bachelor's Degree"),
                    field=user_data.get('field', 'Computer Science'),
                    university=user_data.get('university', 'University'),
                    year=user_data.get('year', '2024'),
                    coursework=user_data.get('coursework', '')
                )
            else:
                prompt = EDUCATION_PROMPTS['improve'].format(
                    current_education=current_education
                )
            
            response = self.model.generate_content(prompt, generation_config=self.config)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Error generating education: {e}")
            raise
    
    def generate_skills(self, user_data: Dict) -> Dict:
        """Generate skill suggestions"""
        try:
            prompt = SKILLS_PROMPTS['generate'].format(
                title=user_data.get('title', 'Professional'),
                current_skills=user_data.get('current_skills', ''),
                level=user_data.get('level', 'Intermediate')
            )
            
            response = self.model.generate_content(prompt, generation_config=self.config)
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Error generating skills: {e}")
            raise


# Singleton instance
vertex_service = VertexAIService()