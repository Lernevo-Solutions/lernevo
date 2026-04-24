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

  async healthCheck() {
    try {
      const response = await axios.get(`${DEFAULT_AI_API_URL}/health/`);
      return response.data;
    } catch (error) {
      console.error("Health check failed:", error);
      throw this.buildError(error, "AI health check failed.");
    }
  }

  async generateSummary(resumeId, action = "generate", experienceContext = "") {
    try {
      const response = await axios.post(
        `${DEFAULT_AI_API_URL}/summary/`,
        {
          resume_id: this.getResumeId(resumeId),
          action,
          experience_context: experienceContext,
        },
        {
          headers: this.getHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Summary generation failed:", error);
      throw this.buildError(error, "Failed to generate summary.");
    }
  }

  async generateProjects(resumeId, action = "generate", context = "", numProjects = 3) {
    try {
      const response = await axios.post(
        `${DEFAULT_AI_API_URL}/projects/`,
        {
          resume_id: this.getResumeId(resumeId),
          action,
          context,
          num_projects: numProjects,
        },
        {
          headers: this.getHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Projects generation failed:", error);
      throw this.buildError(error, "Failed to generate projects.");
    }
  }

  async generateExperience(
    resumeId,
    action = "generate",
    company = "",
    role = "",
    responsibilities = ""
  ) {
    try {
      const response = await axios.post(
        `${DEFAULT_AI_API_URL}/experience/`,
        {
          resume_id: this.getResumeId(resumeId),
          action,
          company,
          role,
          responsibilities,
        },
        {
          headers: this.getHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Experience generation failed:", error);
      throw this.buildError(error, "Failed to generate experience.");
    }
  }

  async generateCertifications(resumeId, action = "generate", industry = "Technology") {
    try {
      const response = await axios.post(
        `${DEFAULT_AI_API_URL}/certifications/`,
        {
          resume_id: this.getResumeId(resumeId),
          action,
          industry,
        },
        {
          headers: this.getHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Certifications generation failed:", error);
      throw this.buildError(error, "Failed to generate certifications.");
    }
  }

  async generateEducation(resumeId, action = "generate", degree = "", field = "", university = "") {
    try {
      const response = await axios.post(
        `${DEFAULT_AI_API_URL}/education/`,
        {
          resume_id: this.getResumeId(resumeId),
          action,
          degree,
          field,
          university,
        },
        {
          headers: this.getHeaders(),
        }
      );
      return response.data;
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
