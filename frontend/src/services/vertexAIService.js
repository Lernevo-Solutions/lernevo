import axios from "axios";

const DEFAULT_AI_API_URL =
  process.env.REACT_APP_AI_API_URL || "http://127.0.0.1:8000/api/ai";

class VertexAIService {
  getResumeId(resumeId) {
    return resumeId || localStorage.getItem("resumeId");
  }

  getToken() {
    return localStorage.getItem("token");
  }

  getHeaders() {
    const token = this.getToken();
    return token
      ? {
          Authorization: `Token ${token}`,
        }
      : {};
  }

  buildError(error, fallbackMessage) {
    const detail =
      error?.response?.data?.detail ||
      error?.response?.data?.error ||
      error?.message ||
      fallbackMessage;

    return new Error(detail);
  }

  async post(path, payload) {
    const response = await axios.post(`${DEFAULT_AI_API_URL}/${path}/`, payload, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${DEFAULT_AI_API_URL}/health/`);
      return response.data;
    } catch (error) {
      console.error("Health check failed:", error);
      throw this.buildError(error, "AI health check failed.");
    }
  }

  async generateSummary(
    resumeId,
    {
      action = "generate",
      title = "",
      skills = "",
      keywords = "",
      experienceContext = "",
      currentText = "",
    } = {}
  ) {
    try {
      return await this.post("summary", {
        resume_id: this.getResumeId(resumeId),
        action,
        title,
        skills,
        keywords,
        experience_context: experienceContext,
        current_text: currentText,
      });
    } catch (error) {
      console.error("Summary generation failed:", error);
      throw this.buildError(error, "Failed to generate summary.");
    }
  }

  async generateProjects(
    resumeId,
    {
      action = "generate",
      title = "",
      projectName = "",
      techStack = "",
      keywords = "",
      context = "",
      currentText = "",
      numProjects = 3,
    } = {}
  ) {
    try {
      return await this.post("projects", {
        resume_id: this.getResumeId(resumeId),
        action,
        title,
        project_name: projectName,
        tech_stack: techStack,
        keywords,
        context,
        current_text: currentText,
        num_projects: numProjects,
      });
    } catch (error) {
      console.error("Projects generation failed:", error);
      throw this.buildError(error, "Failed to generate projects.");
    }
  }

  async generateExperience(
    resumeId,
    {
      action = "generate",
      company = "",
      role = "",
      responsibilities = "",
      keywords = "",
      currentText = "",
    } = {}
  ) {
    try {
      return await this.post("experience", {
        resume_id: this.getResumeId(resumeId),
        action,
        company,
        role,
        responsibilities,
        keywords,
        current_text: currentText,
      });
    } catch (error) {
      console.error("Experience generation failed:", error);
      throw this.buildError(error, "Failed to generate experience.");
    }
  }

  async generateCertifications(
    resumeId,
    {
      action = "generate",
      title = "",
      skills = "",
      certificationName = "",
      issuer = "",
      keywords = "",
      currentText = "",
      industry = "Technology",
    } = {}
  ) {
    try {
      return await this.post("certifications", {
        resume_id: this.getResumeId(resumeId),
        action,
        title,
        skills,
        certification_name: certificationName,
        issuer,
        keywords,
        current_text: currentText,
        industry,
      });
    } catch (error) {
      console.error("Certifications generation failed:", error);
      throw this.buildError(error, "Failed to generate certifications.");
    }
  }

  async generateEducation(
    resumeId,
    {
      action = "generate",
      degree = "",
      field = "",
      university = "",
      year = "",
      coursework = "",
      keywords = "",
      currentText = "",
    } = {}
  ) {
    try {
      return await this.post("education", {
        resume_id: this.getResumeId(resumeId),
        action,
        degree,
        field,
        university,
        year,
        coursework,
        keywords,
        current_text: currentText,
      });
    } catch (error) {
      console.error("Education generation failed:", error);
      throw this.buildError(error, "Failed to generate education.");
    }
  }

  async suggestSkills(resumeId, level = "Intermediate") {
    try {
      const response = await axios.post(
        `${DEFAULT_AI_API_URL}/skills/`,
        {
          resume_id: this.getResumeId(resumeId),
          level,
        },
        {
          headers: this.getHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Skills suggestion failed:", error);
      throw this.buildError(error, "Failed to suggest skills.");
    }
  }
}

const vertexAIService = new VertexAIService();

export default vertexAIService;
