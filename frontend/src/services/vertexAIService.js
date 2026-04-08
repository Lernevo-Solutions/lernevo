// src/services/vertexAIService.js
import axios from 'axios';

// Local backend URL for testing (Django running on localhost:8000)
const LOCAL_API_URL = 'http://localhost:8000/api/ai';

class VertexAIService {
  constructor() {
    this.resumeId = localStorage.getItem('resumeId');
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${LOCAL_API_URL}/health/`);
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }

  async generateSummary(resumeId, action = 'generate', experienceContext = '') {
    try {
      const response = await axios.post(`${LOCAL_API_URL}/summary/`, {
        resume_id: resumeId || this.resumeId,
        action: action,
        experience_context: experienceContext
      });
      return response.data;
    } catch (error) {
      console.error('Summary generation failed:', error);
      throw error;
    }
  }

  async generateProjects(resumeId, action = 'generate', context = '', numProjects = 3) {
    try {
      const response = await axios.post(`${LOCAL_API_URL}/projects/`, {
        resume_id: resumeId || this.resumeId,
        action: action,
        context: context,
        num_projects: numProjects
      });
      return response.data;
    } catch (error) {
      console.error('Projects generation failed:', error);
      throw error;
    }
  }

  async generateExperience(resumeId, action = 'generate', company = '', role = '', responsibilities = '') {
    try {
      const response = await axios.post(`${LOCAL_API_URL}/experience/`, {
        resume_id: resumeId || this.resumeId,
        action: action,
        company: company,
        role: role,
        responsibilities: responsibilities
      });
      return response.data;
    } catch (error) {
      console.error('Experience generation failed:', error);
      throw error;
    }
  }

 async generateCertifications(resumeId, action = 'generate', industry = 'Technology') {
  try {
    const response = await axios.post(`${LOCAL_API_URL}/certifications/`, {
      resume_id: resumeId || this.resumeId,
      action: action,
      industry: industry
    });
    return response.data;
  } catch (error) {
    console.error('Certifications generation failed:', error);
    throw error;
  }
}

  async generateEducation(resumeId, action = 'generate', degree = '', field = '', university = '') {
    try {
      const response = await axios.post(`${LOCAL_API_URL}/education/`, {
        resume_id: resumeId || this.resumeId,
        action: action,
        degree: degree,
        field: field,
        university: university
      });
      return response.data;
    } catch (error) {
      console.error('Education generation failed:', error);
      throw error;
    }
  }


  async suggestSkills(resumeId, level = 'Intermediate') {
    try {
      const response = await axios.post(`${LOCAL_API_URL}/skills/`, {
        resume_id: resumeId || this.resumeId,
        level: level
      });
      return response.data;
    } catch (error) {
      console.error('Skills suggestion failed:', error);
      throw error;
    }
  }
}


export default new VertexAIService();